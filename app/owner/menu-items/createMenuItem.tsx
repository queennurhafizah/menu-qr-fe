"use client";

import { useState, useRef, useEffect } from "react";
import { X, Check, AlertCircle, Loader2, Upload, ImageIcon, ChevronRight } from "lucide-react";
import { categoriesApi, Category } from "@/lib/categoriesApi";
import { menuItemsApi, CreateMenuItemBody, MenuItem } from "@/lib/menuItemsApi";
import { storesApi } from "@/lib/storesApi";

interface Props {
  onClose: () => void;
  onCreated: () => void;
  defaultCategoryId?: string;
}

export default function CreateMenuItem({ onClose, onCreated, defaultCategoryId }: Props) {
  // Step 1: form data
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(defaultCategoryId || "");
  const [form, setForm] = useState<CreateMenuItemBody>({
    name: "",
    description: "",
    price: 0,
    sortOrder: 0,
  });
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [error, setError] = useState("");

  // Step 2: upload foto
  const [step, setStep] = useState<1 | 2>(1);
  const [createdItem, setCreatedItem] = useState<MenuItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    storesApi.getMy()
      .then(async (stores) => {
        if (stores.length === 0) return;
        const allCategories: Category[] = [];
        for (const store of stores) {
          const cats = await categoriesApi.getAll(store.id);
          allCategories.push(...cats);
        }
        setCategories(allCategories);
        if (!defaultCategoryId && allCategories.length > 0) {
          setSelectedCategoryId(allCategories[0].id);
        }
      })
      .catch(() => setError("Gagal memuat kategori"))
      .finally(() => setLoadingCategories(false));
  }, [defaultCategoryId]);

  const set = (key: keyof CreateMenuItemBody) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({
        ...f,
        [key]: key === "price" || key === "sortOrder"
          ? Number(e.target.value)
          : e.target.value,
      }));

  // Step 1 → buat item
  const handleCreate = async () => {
    setError("");
    if (!form.name.trim()) { setError("Nama menu wajib diisi"); return; }
    if (!selectedCategoryId) { setError("Pilih kategori terlebih dahulu"); return; }
    if (form.price < 0) { setError("Harga tidak boleh negatif"); return; }
    setLoadingCreate(true);
    try {
      const item = await menuItemsApi.create(selectedCategoryId, form);
      setCreatedItem(item);
      setStep(2); // lanjut ke step 2
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal membuat menu item");
    } finally {
      setLoadingCreate(false);
    }
  };

  // Step 2 → upload foto
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !createdItem) return;

    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    setUploadingImage(true);
    try {
      await menuItemsApi.uploadImage(createdItem.id, file);
      setUploadDone(true);
    } catch {
      setError("Gagal upload gambar, tapi item sudah tersimpan");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFinish = () => {
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1208] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/5 sticky top-0 bg-[#1A1208] z-10">
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg">
              {step === 1 ? "Tambah Menu Item" : "Upload Foto Menu"}
            </h3>
            {/* Step indicator */}
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-2 h-2 rounded-full transition-colors ${step === 1 ? "bg-amber-500" : "bg-amber-500/40"}`} />
              <div className="w-3 h-px bg-white/10" />
              <div className={`w-2 h-2 rounded-full transition-colors ${step === 2 ? "bg-amber-500" : "bg-white/10"}`} />
              <span className="text-stone-500 text-xs ml-1">Step {step} / 2</span>
            </div>
          </div>
          <button
            onClick={step === 1 ? onClose : handleFinish}
            className="text-stone-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── STEP 1: Form ── */}
        {step === 1 && (
          <>
            <div className="p-5 sm:p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Kategori */}
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-2">Kategori</label>
                {loadingCategories ? (
                  <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                    <Loader2 className="w-4 h-4 text-stone-400 animate-spin" />
                    <span className="text-stone-400 text-sm">Memuat kategori...</span>
                  </div>
                ) : (
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0F0D0A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
                  >
                    {categories.length === 0 ? (
                      <option value="">Belum ada kategori</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    )}
                  </select>
                )}
              </div>

              {/* Nama */}
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-2">Nama Menu</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Contoh: Mie Goreng Spesial"
                  autoFocus
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-2">
                  Deskripsi <span className="text-stone-500 font-normal">(opsional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Deskripsi singkat menu..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all resize-none text-sm"
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
                    placeholder="0"
                    min={0}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
                  />
                </div>
                {form.price > 0 && (
                  <p className="text-stone-400 text-xs mt-1.5">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(form.price)}
                  </p>
                )}
              </div>

              {/* Urutan */}
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-2">
                  Urutan <span className="text-stone-500 font-normal">(opsional)</span>
                </label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={set("sortOrder")}
                  min={0}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
                />
                <p className="text-stone-500 text-xs mt-1.5">Angka kecil tampil lebih dulu</p>
              </div>
            </div>

            <div className="flex gap-3 p-5 sm:p-6 border-t border-white/5">
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-white/10 rounded-xl text-stone-300 hover:bg-white/5 active:scale-[0.98] transition-all font-medium text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleCreate}
                disabled={loadingCreate || loadingCategories}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50 rounded-xl text-black font-bold transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loadingCreate
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <ChevronRight className="w-4 h-4" />
                }
                {loadingCreate ? "Menyimpan..." : "Lanjut →"}
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: Upload Foto ── */}
        {step === 2 && (
          <>
            <div className="p-5 sm:p-6 space-y-4">

              {/* Info item yang baru dibuat */}
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400 shrink-0" />
                <p className="text-green-300 text-sm">
                  <span className="font-semibold">{createdItem?.name}</span> berhasil dibuat! Sekarang tambahkan foto (opsional).
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Area upload */}
              <div
                onClick={() => !uploadingImage && fileInputRef.current?.click()}
                className={`relative w-full h-48 border-2 border-dashed rounded-xl overflow-hidden transition-all ${
                  uploadDone
                    ? "border-green-500/40 bg-green-500/5"
                    : "border-white/10 bg-white/5 hover:border-amber-500/40 hover:bg-white/[0.07] cursor-pointer"
                }`}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    {!uploadDone && !uploadingImage && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex items-center gap-2 text-white text-sm font-medium">
                          <Upload className="w-4 h-4" />
                          Ganti Foto
                        </div>
                      </div>
                    )}
                    {uploadDone && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Terupload
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-stone-400" />
                    </div>
                    <p className="text-stone-300 text-sm font-medium">Klik untuk pilih foto</p>
                    <p className="text-stone-500 text-xs">JPG, PNG, max 5MB</p>
                  </div>
                )}

                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
                    <p className="text-white text-sm">Mengupload foto...</p>
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

              <p className="text-stone-500 text-xs text-center">
                Foto bisa ditambahkan atau diganti kapan saja melalui menu Edit
              </p>
            </div>

            <div className="flex gap-3 p-5 sm:p-6 border-t border-white/5">
              {/* Lewati — kalau belum upload */}
              {!uploadDone && (
                <button
                  onClick={handleFinish}
                  disabled={uploadingImage}
                  className="flex-1 py-3 border border-white/10 rounded-xl text-stone-300 hover:bg-white/5 active:scale-[0.98] disabled:opacity-40 transition-all font-medium text-sm"
                >
                  Lewati
                </button>
              )}

              {/* Selesai — setelah upload atau kapan saja */}
              <button
                onClick={handleFinish}
                disabled={uploadingImage}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50 rounded-xl text-black font-bold transition-all flex items-center justify-center gap-2 text-sm"
              >
                {uploadingImage
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Check className="w-4 h-4" />
                }
                {uploadDone ? "Selesai" : "Lewati & Selesai"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}