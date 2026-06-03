"use client";

import { useState, useRef } from "react";
import { X, Check, AlertCircle, Loader2, Upload, ImageIcon } from "lucide-react";
import { menuItemsApi, MenuItem, UpdateMenuItemBody } from "@/lib/menuItemsApi";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://menu-qr-backend-production.up.railway.app";

interface Props {
  item: MenuItem;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditMenuItem({ item, onClose, onSaved }: Props) {
  const [form, setForm] = useState<UpdateMenuItemBody>({
    name: item.name,
    description: item.description || "",
    price: item.price,
    isAvailable: item.isAvailable,
    sortOrder: item.sortOrder,
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(item.imageUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof UpdateMenuItemBody) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({
        ...f,
        [key]: key === "price" || key === "sortOrder" ? Number(e.target.value) : e.target.value,
      }));

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview lokal
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    // Upload ke server
    setUploadingImage(true);
    try {
      await menuItemsApi.uploadImage(item.id, file);
    } catch {
      setError("Gagal upload gambar");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setError("");
    if (!form.name?.trim()) { setError("Nama menu wajib diisi"); return; }
    if ((form.price ?? 0) < 0) { setError("Harga tidak boleh negatif"); return; }
    setLoading(true);
    try {
      await menuItemsApi.update(item.id, form);
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal update menu item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1208] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/5 sticky top-0 bg-[#1A1208] z-10">
          <h3 className="text-white font-bold text-base sm:text-lg">Edit Menu Item</h3>
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

          {/* Upload Gambar */}
          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">Foto Menu</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-40 bg-white/5 border-2 border-dashed border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-amber-500/40 hover:bg-white/[0.07] transition-all group"
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white text-sm font-medium">
                      <Upload className="w-4 h-4" />
                      Ganti Foto
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-stone-400" />
                  </div>
                  <p className="text-stone-400 text-sm">Klik untuk upload foto</p>
                  <p className="text-stone-500 text-xs">JPG, PNG, max 5MB</p>
                </div>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Nama */}
          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">Nama Menu</label>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={2}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all resize-none text-sm"
            />
          </div>

          {/* Harga */}
          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">Harga (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-medium">Rp</span>
              <input
                type="number"
                value={form.price}
                onChange={set("price")}
                min={0}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
              />
            </div>
            {(form.price ?? 0) > 0 && (
              <p className="text-stone-400 text-xs mt-1.5">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(form.price ?? 0)}
              </p>
            )}
          </div>

          {/* Urutan */}
          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">Urutan</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={set("sortOrder")}
              min={0}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
            />
          </div>

          {/* Toggle ketersediaan */}
          <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-all">
            <div>
              <p className="text-white text-sm font-medium">Ketersediaan</p>
              <p className="text-stone-500 text-xs mt-0.5">
                {form.isAvailable ? "Menu tersedia dan bisa dipesan" : "Menu tidak tersedia"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isAvailable: !f.isAvailable }))}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 active:scale-95 ${
                form.isAvailable ? "bg-amber-500" : "bg-white/10"
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${
                form.isAvailable ? "left-7" : "left-1"
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