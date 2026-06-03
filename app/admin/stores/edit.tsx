"use client";

import { useState } from "react";
import { X, Check, AlertCircle, Loader2 } from "lucide-react";
import { storesApi, Store, UpdateStoreBody } from "@/lib/storesApi";

interface Props {
  store: Store;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditStore({ store, onClose, onSaved }: Props) {
  const [form, setForm] = useState<UpdateStoreBody>({
    name: store.name,
    description: store.description || "",
    address: store.address || "",
    phone: store.phone || "",
    isActive: store.isActive,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof UpdateStoreBody) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      await storesApi.update(store.id, form);
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal update toko");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1208] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/5 sticky top-0 bg-[#1A1208] z-10">
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg">Edit Toko</h3>
            <p className="text-stone-500 text-xs mt-0.5">{store.name}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 active:scale-95">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">Nama Toko</label>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={2}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all resize-none text-sm"
            />
          </div>

          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">Alamat</label>
            <input
              type="text"
              value={form.address}
              onChange={set("address")}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">Nomor Telepon</label>
            <input
              type="text"
              value={form.phone}
              onChange={set("phone")}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-all">
            <div>
              <p className="text-white text-sm font-medium">Status Toko</p>
              <p className="text-stone-500 text-xs mt-0.5">
                {form.isActive ? "Toko aktif dan bisa dipesan" : "Toko tidak aktif"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 active:scale-95 ${
                form.isActive ? "bg-amber-500" : "bg-white/10"
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${
                form.isActive ? "left-7" : "left-1"
              }`} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 p-5 sm:p-6 border-t border-white/5">
          <button onClick={onClose} className="flex-1 py-3 border border-white/10 rounded-xl text-stone-300 hover:bg-white/5 active:scale-[0.98] transition-all font-medium text-sm">
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50 rounded-xl text-black font-bold transition-all flex items-center justify-center gap-2 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}