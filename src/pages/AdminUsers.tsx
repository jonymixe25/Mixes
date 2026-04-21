import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase";
import { useLanguage } from "../context/LanguageContext";

export default function AdminUsers() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    return onSnapshot(collection(db, "users"), (sn) => setUsers(sn.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>
      <div className="grid gap-4">
        {users.map(u => (
          <div key={u.id} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex justify-between items-center">
            <div>
              <p className="font-bold">{u.displayName || u.email}</p>
              <p className="text-sm text-neutral-500">{u.role}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-brand-primary text-white' : 'bg-neutral-800 text-neutral-400'}`}>
              {u.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
