import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, addDoc, updateDoc, doc, serverTimestamp, getDocs, or } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useLanguage } from "../context/LanguageContext";
import { Search, UserPlus, Check, X, Users, MessageCircle, Video } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: string;
}

interface ContactRequest {
  id: string;
  users: string[];
  status: 'pending' | 'accepted';
  initiatedBy: string;
}

export default function Contacts() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Listen for users
    const usersUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const u = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(u.filter(user => user.uid !== auth.currentUser?.uid));
    });

    // Listen for contact requests where the current user is involved
    const q = query(
      collection(db, "contacts"),
      where("users", "array-contains", auth.currentUser.uid)
    );
    const requestsUnsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactRequest)));
      setLoading(false);
    });

    return () => {
      usersUnsubscribe();
      requestsUnsubscribe();
    };
  }, []);

  const sendRequest = async (targetUid: string) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, "contacts"), {
        users: [auth.currentUser.uid, targetUid],
        status: 'pending',
        initiatedBy: auth.currentUser.uid,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "contacts", requestId), {
        status: 'accepted',
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRequest = async (requestId: string) => {
    // Usually you'd delete the doc, but for simplicity we'll just not show it if denied or something.
    // In a real app we'd call deleteDoc.
  };

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    const isContact = requests.find(r => r.users.includes(user.uid));
    return (user.displayName?.toLowerCase().includes(search) || user.email?.toLowerCase().includes(search)) && !isContact;
  });

  const myContacts = requests.filter(r => r.status === 'accepted').map(r => {
    const otherUid = r.users.find(uid => uid !== auth.currentUser?.uid);
    return { ...users.find(u => u.uid === otherUid), requestId: r.id };
  }).filter(u => u.uid);

  const pendingRequests = requests.filter(r => r.status === 'pending' && r.initiatedBy !== auth.currentUser?.uid);

  return (
    <div className="min-h-screen bg-brand-bg text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <header>
          <h1 className="text-4xl font-bold">{t.contacts.title}</h1>
          <p className="text-neutral-400 mt-2">Conecta con la gente de las nubes.</p>
        </header>

        {pendingRequests.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-brand-primary">
              <UserPlus className="w-5 h-5" />
              Solicitudes Pendientes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pendingRequests.map(req => {
                const sender = users.find(u => u.uid === req.initiatedBy);
                if (!sender) return null;
                return (
                  <div key={req.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-lg">
                        {sender.displayName?.[0] || sender.email?.[0]}
                      </div>
                      <div>
                        <p className="font-bold">{sender.displayName || sender.email}</p>
                        <p className="text-xs text-neutral-500">Quiere conectar contigo</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => acceptRequest(req.id)} className="bg-green-600 hover:bg-green-500 p-2 rounded-full transition-colors">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => deleteRequest(req.id)} className="bg-red-600 hover:bg-red-500 p-2 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Conectados ({myContacts.length})
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {myContacts.map(contact => (
                <div key={contact.uid} className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl flex items-center justify-between hover:border-brand-primary/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xl border-2 border-brand-primary/20">
                      {contact.displayName?.[0]}
                    </div>
                    <div>
                      <p className="text-lg font-bold">{contact.displayName}</p>
                      <p className="text-sm text-neutral-500">En línea</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => navigate(`/chats`)}
                      className="bg-neutral-800 hover:bg-brand-primary p-3 rounded-2xl transition-all"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => navigate(`/videollamada/${contact.uid}`)}
                      className="bg-brand-primary hover:bg-brand-primary/80 p-3 rounded-2xl transition-all"
                    >
                      <Video className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {myContacts.length === 0 && (
                <div className="text-center py-10 bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-800 text-neutral-500">
                  {t.contacts.noContacts}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t.contacts.suggestions}</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder={t.contacts.searchUsers}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-brand-primary text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {filteredUsers.map(user => (
                <div key={user.uid} className="flex items-center justify-between bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold">
                      {user.displayName?.[0] || user.email?.[0]}
                    </div>
                    <div className="max-w-[120px]">
                      <p className="font-bold truncate text-sm">{user.displayName || user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => sendRequest(user.uid)}
                    className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary hover:text-white transition-all"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
