import React, { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Send, Trash2, User, Loader2, ShieldAlert } from "lucide-react";
import { moderateContent } from "../services/moderationService";

export interface ChatMessage {
  id: string;
  username: string;
  text: string;
  timestamp: number;
}

interface ChatProps {
  socket: Socket | null;
  isHost?: boolean;
  transparent?: boolean;
}

export default function Chat({ socket, isHost = false, transparent = false }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isModerating, setIsModerating] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(isHost);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHost) {
      setUsername("Anfitrión");
    }
  }, [isHost]);

  useEffect(() => {
    if (!socket) return;

    socket.on("chat_history", (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on("chat_message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("message_deleted", (messageId: string) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });

    return () => {
      socket.off("chat_history");
      socket.off("chat_message");
      socket.off("message_deleted");
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !isUsernameSet || isModerating) return;

    setIsModerating(true);
    setModerationError(null);

    try {
      const moderation = await moderateContent(newMessage.trim(), "chat");
      
      if (!moderation.isAppropriate) {
        setModerationError(moderation.reason || "Mensaje bloqueado por moderación.");
        // Clear error after 3 seconds
        setTimeout(() => setModerationError(null), 3000);
        setIsModerating(false);
        return;
      }

      const message: ChatMessage = {
        id: Math.random().toString(36).substring(2, 15),
        username,
        text: newMessage.trim(),
        timestamp: Date.now(),
      };

      socket.emit("chat_message", message);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsModerating(false);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!socket || !isHost) return;
    socket.emit("delete_message", messageId);
  };

  const handleSetUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsUsernameSet(true);
      if (socket && !isHost) {
        socket.emit("register_user", username.trim());
      }
    }
  };

  if (!isUsernameSet) {
    return (
      <div className={`flex flex-col h-full ${transparent ? 'bg-black/50 backdrop-blur-sm' : 'bg-zinc-900 border-l border-zinc-800'} p-6 items-center justify-center`}>
        <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mb-6">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Únete al Chat</h3>
        <p className="text-zinc-400 text-center mb-6 text-sm">
          Ingresa un nombre de usuario para participar en la conversación.
        </p>
        <form onSubmit={handleSetUsername} className="w-full space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tu nombre..."
            className={`w-full ${transparent ? 'bg-black/50 border-white/10' : 'bg-zinc-950 border-zinc-800'} border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors`}
            maxLength={20}
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Entrar al Chat
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${transparent ? 'bg-black/50 backdrop-blur-sm' : 'bg-zinc-900 border-l border-zinc-800'}`}>
      <div className={`p-4 border-b ${transparent ? 'border-white/10 bg-black/20' : 'border-zinc-800 bg-zinc-900/50'}`}>
        <h3 className="font-semibold flex items-center gap-2">
          Chat en Vivo
          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
            Online
          </span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
            No hay mensajes aún. ¡Sé el primero en saludar!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="group relative pr-8">
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`font-medium text-sm ${msg.username === 'Anfitrión' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                  {msg.username}
                </span>
                <span className="text-xs text-zinc-600">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-zinc-300 text-sm break-words">{msg.text}</p>
              
              {isHost && (
                <button
                  onClick={() => handleDeleteMessage(msg.id)}
                  className="absolute right-0 top-0 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Eliminar mensaje"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`p-4 border-t ${transparent ? 'bg-black/20 border-white/10' : 'bg-zinc-900 border-zinc-800'}`}>
        {moderationError && (
          <div className="mb-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[10px] flex items-center gap-2">
            <ShieldAlert className="w-3 h-3" />
            <span>{moderationError}</span>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isModerating}
            placeholder={isModerating ? "Moderando..." : "Escribe un mensaje..."}
            className={`flex-1 ${transparent ? 'bg-black/50 border-white/10' : 'bg-zinc-950 border-zinc-800'} border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50`}
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isModerating}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl transition-colors flex-shrink-0 flex items-center justify-center min-w-[40px]"
          >
            {isModerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
