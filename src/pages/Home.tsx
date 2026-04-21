import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "motion/react";
import { getSocketUrl } from "../utils/socket";
import LivePreview from "../components/LivePreview";
import { getRecordings, SavedRecording } from "../utils/videoStorage";
import { Video, MonitorPlay, Mountain, CloudFog, Users, MessageSquare, Newspaper, Music, MapPin, X, Play, Sparkles, ArrowRight, ChevronRight, Upload, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useUser } from "../contexts/UserContext";
import { useSocket } from "../contexts/SocketContext";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, onSnapshot, addDoc } from "firebase/firestore";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  imageUrl?: string;
  videoUrl?: string;
}

interface CommunityVideo {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  price: string;
  video_url: string;
}

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [videos, setVideos] = useState<CommunityVideo[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [randomVideo, setRandomVideo] = useState<SavedRecording | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { t } = useLanguage();
  const { user, loading: authLoading } = useUser();
  const { socket } = useSocket();

  const fetchNews = () => {
    return onSnapshot(collection(db, "news"), (snapshot) => {
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsItem[];
      // Sort by date descending
      newsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setNews(newsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "news");
    });
  };

  const fetchVideos = () => {
    return onSnapshot(collection(db, "community_videos"), (snapshot) => {
      const videoData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityVideo[];
      setVideos(videoData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "community_videos");
    });
  };

  useEffect(() => {
    let unsubscribeNews: (() => void) | undefined;
    let unsubscribeVideos: (() => void) | undefined;

    unsubscribeNews = fetchNews();
    unsubscribeVideos = fetchVideos();

    const handleBroadcasterList = (list: any[]) => {
      setIsLive(list.length > 0);
    };

    if (socket) {
      if (user) {
        socket.emit("register_user", user.name);
      }
      socket.on("broadcaster_list", handleBroadcasterList);
      socket.emit("get_broadcasters");
    }

    // Load random recording
    const loadRandomRecording = async () => {
      try {
        const recordings = await getRecordings();
        if (recordings.length > 0) {
          const random = recordings[Math.floor(Math.random() * recordings.length)];
          setRandomVideo(random);
          setVideoUrl(URL.createObjectURL(random.blob));
          // Show popup after 3 seconds
          setTimeout(() => setShowPopup(true), 3000);
        }
      } catch (err) {
        console.error("Error loading recordings for popup:", err);
      }
    };
    loadRandomRecording();

    return () => { 
      if (unsubscribeNews) unsubscribeNews();
      if (unsubscribeVideos) unsubscribeVideos();
      if (socket) {
        socket.off("broadcaster_list", handleBroadcasterList);
      }
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [socket, user]);

  return (
    <div className="min-h-screen bg-brand-bg text-neutral-50 flex flex-col font-sans selection:bg-brand-primary selection:text-white">
      <Helmet>
        <title>Vida Mixe TV | Inicio - La Región de los Jamás Conquistados</title>
        <meta name="description" content="Conectando a la comunidad Ayuuk con el mundo. Transmisiones en vivo desde el corazón de la sierra de Oaxaca." />
      </Helmet>

      {/* Atmospheric Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-24">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src="https://picsum.photos/seed/mixe-landscape/1920/1080?brightness=50" 
            alt="Sierra Mixe Paisaje" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/20 via-brand-bg/60 to-brand-bg"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/80 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-10 text-center lg:text-left"
          >
            <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-primary backdrop-blur-xl shadow-2xl"
              >
                <CloudFog className="w-4 h-4" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase">La región de los jamás conquistados</span>
              </motion.div>
              
              <AnimatePresence>
                {isLive && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 backdrop-blur-xl shadow-2xl shadow-red-500/20"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-xs font-black tracking-widest uppercase">En Vivo</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="space-y-4">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-7xl md:text-9xl font-black tracking-tighter text-white leading-[0.85] uppercase"
              >
                {t("hero_title").split(' ').slice(0, 2).join(' ')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-emerald-400">{t("hero_title").split(' ').slice(2).join(' ')}</span>
              </motion.h1>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-lg md:text-xl text-neutral-400 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"
              >
                {t("hero_subtitle")}
              </motion.p>
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4"
            >
              <Link
                to="/view"
                className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-brand-primary text-white font-bold rounded-2xl transition-all shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <MonitorPlay className="w-6 h-6" />
                <span>{t("hero_cta_view")}</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/team"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-md active:scale-95"
              >
                <Users className="w-6 h-6" />
                <span>{t("team_title")}</span>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0, rotateY: 20 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="relative perspective-1000"
          >
            <div className="absolute -inset-10 bg-brand-primary/20 blur-[100px] rounded-full"></div>
            <div className="relative bg-stone-900/50 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-4 shadow-2xl transform hover:rotate-y-12 transition-transform duration-700">
              <LivePreview />
              <div className="absolute -bottom-6 -right-6 bg-brand-surface border border-white/10 p-6 rounded-3xl shadow-2xl hidden md:block animate-bounce-slow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Estado Actual</p>
                    <p className="text-sm font-bold text-white">{isLive ? 'Transmisión Activa' : 'Próximamente'}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tlahuitoltepec Section - Editorial Style */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 aspect-[4/3] md:aspect-video"
            >
              <img 
                src="https://picsum.photos/seed/tlahuitoltepec-culture/1200/800" 
                alt="Santa María Tlahuitoltepec" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl">
                  <p className="text-xs font-bold tracking-widest uppercase text-brand-primary">Ubicación</p>
                  <p className="text-xl font-black text-white">Sierra Norte, Oaxaca</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-secondary font-bold uppercase tracking-[0.3em] text-xs">
                <div className="w-8 h-[1px] bg-brand-secondary"></div>
                <span>Cuna de Músicos</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                Santa María <br />
                <span className="italic font-light text-neutral-300">Tlahuitoltepec</span>
              </h2>
            </div>
            
            <p className="text-lg text-neutral-400 leading-relaxed font-medium">
              El corazón palpitante de la cultura Ayuuk. Aquí, la música no es solo arte, es el lenguaje de la resistencia y la identidad. Hogar del **CECAM**, donde cada nota cuenta la historia de un pueblo que nunca fue conquistado.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="space-y-3">
                <div className="w-14 h-14 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center">
                  <Music className="w-7 h-7" />
                </div>
                <h4 className="text-white font-bold">Sinfonía Mixe</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">Bandas de viento que resuenan en las nubes.</p>
              </div>
              <div className="space-y-3">
                <div className="w-14 h-14 bg-brand-secondary/10 text-brand-secondary rounded-2xl flex items-center justify-center">
                  <Mountain className="w-7 h-7" />
                </div>
                <h4 className="text-white font-bold">Altitud Sagrada</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">Tradiciones preservadas en la cima de la sierra.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section - Grid Layout */}
      <section className="py-32 px-6 bg-stone-950/50 border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-accent font-bold uppercase tracking-[0.3em] text-xs">
                <div className="w-8 h-[1px] bg-brand-accent"></div>
                <span>Actualidad Ayuuk</span>
              </div>
              <h2 className="text-5xl font-black text-white tracking-tighter">Noticias de la Sierra</h2>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin-news" className="group flex items-center gap-2 text-neutral-500 hover:text-white font-bold text-sm transition-all">
                <span>Panel Admin</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {news.length > 0 ? (
              news.map((item, idx) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-brand-surface/40 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden hover:border-brand-primary/30 transition-all hover:-translate-y-2 flex flex-col"
                >
                  {(item.imageUrl || item.videoUrl) && (
                    <div className="relative aspect-video overflow-hidden">
                      {item.videoUrl ? (
                        <video src={item.videoUrl} className="w-full h-full object-cover" muted loop onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
                      ) : (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-transparent opacity-60"></div>
                    </div>
                  )}
                  <div className="p-10 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                        {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Por {item.author}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-brand-primary transition-colors leading-tight">{item.title}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed line-clamp-4 font-medium mb-8">
                      {item.content}
                    </p>
                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-2 text-brand-primary font-bold text-xs group-hover:gap-4 transition-all">
                      <span>Leer más</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-24 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <CloudFog className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm">No hay noticias en el horizonte</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Facebook Feed Section */}
      <section className="py-32 px-6 bg-brand-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-secondary font-bold uppercase tracking-[0.3em] text-xs">
                <div className="w-8 h-[1px] bg-brand-secondary"></div>
                <span>Producciones Locales</span>
              </div>
              <h2 className="text-5xl font-black text-white tracking-tighter">Videos de la Comunidad</h2>
            </div>
            <Link to="/recordings" className="group flex items-center gap-2 text-neutral-500 hover:text-white font-bold text-sm transition-all">
              <span>Ver Archivo Completo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {videos.length > 0 ? (
              videos.map((video, idx) => (
                <motion.div 
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-brand-surface border border-white/5 rounded-3xl overflow-hidden hover:border-brand-secondary/30 transition-all"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                    <div className="absolute top-4 right-4 px-3 py-1 bg-brand-secondary text-white text-[10px] font-black rounded-full shadow-lg">
                      {video.price}
                    </div>
                    <a 
                      href={video.video_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-12 h-12 bg-white text-brand-secondary rounded-full flex items-center justify-center shadow-2xl">
                        <Play className="w-6 h-6 fill-current ml-1" />
                      </div>
                    </a>
                  </div>
                  <div className="p-6">
                    <h4 className="text-white font-bold line-clamp-1 group-hover:text-brand-secondary transition-colors">{video.title}</h4>
                    <p className="text-xs text-neutral-500 mt-1">Por {video.author}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">No hay videos destacados aún</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Facebook Feed Section */}
      <section className="py-32 px-6 bg-brand-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#1877F2] font-bold uppercase tracking-[0.3em] text-xs">
                <div className="w-8 h-[1px] bg-[#1877F2]"></div>
                <span>Redes Sociales</span>
              </div>
              <h2 className="text-5xl font-black text-white tracking-tighter">Facebook Feed</h2>
            </div>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="group flex items-center gap-2 text-neutral-500 hover:text-white font-bold text-sm transition-all">
              <span>Seguir en Facebook</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Mock Facebook Posts */}
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl overflow-hidden shadow-xl text-black"
              >
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-black">V</div>
                  <div>
                    <h4 className="text-sm font-bold">Vida Mixe TV</h4>
                    <p className="text-[10px] text-neutral-500 font-medium">Hace {i * 2} horas • <Users className="inline w-2 h-2" /></p>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <p className="text-sm leading-relaxed mb-4">
                    {i === 1 ? "¡Increíble tarde en Tlahuitoltepec! La banda municipal ensayando para la fiesta patronal. #CulturaMixe #Ayuuk" : 
                     i === 2 ? "No te pierdas nuestra transmisión especial mañana a las 10 AM desde el CECAM. Estaremos platicando con los nuevos talentos." : 
                     "Gracias a todos los que se conectaron ayer. Somos una comunidad que crece cada día más allá de las fronteras."}
                  </p>
                </div>
                <div className="aspect-square bg-neutral-100">
                  <img src={`https://picsum.photos/seed/fb-post-${i}/600/600`} alt="Facebook Post" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="p-4 border-t border-neutral-100 flex items-center justify-between text-neutral-500">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold hover:text-[#1877F2] cursor-pointer">Me gusta</span>
                    <span className="text-xs font-bold hover:text-[#1877F2] cursor-pointer">Comentar</span>
                  </div>
                  <span className="text-xs font-bold hover:text-[#1877F2] cursor-pointer">Compartir</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Minimalist */}
      <footer className="py-20 px-6 border-t border-white/5 bg-brand-bg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center">
              <Mountain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Vida Mixe TV</h3>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">La voz de las nubes</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            <Link to="/" className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-brand-primary transition-colors">Inicio</Link>
            <Link to="/view" className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-brand-primary transition-colors">Transmisiones</Link>
            <Link to="/recordings" className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-brand-primary transition-colors">Archivo</Link>
            <Link to="/team" className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-brand-primary transition-colors">Equipo</Link>
          </div>

          <div className="text-center md:text-right space-y-2">
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} Vida Mixe TV
            </p>
            <p className="text-[10px] text-neutral-600 font-medium">
              Hecho con ❤️ en la Sierra Norte de Oaxaca
            </p>
          </div>
        </div>
      </footer>

      {/* Random Video Popup */}
      <AnimatePresence>
        {showPopup && randomVideo && videoUrl && (
          <motion.div 
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] w-80 md:w-[26rem] perspective-1000"
          >
            <div className="bg-brand-surface/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden group">
              <div className="relative aspect-video bg-black">
                <video 
                  src={videoUrl} 
                  autoPlay 
                  muted 
                  loop 
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-transparent pointer-events-none"></div>
                
                <button 
                  onClick={() => setShowPopup(false)}
                  className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all z-10 border border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-brand-primary">
                      <Sparkles className="w-4 h-4 fill-brand-primary animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Recuerdo Mixe</span>
                    </div>
                    <h4 className="text-lg font-black text-white line-clamp-1 uppercase tracking-tight">{randomVideo.name}</h4>
                  </div>
                  <Link 
                    to="/recordings"
                    className="w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-xl shadow-brand-primary/30"
                  >
                    <Play className="w-5 h-5 fill-current" />
                  </Link>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-secondary rounded-full"></div>
                  <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">
                    {new Date(randomVideo.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <Link to="/recordings" className="text-[10px] text-brand-primary font-black uppercase tracking-widest hover:underline">
                  Explorar Archivo
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
