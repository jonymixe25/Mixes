import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useLanguage } from "../context/LanguageContext";
import { MessageSquare, Plus, Users, Send, Video, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Group {
  id: string;
  name: string;
  members: string[];
  createdBy: string;
  lastMessage?: string;
}

interface Message {
  id: string;
  text: string;
  senderUid: string;
  senderName: string;
  createdAt: any;
}

export default function ChatGroups() {
  const { t } = useLanguage();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Listen for groups where current user is a member
    const q = query(
      collection(db, "chat_groups"),
      where("members", "array-contains", auth.currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group)));
    });

    // Listen for contacts to create groups
    const contactsQ = query(
      collection(db, "contacts"),
      where("users", "array-contains", auth.currentUser.uid),
      where("status", "==", "accepted")
    );
    onSnapshot(contactsQ, async (snapshot) => {
      const uids = snapshot.docs.flatMap(doc => doc.data().users.filter((id: string) => id !== auth.currentUser?.uid));
      if (uids.length > 0) {
        const usersSnapshot = await getDocs(query(collection(db, "users"), where("uid", "in", uids)));
        setContacts(usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!selectedGroup) return;
    const q = query(
      collection(db, "chat_groups", selectedGroup.id, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });
    return unsubscribe;
  }, [selectedGroup]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup || !auth.currentUser) return;

    try {
      await addDoc(collection(db, "chat_groups", selectedGroup.id, "messages"), {
        text: newMessage,
        senderUid: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || auth.currentUser.email,
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (err) { console.error(err); }
  };

  const createGroup = async () => {
    if (!newGroupName.trim() || !auth.currentUser) return;
    try {
      await addDoc(collection(db, "chat_groups"), {
        name: newGroupName,
        members: [...selectedMembers, auth.currentUser.uid],
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setShowCreate(false);
      setNewGroupName("");
      setSelectedMembers([]);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-brand-bg flex overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r border-neutral-800 flex flex-col ${selectedGroup ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">{t.videoCall.groups}</h1>
          <button 
            onClick={() => setShowCreate(true)}
            className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary hover:text-white transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className={`w-full p-4 rounded-2xl text-left transition-all ${selectedGroup?.id === group.id ? 'bg-brand-primary text-white' : 'hover:bg-neutral-900 text-neutral-400'}`}
            >
              <p className="font-bold">{group.name}</p>
              <p className="text-xs opacity-60 truncate">{group.members.length} miembros</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-neutral-950 ${!selectedGroup ? 'hidden md:flex' : 'flex'}`}>
        {selectedGroup ? (
          <>
            <header className="p-6 bg-brand-bg/50 backdrop-blur-md border-b border-neutral-800 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedGroup(null)} className="md:hidden text-white transition-colors">
                  <ArrowLeft />
                </button>
                <div>
                  <h2 className="text-white font-bold text-lg">{selectedGroup.name}</h2>
                  <p className="text-neutral-500 text-xs">En el chat</p>
                </div>
              </div>
              <button className="bg-brand-primary/20 text-brand-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-primary hover:text-white transition-all">
                <Video className="w-5 h-5" />
                Llamada Grupal
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.senderUid === auth.currentUser?.uid ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[70%] p-4 rounded-3xl ${msg.senderUid === auth.currentUser?.uid ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-neutral-900 text-neutral-200 rounded-tl-none'}`}>
                    {msg.senderUid !== auth.currentUser?.uid && (
                      <p className="text-[10px] font-bold text-brand-primary mb-1 uppercase tracking-wider">{msg.senderName}</p>
                    )}
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-6 bg-brand-bg border-t border-neutral-800 flex gap-4">
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-primary"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="bg-brand-primary p-4 rounded-2xl text-white hover:scale-105 transition-all">
                <Send className="w-6 h-6" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
            <div className="w-24 h-24 bg-neutral-900 rounded-[2.5rem] flex items-center justify-center border border-neutral-800">
               <MessageSquare className="w-12 h-12 text-neutral-700" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Selecciona un grupo</h3>
              <p className="text-neutral-500 mt-2">O crea uno nuevo para empezar a charlar.</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-3xl p-8 space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">{t.videoCall.newGroup}</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400">{t.videoCall.groupName}</label>
                  <input
                    type="text"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:border-brand-primary outline-none"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400">{t.videoCall.members}</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {contacts.map(c => (
                      <button
                        key={c.uid}
                        onClick={() => {
                          if (selectedMembers.includes(c.uid)) {
                            setSelectedMembers(selectedMembers.filter(id => id !== c.uid));
                          } else {
                            setSelectedMembers([...selectedMembers, c.uid]);
                          }
                        }}
                        className={`p-3 rounded-xl border text-sm text-center transition-all ${selectedMembers.includes(c.uid) ? 'bg-brand-primary border-brand-primary text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}
                      >
                        {c.displayName || c.email}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 text-neutral-400 font-bold hover:text-white transition-all"
                >
                  {t.team.cancel}
                </button>
                <button
                  onClick={createGroup}
                  className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/80 transition-all"
                >
                  {t.videoCall.createGroup}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
