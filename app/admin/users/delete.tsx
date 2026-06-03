"use client";

import { useState } from "react";
import { Trash2, Loader2, X } from "lucide-react";
import { usersApi, UserWithCount } from "@/lib/usersApi";

interface Props {
  user: UserWithCount;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteUser({ user, onClose, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await usersApi.delete(user.id);
      onDeleted();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1208] border border-white/10 rounded-2xl w-full max-w-sm">
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 pb-6 text-center">
          <div className="flex items-center justify-center w-14 h-14 bg-red-500/10 rounded-2xl mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Hapus User?</h3>
          <p className="text-stone-400 text-sm mb-6">
            User <span className="text-white font-semibold">{user.name}</span> dan semua toko miliknya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 border border-white/10 rounded-xl text-stone-300 hover:bg-white/5 active:scale-[0.98] transition-all font-medium text-sm">
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 py-3 bg-red-500 hover:bg-red-400 active:scale-[0.98] disabled:opacity-50 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hapus"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}