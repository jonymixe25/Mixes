import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { Video, Mic, MicOff, VideoOff, Settings, Users, User, Power, ShieldCheck, LogOut, Circle, Square, Loader2, Phone, PhoneCall } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Room, RoomEvent, Track, createLocalTracks, LocalVideoTrack, LocalAudioTrack } from "livekit-client";
import { useUser } from "../contexts/UserContext";
import { useSocket } from "../contexts/SocketContext";
import Chat from "../components/Chat";

import { saveRecording } from "../utils/videoStorage";

export default function Broadcast() {
  const { user, loading: userLoading, logout } = useUser();
  const { socket, connected: socketConnected } = useSocket();
  const [streamName, setStreamName] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [connecting, setConnecting] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const localVideoTrackRef = useRef<LocalVideoTrack | null>(null);
  const localAudioTrackRef = useRef<LocalAudioTrack | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    if (user) {
      socket.emit("register_user", user.name);
    }

    socket.on("viewers_count", (count: number) => {
      setViewers(count);
    });

    socket.on("user_list", (users: any[]) => {
      setOnlineUsers(users.filter(u => u.id !== socket.id));
    });

    return () => {
      stopBroadcast();
      if (timerRef.current) clearInterval(timerRef.current);
      socket.off("viewers_count");
      socket.off("user_list");
    };
  }, [socket, user]);

  const callUser = (targetSocketId: string, targetName: string) => {
    if (!socket) return;
    socket.emit("call_user", { to: targetSocketId, fromName: user?.name || "Locutor" });
    alert(`Llamando a ${targetName}...`);
  };

  const startBroadcast = async () => {
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      alert("La transmisión requiere una conexión segura (HTTPS) para acceder a la cámara y el micrófono.");
      return;
    }

    if (!streamName.trim()) {
      alert("Por favor, ingresa un nombre para la transmisión");
      return;
    }

    setConnecting(true);
    try {
      console.log("Solicitando token a la API...");
      const response = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: streamName,
          participantName: user?.name || `Broadcaster-${Math.floor(Math.random() * 1000)}`,
          isBroadcaster: true
        })
      });
      
      if (!response.ok) {
        let errorMessage = 'Servidor no respondió correctamente';
        try {
          const text = await response.text();
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            console.error("Respuesta no-JSON recibida:", text.substring(0, 200));
            if (response.status === 404) errorMessage = "Ruta de API no encontrada (404). El servidor podría estar reiniciándose o no ser compatible con el dominio actual.";
            else if (response.status >= 500) errorMessage = "Error interno del servidor (500). Revisa los logs.";
          }
        } catch (e) {
          errorMessage = "No se pudo leer la respuesta del servidor.";
        }
        throw new Error(`Error al obtener token (${response.status}): ${errorMessage}`);
      }
      
      const data = await response.json();
      const { token, serverUrl } = data;
      
      console.log("Datos de conexión recibidos:", { 
        hasToken: !!token, 
        serverUrl, 
        tokenLength: token?.length 
      });

      if (!serverUrl || typeof serverUrl !== 'string' || !serverUrl.startsWith('ws')) {
        console.error("URL de LiveKit inválida recibida:", serverUrl);
        throw new Error(`La URL del servidor de video es inválida: "${serverUrl}". Verifica la configuración de LIVEKIT_URL.`);
      }

      const room = new Room();
      roomRef.current = room;

      try {
        console.log("Intentando conectar a LiveKit en:", serverUrl);
        await room.connect(serverUrl, token);
        console.log("Conectado a LiveKit con éxito");
      } catch (connErr: any) {
        throw new Error(`Error de conexión LiveKit: ${connErr.message || 'No se pudo establecer conexión con el servidor de video'}`);
      }
      
      console.log("Solicitando permisos de cámara y micrófono...");
      let tracks;
      try {
        tracks = await createLocalTracks({
          audio: true,
          video: { resolution: { width: 1280, height: 720 } }
        });
      } catch (trackErr: any) {
        console.error("Permisos denegados:", trackErr);
        throw new Error(`Permisos denegados: Asegúrate de permitir el acceso a la cámara y micrófono en tu navegador.`);
      }

      console.log("Publicando tracks...");
      for (const track of tracks) {
        if (track.kind === Track.Kind.Video) {
          localVideoTrackRef.current = track as LocalVideoTrack;
          if (videoRef.current) {
            track.attach(videoRef.current);
          }
        } else if (track.kind === Track.Kind.Audio) {
          localAudioTrackRef.current = track as LocalAudioTrack;
        }
        await room.localParticipant.publishTrack(track);
      }

      socket?.emit("broadcaster", streamName);
      setIsLive(true);
      console.log("Transmisión iniciada!");
    } catch (err: any) {
      console.error("Error detallado:", err);
      alert(`Error: ${err.message || "Error desconocido al iniciar la transmisión."}`);
    } finally {
      setConnecting(false);
    }
  };

  const stopBroadcast = () => {
    if (isRecording) stopRecording();
    
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }

    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.stop();
      localVideoTrackRef.current = null;
    }
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current = null;
    }

    setIsLive(false);
    socket?.emit("stop_broadcasting");
  };

  const toggleMute = () => {
    if (localAudioTrackRef.current) {
      const muted = localAudioTrackRef.current.isMuted;
      if (muted) {
        localAudioTrackRef.current.unmute();
      } else {
        localAudioTrackRef.current.mute();
      }
      setIsMuted(!muted);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrackRef.current) {
      const muted = localVideoTrackRef.current.isMuted;
      if (muted) {
        localVideoTrackRef.current.unmute();
      } else {
        localVideoTrackRef.current.mute();
      }
      setIsVideoOff(!muted);
    }
  };

  const startRecording = () => {
    if (!localVideoTrackRef.current || !localAudioTrackRef.current) return;

    const stream = new MediaStream([
      localVideoTrackRef.current.mediaStreamTrack,
      localAudioTrackRef.current.mediaStreamTrack
    ]);

    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9,opus"
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const duration = (Date.now() - startTimeRef.current) / 1000;
      
      try {
        await saveRecording(blob, duration, streamName || `Transmisión de ${user?.name || "Vida Mixe"}`);
      } catch (err) {
        console.error("Error saving recording:", err);
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vida-mixe-broadcast-${new Date().toISOString()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    startTimeRef.current = Date.now();
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v < 10 ? "0" + v : v).filter((v, i) => v !== "00" || i > 0).join(":");
  };

  const handleLogout = async () => {
    stopBroadcast();
    await logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-brand-bg text-neutral-50 flex flex-col">
      <Helmet>
        <title>Panel de Transmisión | Vida Mixe TV</title>
      </Helmet>

      {window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && (
        <div className="bg-red-500 text-white text-center py-2 text-[10px] font-bold animate-pulse z-[100] uppercase tracking-widest">
          ⚠️ Estás usando una conexión no segura (HTTP). El video y audio NO funcionarán. Por favor usa HTTPS://SEXMIXE.LAT
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Video Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {!isLive && !connecting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900 z-10 p-6 text-center">
              <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6">
                <Video className="w-12 h-12 text-brand-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Listo para transmitir</h2>
              <p className="text-neutral-400 max-w-xs mb-8">Ingresa un nombre para tu transmisión y presiona el botón para comenzar.</p>
              
              <div className="w-full max-w-sm space-y-4">
                <input
                  type="text"
                  value={streamName}
                  onChange={(e) => setStreamName(e.target.value)}
                  placeholder="Nombre de la transmisión..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-brand-primary/50 transition-all text-center"
                />
                <button 
                  onClick={startBroadcast}
                  className="w-full py-4 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
                >
                  <Power className="w-5 h-5" />
                  Iniciar Transmisión
                </button>
              </div>
            </div>
          )}

          {connecting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900 z-20">
              <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
              <p className="text-neutral-400 font-medium">Conectando con el servidor de video...</p>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
          />
          
          {isVideoOff && isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900">
              <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
                <VideoOff className="w-12 h-12 text-brand-primary" />
              </div>
              <p className="text-neutral-500 font-medium">Cámara desactivada</p>
            </div>
          )}

          {/* Overlay Controls */}
          <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border ${isLive ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/10 border-white/10 text-neutral-400'}`}>
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-neutral-500'}`} />
                <span className="text-xs font-bold uppercase tracking-widest">{isLive ? 'En Vivo' : 'Offline'}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white">
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold">{viewers}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white" title="Estado del Servidor">
                <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="text-xs font-bold capitalize">{socketConnected ? 'Conectado' : 'Conectando...'}</span>
              </div>
            </div>
            
            {isRecording && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/20 border border-red-500 text-red-500 backdrop-blur-md w-fit">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">Grabando: {formatTime(recordingTime)}</span>
              </div>
            )}
          </div>

          {isLive && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl z-10">
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleMute}
                  className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  title={isMuted ? "Activar Micrófono" : "Silenciar Micrófono"}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                <button 
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  title={isVideoOff ? "Activar Cámara" : "Desactivar Cámara"}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </button>
              </div>

              <div className="w-px h-8 bg-white/10 mx-2" />

              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button 
                    onClick={startRecording}
                    className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                    title="Iniciar Grabación"
                  >
                    <Circle className="w-6 h-6 fill-red-500 text-red-500" />
                  </button>
                ) : (
                  <button 
                    onClick={stopRecording}
                    className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all"
                    title="Detener Grabación"
                  >
                    <Square className="w-6 h-6 fill-white" />
                  </button>
                )}
              </div>

              <div className="w-px h-8 bg-white/10 mx-2" />

              <button 
                onClick={stopBroadcast}
                className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full transition-all flex items-center gap-2 shadow-lg shadow-red-600/20"
              >
                <Power className="w-5 h-5" />
                <span>Detener</span>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-96 bg-brand-surface border-l border-white/5 flex flex-col z-20">
          <div className="p-6 border-b border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary/20 text-brand-primary rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500 animate-pulse'}`}></div>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${socketConnected ? 'text-green-500' : 'text-red-500'}`}>
                      {socketConnected ? 'Servidor Online' : 'Desconectado'}
                    </span>
                    {!socketConnected && (
                      <span className="text-[8px] text-red-500/50 animate-pulse">(Error de Red)</span>
                    )}
                  </div>
                  <h2 className="font-bold text-white leading-tight">Panel de Transmisión v1.1.5</h2>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{user?.name || "Locutor"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-neutral-500 hover:text-white transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Tabs */}
          <div className="flex border-b border-white/5 bg-black/20">
            <button 
              onClick={() => setShowUsers(false)}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${!showUsers ? 'text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5' : 'text-neutral-500 hover:text-white'}`}
            >
              Chat
            </button>
            <button 
              onClick={() => setShowUsers(true)}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${showUsers ? 'text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5' : 'text-neutral-500 hover:text-white'}`}
            >
              Usuarios ({onlineUsers.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!showUsers ? (
              <Chat socket={socket} isHost={true} />
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Usuarios en Línea</h3>
                {onlineUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                    <p className="text-neutral-500 text-sm">No hay otros usuarios conectados</p>
                  </div>
                ) : (
                  onlineUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-brand-primary transition-colors">{u.username}</p>
                          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">En línea</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => callUser(u.id, u.username)}
                        className="p-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl transition-all shadow-lg"
                        title="Video llamada 1v1"
                      >
                        <PhoneCall className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
