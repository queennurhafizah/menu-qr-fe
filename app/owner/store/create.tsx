"use client";

import { useState } from "react";
import { X, Check, AlertCircle, Loader2 } from "lucide-react";
import { storesApi, CreateStoreBody } from "@/lib/storesApi";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateStore({ onClose, onCreated }: Props) {
  const [form, setForm] = useState<CreateStoreBody>({
    name: "",
    slug: "",
    description: "",
    address: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof CreateStoreBody) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setForm((f) => ({ ...f, name, slug }));
  };

  const handleCreate = async () => {
    setError("");
    if (!form.name || !form.slug) {
      setError("Nama dan slug wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await storesApi.create(form);
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal membuat toko");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1208] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/5 sticky top-0 bg-[#1A1208] z-10">
          <h3 className="text-white font-bold text-base sm:text-lg">Buat Toko Baru</h3>
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
              onChange={handleNameChange}
              placeholder="Contoh: Warung Bu Sari"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">
              Slug <span className="text-stone-500 font-normal">(URL toko)</span>
            </label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/10 transition-all">
              <span className="px-3 py-3 text-stone-500 text-xs sm:text-sm border-r border-white/10 whitespace-nowrap">/menu/</span>
              <input
                type="text"
                value={form.slug}
                onChange={set("slug")}
                placeholder="warung-bu-sari"
                className="flex-1 px-3 py-3 bg-transparent text-white placeholder-stone-600 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={set("description")}
              placeholder="Deskripsi singkat toko..."
              rows={2}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all resize-none text-sm"
            />
          </div>

          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">Alamat</label>
            <input
              type="text"
              value={form.address}
              onChange={set("address")}
              placeholder="Jl. Contoh No. 1"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">Nomor Telepon</label>
            <input
              type="text"
              value={form.phone}
              onChange={set("phone")}
              placeholder="08xxxxxxxxxx"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
            />
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
            Buat Toko
          </button>
        </div>
      </div>
    </div>
  );
}