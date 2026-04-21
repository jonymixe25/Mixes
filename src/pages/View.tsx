import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Room, RoomEvent, Track } from "livekit-client";
import { MonitorPlay, Users, MessageSquare, Send, Heart, Share2, Volume2, VolumeX, Maximize2, RefreshCw, Play, Pause, Minimize2, X, HelpCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "motion/react";
import Chat from "../components/Chat";

export default function View() {
  const [broadcasters, setBroadcasters] = useState<any[]>([]);
  const [selectedBroadcaster, setSelectedBroadcaster] = useState<any>(null);
  const [viewers, setViewers] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [username, setUsername] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [socketStatus, setSocketStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [showTutorial, setShowTutorial] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    // Show tutorial for new users
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem("hasSeenTutorial", "true");
    }
  }, []);

  const shareUrl = window.location.href;
  const shareText = "¡Mira esta transmisión en Vida Mixe TV!";

  const handleShare = async (platform: 'whatsapp' | 'facebook' | 'native') => {
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({ title: "Vida Mixe TV", url: shareUrl });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    }
    setShowShareMenu(false);
  };

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://app-new-production-1af2.up.railway.app";
    const socket = io(backendUrl);
    socketRef.current = socket;

    socket.on("connect", () => setSocketStatus("connected"));
    socket.on("disconnect", () => setSocketStatus("disconnected"));
    socket.on("connect_error", () => setSocketStatus("disconnected"));

    socket.on("broadcaster_list", (list: any[]) => {
      setBroadcasters(list);
    });

    socket.emit("get_broadcasters");

    socket.on("viewers_count", (count: number) => {
      setViewers(count);
    });

    socket.on("disconnectPeer", () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    });

    return () => {
      socket.disconnect();
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  const joinStream = async (broadcaster: any) => {
    setSelectedBroadcaster(broadcaster);
    socketRef.current?.emit("watcher", broadcaster.id);

    if (roomRef.current) {
      roomRef.current.disconnect();
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://app-new-production-1af2.up.railway.app";
      const response = await fetch(`${backendUrl}/api/livekit/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: broadcaster.name,
          participantName: username || `Espectador-${Math.floor(Math.random() * 1000)}`,
          isBroadcaster: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status} ${response.statusText}`);
      }
      
      const { token } = await response.json();

      const room = new Room();
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (videoRef.current) {
          track.attach(videoRef.current);
        }
      });

      await room.connect('wss://new-app-6tu2ilh8.livekit.cloud', token);
    } catch (error: any) {
      console.error("Error joining stream:", error);
      alert(`Error al conectar con el servidor de video: ${error.message || error}`);
    }
  };

  const reconnect = () => {
    if (selectedBroadcaster) {
      joinStream(selectedBroadcaster);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    socketRef.current?.emit("register_user", username);
    setIsRegistered(true);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (newMuted) {
        setVolume(0);
      } else {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [selectedBroadcaster]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-brand-bg text-neutral-50 flex flex-col">
      <Helmet>
        <title>Ver en Vivo | Vida Mixe TV</title>
      </Helmet>

      {!isRegistered ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-brand-surface border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-center space-y-8"
          >
            <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-3xl flex items-center justify-center mx-auto">
              <MonitorPlay className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">¡Bienvenido!</h1>
              <p className="text-neutral-400">Ingresa tu nombre para unirte a la transmisión y participar en el chat.</p>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu nombre o apodo"
                className="w-full bg-brand-bg border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-brand-primary/50 transition-all text-center text-lg"
              />
              <button 
                type="submit"
                className="w-full py-4 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand-primary/20"
              >
                Unirse ahora
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Video Player Area */}
            <div 
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => isPlaying && setShowControls(false)}
              className="flex-1 relative bg-black flex items-center justify-center overflow-hidden group/player"
            >
              {selectedBroadcaster ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    onClick={togglePlay}
                    className="w-full h-full object-contain cursor-pointer"
                  />
                  
                  {/* Player Controls Overlay */}
                  <AnimatePresence>
                    {showControls && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"
                      >
                        <div className="p-6 space-y-4 pointer-events-auto">
                          {/* Progress Bar (Seeker) - Mostly for UI/VOD support, stays at end for Live */}
                          <div className="group/progress relative h-1.5 w-full bg-white/20 rounded-full cursor-pointer overflow-hidden">
                            <div 
                              className="absolute top-0 left-0 h-full bg-brand-primary transition-all"
                              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                            />
                            <input 
                              type="range"
                              min="0"
                              max={duration || 0}
                              value={currentTime}
                              onChange={(e) => {
                                if (videoRef.current) {
                                  videoRef.current.currentTime = parseFloat(e.target.value);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2 sm:gap-6">
                              <button 
                                onClick={togglePlay} 
                                className="p-1 sm:p-2 text-white hover:text-brand-primary transition-colors"
                              >
                                {isPlaying ? <Pause className="w-5 h-5 sm:w-7 sm:h-7 fill-current" /> : <Play className="w-5 h-5 sm:w-7 sm:h-7 fill-current" />}
                              </button>

                              <div className="flex items-center gap-1 sm:gap-3 group/volume">
                                <button onClick={toggleMute} className="p-1 sm:p-2 text-white hover:text-brand-primary transition-colors">
                                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 sm:w-6 sm:h-6" /> : <Volume2 className="w-4 h-4 sm:w-6 sm:h-6" />}
                                </button>
                                <div className="w-0 group-hover/volume:w-16 sm:group-hover/volume:w-24 overflow-hidden transition-all duration-300 flex items-center">
                                  <input 
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-full accent-brand-primary h-1 rounded-full cursor-pointer"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-1 sm:gap-3 text-[10px] sm:text-xs font-bold text-white/80 tabular-nums">
                                <span>{formatTime(currentTime)}</span>
                                <span className="text-white/30">/</span>
                                <span>{duration > 0 ? formatTime(duration) : "LIVE"}</span>
                              </div>

                              <button onClick={reconnect} className="p-1 sm:p-2 text-white hover:text-brand-primary transition-colors" title="Reconectar">
                                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-4">
                              <div className="hidden md:block text-sm font-bold text-white/60 tracking-tight">
                                {selectedBroadcaster.name}
                              </div>
                              <button 
                                onClick={toggleFullscreen}
                                className="p-1 sm:p-2 text-white hover:text-brand-primary transition-colors"
                              >
                                {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-6 sm:h-6" /> : <Maximize2 className="w-4 h-4 sm:w-6 sm:h-6" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Top Overlay Info */}
                  <div className={`absolute top-6 left-6 flex items-center gap-3 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-red-900/40">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      En Vivo
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white shadow-xl">
                      <Users className="w-3 h-3 text-brand-primary" />
                      {viewers}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white shadow-xl" title="Estado del Servidor">
                      <div className={`w-1.5 h-1.5 rounded-full ${socketStatus === 'connected' ? 'bg-emerald-500' : socketStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
                      <span className="capitalize">{socketStatus === 'connected' ? 'Conectado' : socketStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-emerald-400 shadow-xl" title="Calidad de Recepción">
                      <div className="flex items-end gap-[1px] h-2.5">
                        <div className="w-0.5 bg-emerald-400 h-1/3 rounded-sm"></div>
                        <div className="w-0.5 bg-emerald-400 h-2/3 rounded-sm"></div>
                        <div className="w-0.5 bg-emerald-400 h-full rounded-sm"></div>
                      </div>
                      Excelente
                    </div>
                  </div>

                  {/* Big Play/Pause Indicator on Click */}
                  <AnimatePresence>
                    {!isPlaying && (
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <div className="w-20 h-20 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                          <Play className="w-10 h-10 text-white fill-current ml-1" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-6 p-12 text-center">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                    <MonitorPlay className="w-12 h-12 text-neutral-700" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">No hay transmisiones activas</h2>
                    <p className="text-neutral-500 max-w-xs">Selecciona un canal de la lista o espera a que alguien inicie una transmisión.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stream Info & Actions */}
            <div className="bg-brand-surface border-t border-white/5 p-6 md:p-8">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-brand-primary/20 text-brand-primary rounded-2xl flex items-center justify-center">
                    <MonitorPlay className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {selectedBroadcaster?.name || "Vida Mixe TV"}
                    </h1>
                    <p className="text-neutral-500 text-sm">Transmisión oficial de la Sierra Norte</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${isLiked ? 'bg-red-500 text-white' : 'bg-white/5 text-neutral-400 hover:bg-white/10'}`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    {isLiked ? 'Me gusta' : 'Apoyar'}
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="p-3 bg-white/5 text-neutral-400 hover:bg-white/10 rounded-full transition-all"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    {showShareMenu && (
                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-brand-surface border border-white/10 rounded-2xl p-2 shadow-xl z-50">
                        <button onClick={() => handleShare('native')} className="w-full text-left px-4 py-2 hover:bg-white/5 rounded-lg text-sm text-white">Compartir</button>
                        <button onClick={() => handleShare('whatsapp')} className="w-full text-left px-4 py-2 hover:bg-white/5 rounded-lg text-sm text-white">WhatsApp</button>
                        <button onClick={() => handleShare('facebook')} className="w-full text-left px-4 py-2 hover:bg-white/5 rounded-lg text-sm text-white">Facebook</button>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowTutorial(true)}
                    className="p-3 bg-white/5 text-neutral-400 hover:bg-white/10 rounded-full transition-all"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tutorial Modal */}
          <AnimatePresence>
            {showTutorial && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-brand-surface border border-white/10 p-8 rounded-3xl max-w-md w-full relative"
                >
                  <button onClick={() => setShowTutorial(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white"><X /></button>
                  <h2 className="text-2xl font-bold text-white mb-4">¿Cómo ver la transmisión?</h2>
                  <ul className="space-y-4 text-neutral-300 text-sm">
                    <li>1. Selecciona un canal de la lista a la derecha.</li>
                    <li>2. Espera a que la transmisión cargue.</li>
                    <li>3. Usa los controles de video para pausar o ajustar el volumen.</li>
                    <li>4. ¡Participa en el chat para interactuar con la comunidad!</li>
                  </ul>
                  <button onClick={() => setShowTutorial(false)} className="mt-8 w-full bg-brand-primary text-white font-bold py-3 rounded-xl">Entendido</button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sidebar */}
          <div className="w-full lg:w-96 bg-brand-surface border-l border-white/5 flex flex-col">
            {/* Channels List */}
            <div className="p-6 border-b border-white/5">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Canales Disponibles</h3>
              <div className="space-y-3">
                {broadcasters.length > 0 ? (
                  broadcasters.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => joinStream(b)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedBroadcaster?.id === b.id ? 'bg-brand-primary/10 border border-brand-primary/20' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}
                    >
                      <div className="w-10 h-10 bg-brand-primary/20 text-brand-primary rounded-xl flex items-center justify-center flex-shrink-0">
                        <MonitorPlay className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{b.name}</p>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest">En Vivo • {b.viewers} espectadores</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-neutral-600 italic">No hay otros canales...</p>
                )}
              </div>
            </div>

            {/* Chat */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Chat socket={socketRef.current} isHost={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
