import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { AccessToken } from "livekit-server-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  
  const allowedOrigins = [
    "https://vidamixe.mx", 
    "https://www.vidamixe.mx", 
    "https://app-new-production-1af2.up.railway.app",
    "http://localhost:3000",
    process.env.APP_URL
  ].filter(Boolean) as string[];
  
  // Enable CORS for all routes
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.includes("ais-dev-") || origin.includes("ais-pre-")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
  }));
  
  app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
  const PORT = 3000;
  const httpServer = createServer(app);
  
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.includes("ais-dev-") || origin.includes("ais-pre-")) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Almacenar broadcasters: socket.id -> { id, name, viewers }
  const activeBroadcasters = new Map<string, { id: string, name: string, viewers: number }>();
  const chatHistory: any[] = [];
  // Almacenar usuarios conectados: socket.id -> { username, id }
  const users: { [id: string]: { username: string; id: string } } = {};

  const emitUserList = () => {
    const userList = Object.values(users);
    io.emit("user_list", userList);
  };

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("broadcaster", (streamName: string) => {
      activeBroadcasters.set(socket.id, { 
        id: socket.id, 
        name: streamName || `Transmisión de ${socket.id.slice(0, 4)}`,
        viewers: 0 
      });
      io.emit("broadcaster_list", Array.from(activeBroadcasters.values()));
    });

    socket.on("get_broadcasters", () => {
      socket.emit("broadcaster_list", Array.from(activeBroadcasters.values()));
    });

    socket.on("watcher", (broadcasterId: string) => {
      const b = activeBroadcasters.get(broadcasterId);
      if (b) {
        socket.to(broadcasterId).emit("watcher", socket.id);
        b.viewers++;
        io.emit("broadcaster_list", Array.from(activeBroadcasters.values()));
        // Emitir conteo específico al broadcaster
        io.to(broadcasterId).emit("viewers_count", b.viewers);
      }
      socket.emit("chat_history", chatHistory);
    });

    // Registro de usuario para el chat y lista de espectadores
    socket.on("register_user", (username: string) => {
      users[socket.id] = { username, id: socket.id };
      emitUserList();
    });

    // Signaling for 1v1 Calls
    socket.on("call_user", ({ to, fromName }) => {
      io.to(to).emit("incoming_call", { from: socket.id, fromName });
    });

    socket.on("accept_call", ({ to, roomName }) => {
      io.to(to).emit("call_accepted", { from: socket.id, roomName });
    });

    socket.on("reject_call", ({ to }) => {
      io.to(to).emit("call_rejected", { from: socket.id });
    });

    socket.on("end_call", ({ to }) => {
      io.to(to).emit("call_ended", { from: socket.id });
    });

    socket.on("chat_message", (message) => {
      chatHistory.push(message);
      if (chatHistory.length > 100) chatHistory.shift(); // Keep last 100 messages
      io.emit("chat_message", message);
    });

    socket.on("delete_message", (messageId) => {
      // Solo el broadcaster de la sala actual o un admin podría borrar
      // Por simplicidad, permitimos si el socket.id está en activeBroadcasters
      if (activeBroadcasters.has(socket.id)) {
        const index = chatHistory.findIndex(m => m.id === messageId);
        if (index !== -1) {
          chatHistory.splice(index, 1);
        }
        io.emit("message_deleted", messageId);
      }
    });

    socket.on("stop_broadcasting", () => {
      if (activeBroadcasters.has(socket.id)) {
        activeBroadcasters.delete(socket.id);
        io.emit("broadcaster_list", Array.from(activeBroadcasters.values()));
      }
    });

    socket.on("disconnect", () => {
      // Eliminar usuario de la lista
      if (users[socket.id]) {
        delete users[socket.id];
        emitUserList();
      }

      if (activeBroadcasters.has(socket.id)) {
        activeBroadcasters.delete(socket.id);
        socket.broadcast.emit("disconnectPeer", socket.id);
        io.emit("broadcaster_list", Array.from(activeBroadcasters.values()));
      } else {
        // Reducir viewers de todos los broadcasters donde este socket estaba mirando
        activeBroadcasters.forEach(b => {
          socket.to(b.id).emit("disconnectPeer", socket.id);
          // Opcional: decrementar viewers si sabemos que estaba mirando
          // Por simplicidad, el cliente debería avisar al salir de una sala
        });
      }
    });
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    console.log("GET /api/health");
    res.json({ status: "ok" });
  });

  app.post("/api/livekit/token", async (req, res) => {
    try {
      const { roomName, participantName, isBroadcaster } = req.body;
      const apiKey = process.env.LIVEKIT_API_KEY;
      const apiSecret = process.env.LIVEKIT_API_SECRET;

      if (!apiKey || !apiSecret) {
        throw new Error("LiveKit API Key or Secret not configured");
      }

      const at = new AccessToken(apiKey, apiSecret, {
        identity: participantName || `user-${Math.floor(Math.random() * 10000)}`,
      });

      at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: isBroadcaster,
        canSubscribe: true,
      });

      const token = await at.toJwt();
      res.json({ token });
    } catch (error) {
      console.error("Error generating token:", error);
      res.status(500).json({ error: "Failed to generate token" });
    }
  });

  // Catch-all for API routes to prevent falling through to Vite
  app.all("/api/*", (req, res) => {
    console.log(`404 API: ${req.method} ${req.url}`);
    res.status(404).json({ error: `Ruta de API no encontrada: ${req.url}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
