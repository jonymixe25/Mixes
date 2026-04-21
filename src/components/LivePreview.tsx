import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { MonitorPlay, Users, Play, VolumeX, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Room, RoomEvent } from "livekit-client";
import { Link } from "react-router-dom";
import { ShareButton } from "./ShareButton";

export default function LivePreview() {
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [streamName, setStreamName] = useState("");
  const [broadcaster, setBroadcaster] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://app-new-production-1af2.up.railway.app";
    const socket = io(backendUrl);

    socket.on("broadcaster_list", (list: any[]) => {
      if (list.length > 0) {
        setIsLive(true);
        setStreamName(list[0].name);
        setViewers(list.reduce((acc: number, b: any) => acc + b.viewers, 0));
        setBroadcaster(list[0]);
      } else {
        setIsLive(false);
        setBroadcaster(null);
        if (roomRef.current) {
          roomRef.current.disconnect();
          roomRef.current = null;
        }
      }
    });

    socket.emit("get_broadcasters");

    return () => {
      socket.disconnect();
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (broadcaster && !roomRef.current) {
      const connectToRoom = async () => {
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://app-new-production-1af2.up.railway.app";
          const response = await fetch(`${backendUrl}/api/livekit/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomName: broadcaster.name,
              participantName: `Preview-${Math.floor(Math.random() * 1000)}`,
              isBroadcaster: false
            })
          });
          
          if (!response.ok) return;
          
          const { token } = await response.json();
          const room = new Room();
          roomRef.current = room;

          room.on(RoomEvent.TrackSubscribed, (track) => {
            if (videoRef.current) {
              track.attach(videoRef.current);
            }
          });

          await room.connect('wss://new-app-6tu2ilh8.livekit.cloud', token);
        } catch (error) {
          console.error("Error connecting to LiveKit room for preview:", error);
        }
      };
      
      connectToRoom();
    }
  }, [broadcaster]);

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <Link to="/view" className="block relative aspect-video bg-stone-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group">
      <AnimatePresence mode="wait">
        {isLive ? (
          <motion.div 
            key="live"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            <div className="absolute top-6 left-6 flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-full text-[10px] font-bold uppercase tracking-widest text-white animate-pulse">
                En Vivo
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white">
                <Users className="w-3 h-3" />
                {viewers}
              </div>
            </div>

            <div className="absolute top-6 right-6 flex gap-2">
              <button 
                onClick={toggleMute}
                className="p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/10 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <ShareButton url={window.location.href} title="¡Mira nuestra transmisión en vivo!" />
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <h4 className="text-white font-bold text-lg truncate mb-1">{streamName}</h4>
              <p className="text-neutral-400 text-xs uppercase tracking-widest font-medium">Sintonizando ahora</p>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="w-16 h-16 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-brand-primary/40 scale-90 group-hover:scale-100 transition-transform">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="offline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-8 text-center"
          >
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-neutral-700">
              <MonitorPlay className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white font-bold">Sin transmisiones</h4>
              <p className="text-neutral-500 text-sm">Vuelve pronto para ver contenido en vivo de la comunidad.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
}
