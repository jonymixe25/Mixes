import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useLanguage } from "../context/LanguageContext";
import { Search, Image as ImageIcon, Video, MessageSquare, Heart, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

function CommentSection({ mediaId }: { mediaId: string }) {
  const { t } = useLanguage();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const q = query(collection(db, "comments"), where("mediaId", "==", mediaId), orderBy("createdAt", "asc"));
    return onSnapshot(q, (sn) => setComments(sn.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [mediaId]);

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !auth.currentUser) return;
    try {
      await addDoc(collection(db, "comments"), {
        mediaId,
        text: newComment,
        authorUid: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || auth.currentUser.email,
        createdAt: serverTimestamp()
      });
      setNewComment("");
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-3">
      <div className="max-h-24 overflow-y-auto space-y-2 pr-2">
        {comments.map(c => (
          <div key={c.id} className="text-sm">
            <span className="font-bold text-brand-primary mr-2">{c.authorName}:</span>
            <span className="text-neutral-300">{c.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={postComment} className="flex gap-2">
        <input 
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-brand-primary"
          placeholder={t.community.addComment}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button className="text-brand-primary text-xs font-bold hover:text-white transition-colors">
          {t.community.postComment}
        </button>
      </form>
    </div>
  );
}

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  description: string;
  tags: string[];
  authorName: string;
  createdAt: any;
  thumbnailUrl?: string;
}

export default function Gallery() {
  const { t } = useLanguage();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "media"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaItem));
      setMedia(items);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredMedia = media.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      item.title?.toLowerCase().includes(search) ||
      item.tags?.some(tag => tag.toLowerCase().includes(search)) ||
      item.description?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-brand-bg text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold font-sans tracking-tight">{t.community.title}</h1>
            <p className="text-neutral-400 mt-2">{t.community.subtitle}</p>
          </div>
          <Link 
            to="/publicar" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary rounded-full font-bold hover:bg-brand-primary/80 transition-all text-center justify-center shrink-0"
          >
            <ImageIcon className="w-5 h-5" />
            {t.community.uploadMedia}
          </Link>
        </header>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-brand-primary transition-colors" />
          <input 
            type="text" 
            placeholder={t.community.searchPlaceholder}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-primary transition-all placeholder:text-neutral-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMedia.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800 hover:border-brand-primary/50 transition-all flex flex-col"
              >
                <div className="aspect-[4/5] relative bg-neutral-800">
                  {item.type === 'video' ? (
                    <video 
                      src={item.url} 
                      poster={item.thumbnailUrl}
                      className="w-full h-full object-cover"
                      muted
                      onMouseOver={(e) => e.currentTarget.play()}
                      onMouseOut={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                    />
                  ) : (
                    <img 
                      src={item.url} 
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  
                  <div className="absolute top-4 right-4 flex gap-2">
                    <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                      {item.type === 'video' ? <Video className="w-3 h-3 inline mr-1" /> : <ImageIcon className="w-3 h-3 inline mr-1" />}
                      {item.type === 'video' ? 'Video' : 'Foto'}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                    <p className="text-sm text-neutral-300 line-clamp-2">{item.description}</p>
                    <div className="flex gap-2 mt-4">
                      {item.tags?.map(tag => (
                        <span key={tag} className="text-[10px] uppercase tracking-widest bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-full border border-brand-primary/30">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-brand-primary">
                        {item.authorName?.[0]}
                      </div>
                      <span className="font-medium text-neutral-300">{item.authorName}</span>
                    </div>
                    <div className="flex gap-4 text-neutral-500">
                      <button className="hover:text-brand-primary transition-colors flex items-center gap-1">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Simple Comment Section */}
                  <div className="pt-4 border-t border-neutral-800 space-y-4">
                    <CommentSection mediaId={item.id} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!loading && filteredMedia.length === 0 && (
          <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-800">
            <Search className="w-16 h-16 mx-auto mb-4 text-neutral-700" />
            <h2 className="text-2xl font-bold">{t.community.noMedia}</h2>
          </div>
        )}
      </div>
    </div>
  );
}
