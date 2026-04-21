import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { FileUploader } from "../components/FileUploader";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export default function PostMedia() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [type, setType] = useState<'image' | 'video'>('image');
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return alert("Por favor sube un archivo primero");
    
    setLoading(true);
    try {
      await addDoc(collection(db, "media"), {
        title,
        description,
        tags: tags.split(",").map(t => t.trim()).filter(t => t),
        type,
        url,
        authorUid: auth.currentUser?.uid,
        authorName: auth.currentUser?.displayName || auth.currentUser?.email,
        createdAt: serverTimestamp(),
      });
      navigate("/galeria");
    } catch (error) {
      console.error(error);
      alert("Error al publicar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <header>
          <h1 className="text-3xl font-bold">{t.community.uploadMedia}</h1>
          <p className="text-neutral-400">Comparte tus momentos con la comunidad.</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-neutral-400">{t.community.postType}</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => { setType('image'); setUrl(""); }}
                className={`flex-1 py-3 rounded-2xl font-bold border transition-all ${type === 'image' ? 'bg-brand-primary border-brand-primary text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}
              >
                {t.community.image}
              </button>
              <button
                type="button"
                onClick={() => { setType('video'); setUrl(""); }}
                className={`flex-1 py-3 rounded-2xl font-bold border transition-all ${type === 'video' ? 'bg-brand-primary border-brand-primary text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}
              >
                {t.community.video}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-400">{t.community.postTitle}</label>
            <input
              type="text"
              required
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-400">{t.community.postDesc}</label>
            <textarea
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-all min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-400">{t.community.postTags}</label>
            <input
              type="text"
              placeholder="cultura, oaxaca, sierra"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-all"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-400">Archivo</label>
            {url ? (
              <div className="relative rounded-2xl overflow-hidden border border-brand-primary bg-neutral-800">
                {type === 'image' ? (
                  <img src={url} className="w-full h-48 object-cover" alt="Preview" />
                ) : (
                  <video src={url} className="w-full h-48 object-cover" controls />
                )}
                <button 
                  onClick={() => setUrl("")}
                  className="absolute top-2 right-2 bg-black/50 p-2 rounded-full hover:bg-black transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <FileUploader 
                folder={type === 'image' ? 'images' : 'videos'} 
                onUploadComplete={(url) => setUrl(url)} 
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !url}
            className="w-full bg-brand-primary hover:bg-brand-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : t.community.publish}
          </button>
        </form>
      </div>
    </div>
  );
}
