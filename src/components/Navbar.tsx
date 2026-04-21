import { Link, useLocation } from "react-router-dom";
import { Mountain, MonitorPlay, Home, Languages, Globe, Users, ShieldCheck, LogIn, User, Video, LogOut, Settings, Newspaper, MessageSquare } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useUser } from "../contexts/UserContext";

export default function Navbar() {
  const location = useLocation();
  const { language, setLanguage, t, tf } = useLanguage();
  const { user, loading, logout } = useUser();

  const navLinks = [
    { path: "/", label: tf("nav_home"), icon: Home },
    { path: "/view", label: tf("nav_view"), icon: MonitorPlay },
    { path: "/galeria", label: tf("nav_gallery"), icon: Globe },
    { path: "/contactos", label: tf("nav_contacts"), icon: Users },
    { path: "/chats", label: tf("nav_chats"), icon: MessageSquare },
    { path: "/recordings", label: "Archivo", icon: Video },
    { path: "/traductor", label: tf("nav_translator"), icon: Languages },
    { path: "/team", label: tf("team_title"), icon: Users },
  ];

  const adminLinks = [
    { path: "/transmitir", label: "Transmitir", icon: Video },
    { path: "/admin-news", label: "Admin Noticias", icon: Newspaper },
    { path: "/admin-users", label: "Admin Usuarios", icon: Settings },
  ];

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "ayuujk" : "es");
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-brand-bg/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center group-hover:bg-brand-primary/80 transition-colors">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Vida <span className="text-brand-primary">Mixe</span> TV
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
              
              {user?.isAdmin && adminLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? "bg-brand-secondary text-white shadow-lg shadow-brand-secondary/20"
                        : "text-neutral-400 hover:text-brand-secondary hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-white/5 text-brand-secondary border border-brand-secondary/30 hover:bg-brand-secondary/10 transition-all"
            >
              <Globe className="w-4 h-4" />
              {tf("lang_toggle")}
            </button>

            {/* User Profile / Login */}
            <div className="ml-2 pl-4 border-l border-white/10 flex items-center gap-4">
              {!loading && (
                user ? (
                  <>
                    <Link to="/transmitir" className="flex items-center gap-2 group">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-primary/50 group-hover:border-brand-primary transition-all">
                        {user.photoUrl ? (
                          <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-neutral-300 group-hover:text-white transition-colors hidden lg:block">
                        {user.name.split(' ')[0]}
                      </span>
                    </Link>
                    <button 
                      onClick={() => logout()}
                      className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                      title="Cerrar Sesión"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <Link 
                    to="/auth" 
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Acceder
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Mobile Navigation (Simple Icons) */}
          <div className="flex md:hidden items-center gap-2">
            {user ? (
              <Link to="/transmitir" className="w-8 h-8 rounded-full overflow-hidden border border-brand-primary/50">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </Link>
            ) : (
              <Link to="/auth" className="p-2 text-neutral-400 hover:text-white">
                <LogIn className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full bg-brand-secondary/20 text-brand-secondary"
              title={tf("lang_toggle")}
            >
              <Globe className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
