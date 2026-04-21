import { Helmet } from "react-helmet-async";
import { Users, Mail, Heart, Camera, Music, Code, Mic2, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useLanguage } from "../context/LanguageContext";
import { useUser } from "../contexts/UserContext";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  bio?: string;
  image?: string;
  icon?: string;
  createdAt?: string;
}

const ROLE_ICONS: Record<string, any> = {
  "Directora General": Heart,
  "Director de Producción": Camera,
  "Ingeniero de Sonido": Music,
  "Desarrolladora de Plataforma": Code,
  "Locutor y Traductor": Mic2,
  "Default": Users
};

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, tf } = useLanguage();
  const { user, loading: authLoading } = useUser();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "team"), (snapshot) => {
      const teamData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamMember[];
      setMembers(teamData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching team:", error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-brand-bg text-neutral-50 font-sans">
        <Helmet>
          <title>{tf("team_title")} | Vida Mixe TV</title>
          <meta name="description" content="Conoce a las personas detrás de Vida Mixe TV, trabajando para difundir la cultura Ayuuk." />
        </Helmet>

        {/* Hero Section */}
        <div className="relative py-24 px-6 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://picsum.photos/seed/team-bg/1920/600?blur=10" 
              alt="Fondo de equipo" 
              className="w-full h-full object-cover opacity-20"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/50 via-brand-bg to-brand-bg"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/20 border border-brand-primary/30 text-brand-primary backdrop-blur-sm">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium tracking-wide uppercase">Gente de las Nubes</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
              {tf("team_title").split(' ')[0]} <span className="text-brand-primary">{tf("team_title").split(' ')[1]}</span>
            </h1>
            <p className="text-xl text-neutral-400 font-light leading-relaxed">
              {tf("team_subtitle")}
            </p>
          </div>
        </div>

        {/* Team Grid */}
        <div className="max-w-7xl mx-auto px-6 pb-24">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
              <p className="text-neutral-400">Cargando equipo...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map((member) => {
                const Icon = ROLE_ICONS[member.role] || ROLE_ICONS["Default"];
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={member.id} 
                    className="bg-brand-surface border border-white/5 rounded-3xl overflow-hidden group hover:border-brand-primary/30 transition-all duration-500 relative"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img 
                        src={member.image || `https://picsum.photos/seed/${member.name}/400/400`} 
                        alt={member.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-transparent opacity-60"></div>
                      <div className="absolute bottom-4 left-4">
                        <div className="w-12 h-12 bg-brand-primary/90 backdrop-blur-md text-white rounded-2xl flex items-center justify-center shadow-xl transform -rotate-6 group-hover:rotate-0 transition-transform">
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    <div className="p-8 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-brand-primary transition-colors">
                          {member.name}
                        </h3>
                        <p className="text-brand-secondary font-medium text-sm uppercase tracking-widest">
                          {member.role}
                        </p>
                      </div>
                      
                      <p className="text-neutral-400 text-sm leading-relaxed min-h-[3rem]">
                        {member.bio || "Miembro del equipo de Vida Mixe TV."}
                      </p>

                      <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                        <a href={`mailto:${member.email}`} className="text-neutral-500 hover:text-white transition-colors">
                          <Mail className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Vision Section */}
          <div className="mt-24 bg-brand-surface/50 border border-white/5 rounded-[3rem] p-12 md:p-20 text-center space-y-8">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-white">Nuestra Misión</h2>
              <p className="text-lg text-neutral-400 leading-relaxed italic">
                "Fortalecer la identidad Ayuuk mediante el uso de herramientas tecnológicas modernas, creando un puente entre nuestra herencia ancestral y las nuevas generaciones, sin importar en qué parte del mundo se encuentren."
              </p>
              <div className="w-20 h-1 bg-brand-primary mx-auto rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
