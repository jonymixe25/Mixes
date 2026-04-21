import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { UserProvider } from "./contexts/UserContext";
import { SocketProvider } from "./contexts/SocketContext";
import CallOverlay from "./components/CallOverlay";
import Home from "./pages/Home";
import Broadcast from "./pages/Broadcast";
import View from "./pages/View";
import Recordings from "./pages/Recordings";
import AdminNews from "./pages/AdminNews";
import AdminUsers from "./pages/AdminUsers";
import Translator from "./pages/Translator";
import Team from "./pages/Team";
import Auth from "./pages/Auth";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <UserProvider>
      <SocketProvider>
        <LanguageProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-brand-bg flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/transmitir" element={<Broadcast />} />
                <Route path="/view" element={<View />} />
                <Route path="/vista" element={<View />} />
                <Route path="/recordings" element={<Recordings />} />
                <Route path="/admin-news" element={
                  <ProtectedRoute adminOnly>
                    <AdminNews />
                  </ProtectedRoute>
                } />
                <Route path="/admin-users" element={
                  <ProtectedRoute adminOnly>
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="/traductor" element={<Translator />} />
                <Route path="/team" element={<Team />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center bg-brand-bg text-white p-6 text-center">
                    <div className="space-y-6">
                      <h1 className="text-9xl font-bold text-brand-primary opacity-20">404</h1>
                      <div className="space-y-2">
                        <h2 className="text-3xl font-bold">Página no encontrada</h2>
                        <p className="text-neutral-500">Lo sentimos, la página que buscas no existe o ha sido movida.</p>
                      </div>
                      <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-primary text-white font-bold rounded-full hover:bg-brand-primary/80 transition-all">
                        Volver al Inicio
                      </Link>
                    </div>
                  </div>
                } />
              </Routes>
            </main>
            <Footer />
            <CallOverlay />
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </SocketProvider>
  </UserProvider>
  );
}
