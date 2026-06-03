"use client";

import { useState } from "react";
import { X, Check, AlertCircle, Loader2 } from "lucide-react";
import { categoriesApi, CreateCategoryBody } from "@/lib/categoriesApi";

interface Props {
  storeId: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateCategory({ storeId, onClose, onCreated }: Props) {
  const [form, setForm] = useState<CreateCategoryBody>({
    name: "",
    sortOrder: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("Nama kategori wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await categoriesApi.create(storeId, form);
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal membuat kategori");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1208] border border-white/10 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/5">
          <h3 className="text-white font-bold text-base sm:text-lg">Tambah Kategori</h3>
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
            <label className="block text-stone-300 text-sm font-medium mb-2">Nama Kategori</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Contoh: Minuman, Makanan, Dessert"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">
              Urutan <span className="text-stone-500 font-normal">(opsional)</span>
            </label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              placeholder="0"
              min={0}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
            />
            <p className="text-stone-500 text-xs mt-1.5">Angka kecil tampil lebih dulu</p>
          </div>
        </div>

        <div className="flex gap-3 p-5 sm:p-6 border-t border-white/5">
          <button onClick={onClose} className="flex-1 py-3 border border-white/10 rounded-xl text-stone-300 hover:bg-white/5 active:scale-[0.98] transition-all font-medium text-sm">
            Batal
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50 rounded-xl text-black font-bold transition-all flex items-center justify-center gap-2 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Tambah
          </button>
        </div>
      </div>
    </div>
  );
}