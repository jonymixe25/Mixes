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
    // Use standard transports for maximum compatibility across different networks
    const s = io({
      transports: ["polling", "websocket"],
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
      timeout: 30000,
      autoConnect: true,
      withCredentials: true,
      path: "/socket.io/"
    });
    setSocket(s);

    s.on("connect", () => {
      console.log(`Socket.io unido con éxito! ID: ${s.id} | Transporte: ${s.io.engine.transport.name}`);
      setConnected(true);
    });
    
    s.on("disconnect", (reason) => {
      console.log("Socket.io disconnected:", reason);
      setConnected(false);
    });

    s.on("connect_error", (err) => {
      console.error("Socket.io connection error detail:", err.message);
    });

    // Added event to track transport upgrades
    s.io.engine.on("upgrade", (transport) => {
      console.log("Socket.io transport upgraded to:", transport.name);
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
