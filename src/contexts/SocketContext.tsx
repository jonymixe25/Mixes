import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Explicitly use websocket transport for better reliability in proxied environments
    // Disable cookies to avoid sticky session issues in serverless
    const s = io({
      transports: ["websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
    setSocket(s);

    s.on("connect", () => {
      console.log("Socket.io connected successfully:", s.id);
      setConnected(true);
    });
    
    s.on("disconnect", (reason) => {
      console.log("Socket.io disconnected:", reason);
      setConnected(false);
    });

    s.on("connect_error", (err) => {
      console.error("Socket.io connection error detail:", err.message);
      // Fallback to polling if websocket fails (optional, but let's stick to WS for sexmixe.lat)
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
