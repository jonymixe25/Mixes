import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Maximize2, Minimize2, X, ListMusic, Radio, Youtube } from 'lucide-react';
import ReactPlayer from 'react-player';

const TRACKS = [
  {
    id: 1,
    title: "Sones Mixes - Tradicional",
    artist: "Banda Filarmónica",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    type: "audio",
    icon: Music
  },
  {
    id: 2,
    title: "Radio Jempoj",
    artist: "Transmisión en vivo",
    url: "https://stream.zeno.fm/f3a9z8y7x6w5v", // Placeholder stream URL
    type: "radio",
    icon: Radio
  },
  {
    id: 3,
    title: "Música Mixe",
    artist: "Lista de YouTube",
    url: "https://www.youtube.com/playlist?list=PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i", // Placeholder YouTube playlist
    type: "youtube",
    icon: Youtube
  }
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [tracks, setTracks] = useState(TRACKS);
  
  const playerRef = useRef<any>(null);

  const currentTrack = tracks[currentTrackIndex];

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleProgress = (state: any) => {
    if (state && typeof state.played === 'number') {
      setProgress(state.played * 100);
    }
  };

  const handleEnded = () => {
    handleNext();
  };

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setShowPlaylist(false);
  };

  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl) return;
    
    const newTrack = {
      id: Date.now(),
      title: "Enlace Personalizado",
      artist: "YouTube / Audio",
      url: customUrl,
      type: "custom",
      icon: Youtube
    };
    
    setTracks([...tracks, newTrack]);
    setCurrentTrackIndex(tracks.length);
    setIsPlaying(true);
    setCustomUrl("");
    setShowPlaylist(false);
  };

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-brand-primary text-white rounded-full shadow-2xl hover:bg-brand-primary/80 transition-all"
        title="Abrir reproductor de música"
      >
        <Music className="w-6 h-6" />
      </button>
    );
  }

  const TrackIcon = currentTrack.icon;

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isExpanded ? 'w-80' : 'w-auto'}`}>
      <div className="bg-brand-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header / Minimized View */}
        <div className="flex items-center justify-between p-3 border-b border-white/5">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className={`w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary ${isPlaying ? 'animate-pulse' : ''}`}>
              <TrackIcon className="w-5 h-5" />
            </div>
            {isExpanded ? (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{currentTrack.title}</p>
                <p className="text-xs text-brand-secondary truncate">{currentTrack.artist}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 pr-2">
                <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="p-2 text-white hover:text-brand-primary transition-colors">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsVisible(false); }} className="p-2 text-neutral-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          {isExpanded && (
            <div className="flex items-center gap-1">
              <button onClick={() => setShowPlaylist(!showPlaylist)} className={`p-2 transition-colors ${showPlaylist ? 'text-brand-primary' : 'text-neutral-400 hover:text-white'}`}>
                <ListMusic className="w-4 h-4" />
              </button>
              <button onClick={() => setIsExpanded(false)} className="p-2 text-neutral-400 hover:text-white transition-colors">
                <Minimize2 className="w-4 h-4" />
              </button>
              <button onClick={() => setIsVisible(false)} className="p-2 text-neutral-400 hover:text-red-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Playlist View */}
        {isExpanded && showPlaylist && (
          <div className="p-2 max-h-64 overflow-y-auto border-b border-white/5 bg-black/20 flex flex-col gap-2">
            <form onSubmit={handleAddCustomUrl} className="flex gap-2 p-2">
              <input
                type="url"
                placeholder="Pegar enlace de YouTube..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-primary"
              />
              <button
                type="submit"
                className="bg-brand-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-brand-primary/80 transition-colors"
              >
                Añadir
              </button>
            </form>
            
            <div className="space-y-1">
              {tracks.map((track, index) => {
                const Icon = track.icon;
                return (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(index)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                      index === currentTrackIndex ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-white/5 text-neutral-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.title}</p>
                      <p className="text-xs opacity-70 truncate">{track.artist}</p>
                    </div>
                    {index === currentTrackIndex && isPlaying && (
                      <div className="flex gap-0.5 h-3">
                        <div className="w-1 bg-brand-primary animate-[bounce_1s_infinite]" />
                        <div className="w-1 bg-brand-primary animate-[bounce_1s_infinite_0.2s]" />
                        <div className="w-1 bg-brand-primary animate-[bounce_1s_infinite_0.4s]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Expanded Controls */}
        {isExpanded && (
          <div className="p-4 space-y-4">
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-primary transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <button onClick={toggleMute} className="p-2 text-neutral-400 hover:text-white transition-colors">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center gap-4">
                <button onClick={handlePrev} className="p-2 text-white hover:text-brand-primary transition-colors">
                  <SkipBack className="w-6 h-6 fill-current" />
                </button>
                <button 
                  onClick={togglePlay} 
                  className="w-12 h-12 flex items-center justify-center bg-brand-primary text-white rounded-full hover:bg-brand-primary/80 transition-all shadow-lg shadow-brand-primary/20"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                </button>
                <button onClick={handleNext} className="p-2 text-white hover:text-brand-primary transition-colors">
                  <SkipForward className="w-6 h-6 fill-current" />
                </button>
              </div>

              <div className="w-9"></div> {/* Spacer for balance */}
            </div>
          </div>
        )}

        {/* Hidden ReactPlayer */}
        <div className="hidden">
          {React.createElement(ReactPlayer as any, {
            ref: playerRef,
            url: currentTrack.url,
            playing: isPlaying,
            volume: volume,
            muted: isMuted,
            onProgress: handleProgress,
            onEnded: handleEnded,
            width: "0",
            height: "0",
            config: {
              youtube: {
                playerVars: { showinfo: 0, controls: 0 }
              }
            }
          })}
        </div>
      </div>
    </div>
  );
}
