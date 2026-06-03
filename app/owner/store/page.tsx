"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus, Pencil, Trash2, Loader2, Store,
  QrCode, Phone, MapPin, CheckCircle, XCircle,
  Upload, X, Copy, Check,
} from "lucide-react";
import { storesApi, Store as StoreType } from "@/lib/storesApi";
import CreateStore from "./create";
import EditStore from "./edit";

export default function StorePage() {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editStore, setEditStore] = useState<StoreType | null>(null);
  const [uploadStore, setUploadStore] = useState<StoreType | null>(null);
  const [toast, setToast] = useState("");

  // State untuk modal upload QRIS
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStores = async () => {
    try {
      const data = await storesApi.getMy();
      setStores(data);
    } catch {
      showToast("Gagal memuat data toko");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStores(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus toko ini? Semua data toko akan hilang.")) return;
    try {
      await storesApi.delete(id);
      fetchStores();
      showToast("Toko berhasil dihapus!");
    } catch {
      showToast("Gagal menghapus toko");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    setUploadedUrl(null);
  };

  const handleUploadQris = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const result = await storesApi.uploadImage(uploadFile);
      setUploadedUrl(result.url);
      showToast("QRIS berhasil diupload!");
    } catch {
      showToast("Gagal mengupload QRIS");
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = () => {
    if (!uploadedUrl) return;
    navigator.clipboard.writeText(uploadedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseUploadModal = () => {
    setUploadStore(null);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadedUrl(null);
    setCopied(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 bg-amber-500 text-black px-4 py-3 rounded-xl font-medium text-sm shadow-lg fade-in">
          {toast}
        </div>
      )}

      {showCreate && (
        <CreateStore
          onClose={() => setShowCreate(false)}
          onCreated={() => { fetchStores(); showToast("Toko berhasil dibuat!"); }}
        />
      )}
      {editStore && (
        <EditStore
          store={editStore}
          onClose={() => setEditStore(null)}
          onSaved={() => { fetchStores(); showToast("Toko berhasil diupdate!"); }}
        />
      )}

      {/* Modal Upload QRIS */}
      {uploadStore && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1208] border border-white/10 rounded-2xl w-full max-w-md flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div>
                <h3 className="text-white font-bold text-base">Upload QRIS</h3>
                <p className="text-stone-500 text-xs mt-0.5">{uploadStore.name}</p>
              </div>
              <button onClick={handleCloseUploadModal} className="text-stone-400 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Info */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <p className="text-amber-400 text-xs font-medium mb-1">Cara kerja:</p>
                <ol className="text-stone-400 text-xs space-y-0.5 list-decimal list-inside">
                  <li>Upload gambar QRIS di sini</li>
                  <li>Salin URL yang muncul</li>
                  <li>Kirim URL ke Admin</li>
                  <li>Admin akan memasukkan URL ke sistem</li>
                </ol>
              </div>

              {/* Area upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {uploadPreview ? (
                  <div className="relative">
                    <div className="bg-white rounded-xl p-4 flex items-center justify-center">
                      <img src={uploadPreview} alt="Preview QRIS" className="w-48 h-48 object-contain" />
                    </div>
                    <button
                      onClick={() => { setUploadFile(null); setUploadPreview(null); setUploadedUrl(null); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-white/10 hover:border-amber-500/40 rounded-xl p-8 flex flex-col items-center gap-3 transition-all group"
                  >
                    <div className="w-12 h-12 bg-amber-500/10 group-hover:bg-amber-500/20 rounded-xl flex items-center justify-center transition-all">
                      <QrCode className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-stone-300 text-sm font-medium">Klik untuk pilih gambar QRIS</p>
                      <p className="text-stone-500 text-xs mt-1">PNG, JPG, JPEG</p>
                    </div>
                  </button>
                )}
              </div>

              {/* Tombol upload */}
              {uploadFile && !uploadedUrl && (
                <button
                  onClick={handleUploadQris}
                  disabled={uploading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-40 text-black font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                >
                  {uploading
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Mengupload...</>
                    : <><Upload className="w-4 h-4" />Upload QRIS</>
                  }
                </button>
              )}

              {/* URL hasil upload */}
              {uploadedUrl && (
                <div className="space-y-2">
                  <p className="text-stone-400 text-xs font-medium">URL QRIS — salin dan kirim ke Admin:</p>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-white text-xs flex-1 truncate">{uploadedUrl}</p>
                    <button
                      onClick={handleCopyUrl}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        copied
                          ? "bg-green-500/20 text-green-400"
                          : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                      }`}
                    >
                      {copied ? <><Check className="w-3 h-3" />Disalin!</> : <><Copy className="w-3 h-3" />Salin</>}
                    </button>
                  </div>
                  <p className="text-stone-500 text-xs">
                    Kirim URL ini ke Admin agar QRIS bisa tampil di halaman pembayaran pelanggan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Toko Saya</h1>
          <p className="text-stone-400 mt-1 text-sm">Kelola toko dan informasi warungmu</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold rounded-xl transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Buat Toko</span>
          <span className="sm:hidden">Buat</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Belum ada toko</h3>
          <p className="text-stone-400 text-sm mb-6 max-w-xs">
            Buat toko pertamamu dan mulai kelola menu digital
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold rounded-xl transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Buat Toko Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-[#1A1208] border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-amber-500/10 transition-all duration-200 fade-in"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm sm:text-base">{store.name}</h3>
                    <p className="text-stone-500 text-xs">/{store.slug}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${
                  store.isActive
                    ? "bg-green-500/15 text-green-400"
                    : "bg-red-500/15 text-red-400"
                }`}>
                  {store.isActive
                    ? <><CheckCircle className="w-3 h-3" />Aktif</>
                    : <><XCircle className="w-3 h-3" />Nonaktif</>
                  }
                </span>
              </div>

              <div className="space-y-1.5 mb-4">
                {store.description && (
                  <p className="text-stone-400 text-sm line-clamp-2">{store.description}</p>
                )}
                {store.address && (
                  <div className="flex items-center gap-2 text-stone-400 text-xs sm:text-sm">
                    <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span className="truncate">{store.address}</span>
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-center gap-2 text-stone-400 text-xs sm:text-sm">
                    <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    {store.phone}
                  </div>
                )}
                {store.qrisImageUrl ? (
                  <div className="flex items-center gap-2 text-green-400 text-xs sm:text-sm">
                    <QrCode className="w-3.5 h-3.5 shrink-0" />
                    QRIS sudah diatur
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-stone-500 text-xs sm:text-sm">
                    <QrCode className="w-3.5 h-3.5 shrink-0" />
                    QRIS belum diatur
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-white/5">
                <button
                  onClick={() => setUploadStore(store)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-stone-300 hover:text-amber-400 hover:bg-amber-500/10 active:scale-[0.98] border border-white/10 rounded-xl transition-all text-sm font-medium"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  QRIS
                </button>
                <button
                  onClick={() => setEditStore(store)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-stone-300 hover:text-amber-400 hover:bg-amber-500/10 active:scale-[0.98] border border-white/10 rounded-xl transition-all text-sm font-medium"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(store.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-stone-300 hover:text-red-400 hover:bg-red-500/10 active:scale-[0.98] border border-white/10 rounded-xl transition-all text-sm font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}