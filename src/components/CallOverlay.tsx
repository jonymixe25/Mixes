import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useUser } from "../contexts/UserContext";
import { Room, RoomEvent, createLocalTracks, RemoteParticipant, RemoteTrack, RemoteTrackPublication, Track } from "livekit-client";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, X, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CallState {
  status: "idle" | "incoming" | "outgoing" | "connected";
  remoteSocketId?: string;
  remoteName?: string;
  roomName?: string;
}

export default function CallOverlay() {
  const { socket } = useSocket();
  const { user } = useUser();
  const [call, setCall] = useState<CallState>({ status: "idle" });
  const [room, setRoom] = useState<Room | null>(null);
  const [remoteParticipant, setRemoteParticipant] = useState<RemoteParticipant | null>(null);
  const [localTracks, setLocalTracks] = useState<any[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("incoming_call", ({ from, fromName }) => {
      if (call.status !== "idle") {
        socket.emit("reject_call", { to: from });
        return;
      }
      setCall({ status: "incoming", remoteSocketId: from, remoteName: fromName });
    });

    socket.on("call_accepted", ({ from, roomName }) => {
      joinCallRoom(roomName, from);
    });

    socket.on("call_rejected", () => {
      setCall({ status: "idle" });
      alert("La llamada fue rechazada.");
    });

    socket.on("call_ended", () => {
      endCall();
    });

    return () => {
      socket.off("incoming_call");
      socket.off("call_accepted");
      socket.off("call_rejected");
      socket.off("call_ended");
    };
  }, [socket, call.status]);

  const joinCallRoom = async (roomName: string, remoteSocketId: string) => {
    try {
      const response = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName,
          participantName: user?.name || "Usuario",
          isBroadcaster: true // Both are broadcasters in a 1v1 call
        })
      });
      
      if (!response.ok) throw new Error("Failed to get token");
      const { token, serverUrl } = await response.json();

      const newRoom = new Room();
      setRoom(newRoom);

      newRoom.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        setRemoteParticipant(participant);
        if (track.kind === Track.Kind.Video && remoteVideoRef.current) {
          track.attach(remoteVideoRef.current);
        }
      });

      newRoom.on(RoomEvent.ParticipantConnected, (p) => setRemoteParticipant(p));
      newRoom.on(RoomEvent.ParticipantDisconnected, () => endCall());

      await newRoom.connect(serverUrl, token);
      
      const tracks = await createLocalTracks({
        audio: true,
        video: { resolution: { width: 640, height: 480 } }
      });
      setLocalTracks(tracks);

      for (const track of tracks) {
        if (track.kind === Track.Kind.Video && localVideoRef.current) {
          track.attach(localVideoRef.current);
        }
        await newRoom.localParticipant.publishTrack(track);
      }

      setCall(prev => ({ ...prev, status: "connected", roomName, remoteSocketId }));
    } catch (err) {
      console.error("Error joining call room:", err);
      endCall();
    }
  };

  const acceptCall = () => {
    const roomName = `call_${Date.now()}`;
    socket?.emit("accept_call", { to: call.remoteSocketId, roomName });
    joinCallRoom(roomName, call.remoteSocketId!);
  };

  const rejectCall = () => {
    socket?.emit("reject_call", { to: call.remoteSocketId });
    setCall({ status: "idle" });
  };

  const endCall = () => {
    room?.disconnect();
    localTracks.forEach(t => t.stop());
    setRoom(null);
    setLocalTracks([]);
    setRemoteParticipant(null);
    if (call.remoteSocketId) {
      socket?.emit("end_call", { to: call.remoteSocketId });
    }
    setCall({ status: "idle" });
  };

  return (
    <AnimatePresence>
      {call.status !== "idle" && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          {call.status === "incoming" && (
            <div className="bg-brand-surface border border-white/10 p-8 rounded-[2.5rem] text-center space-y-6 shadow-2xl max-w-sm w-full animate-bounce-slow">
              <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Video className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Llamada Entrante</h3>
                <p className="text-neutral-400">{call.remoteName || "Alguien"} quiere hablar contigo</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={rejectCall}
                  className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <PhoneOff className="w-5 h-5" />
                  Rechazar
                </button>
                <button 
                  onClick={acceptCall}
                  className="flex-1 py-4 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Aceptar
                </button>
              </div>
            </div>
          )}

          {call.status === "connected" && (
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
              {/* Remote Video */}
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              {!remoteParticipant && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900">
                  <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
                    <User className="w-10 h-10 text-neutral-500" />
                  </div>
                  <p className="text-neutral-400 font-medium">Conectando...</p>
                </div>
              )}

              {/* Local Video Picture-in-Picture */}
              <div className="absolute bottom-8 right-8 w-64 aspect-video bg-stone-800 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Controls */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full">
                <button onClick={endCall} className="w-14 h-14 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all shadow-lg shadow-red-900/20">
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>

              {/* Info Overlay */}
              <div className="absolute top-8 left-8 flex items-center gap-3">
                <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/10">
                  En llamada con: {call.remoteName || "Usuario"}
                </div>
              </div>
            </div>
          )}

          {call.status === "outgoing" && (
            <div className="bg-brand-surface border border-white/10 p-8 rounded-[2.5rem] text-center space-y-6 shadow-2xl max-w-sm w-full">
              <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Video className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Llamando...</h3>
                <p className="text-neutral-400">Esperando a que {call.remoteName} responda</p>
              </div>
              <button 
                onClick={endCall}
                className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
