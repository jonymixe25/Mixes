import React from "react";
import { Trash2, Newspaper } from "lucide-react";
import { deleteDoc, doc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../firebase";
import toast from "react-hot-toast";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export default function NewsList({ news, searchQuery }: { news: NewsItem[], searchQuery: string }) {
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta noticia?")) return;

    try {
      await deleteDoc(doc(db, "news", id));
      toast.success("Noticia eliminada");
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `news/${id}`);
      toast.error("Error al eliminar la noticia");
    }
  };

  const filteredNews = news.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-6">Noticias Publicadas</h2>
      {filteredNews.length > 0 ? (
        filteredNews.map((item) => (
          <div key={item.id} className="bg-brand-surface border border-white/5 rounded-3xl p-6 flex justify-between items-start group">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span>{new Date(item.date).toLocaleDateString()}</span>
                <span>•</span>
                <span>{item.author}</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-brand-primary transition-colors">{item.title}</h3>
              <p className="text-neutral-400 text-sm line-clamp-2">{item.content}</p>
            </div>
            <button 
              onClick={() => handleDelete(item.id)}
              className="p-2 text-neutral-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
              title="Eliminar noticia"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))
      ) : (
        <div className="text-center py-20 bg-brand-surface/50 border border-dashed border-white/5 rounded-3xl">
          <Newspaper className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
          <p className="text-neutral-500">No hay noticias publicadas aún.</p>
        </div>
      )}
    </div>
  );
}
