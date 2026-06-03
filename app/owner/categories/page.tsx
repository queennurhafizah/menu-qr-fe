"use client";

import { useEffect, useState } from "react";
import {
  Plus, Pencil, Trash2, Loader2,
  LayoutList, CheckCircle, XCircle,
  ShoppingBag, AlertCircle,
} from "lucide-react";
import { storesApi, Store } from "@/lib/storesApi";
import { categoriesApi, Category } from "@/lib/categoriesApi";
import CreateCategory from "./create";
import EditCategory from "./edit";

export default function CategoriesPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [toast, setToast] = useState("");

  // Ambil semua toko milik owner
  useEffect(() => {
    storesApi.getMy()
      .then((data) => {
        setStores(data);
        if (data.length > 0) setSelectedStore(data[0]);
      })
      .catch(() => showToast("Gagal memuat toko"))
      .finally(() => setLoadingStores(false));
  }, []);

  // Ambil kategori saat toko dipilih
  useEffect(() => {
    if (!selectedStore) return;
    setLoadingCategories(true);
    categoriesApi.getAll(selectedStore.id)
      .then(setCategories)
      .catch(() => showToast("Gagal memuat kategori"))
      .finally(() => setLoadingCategories(false));
  }, [selectedStore]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchCategories = () => {
    if (!selectedStore) return;
    setLoadingCategories(true);
    categoriesApi.getAll(selectedStore.id)
      .then(setCategories)
      .catch(() => showToast("Gagal memuat kategori"))
      .finally(() => setLoadingCategories(false));
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Yakin hapus kategori "${category.name}"?`)) return;
    try {
      await categoriesApi.delete(category.id);
      fetchCategories();
      showToast("Kategori berhasil dihapus!");
    } catch {
      showToast("Gagal menghapus kategori");
    }
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

      {showCreate && selectedStore && (
        <CreateCategory
          storeId={selectedStore.id}
          onClose={() => setShowCreate(false)}
          onCreated={() => { fetchCategories(); showToast("Kategori berhasil ditambahkan!"); }}
        />
      )}

      {editCategory && (
        <EditCategory
          category={editCategory}
          onClose={() => setEditCategory(null)}
          onSaved={() => { fetchCategories(); showToast("Kategori berhasil diupdate!"); }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Kategori Menu</h1>
          <p className="text-stone-400 mt-1 text-sm">Kelola kategori menu tokomu</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={!selectedStore}
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Kategori</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>

      {/* Pilih toko — kalau owner punya lebih dari 1 toko */}
      {stores.length > 1 && (
        <div className="mb-6">
          <p className="text-stone-400 text-xs font-medium mb-2 uppercase tracking-wider">Pilih Toko</p>
          <div className="flex flex-wrap gap-2">
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                  selectedStore?.id === store.id
                    ? "bg-amber-500 text-black"
                    : "bg-white/5 text-stone-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                {store.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading toko */}
      {loadingStores ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>

      /* Belum punya toko */
      ) : stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Belum punya toko</h3>
          <p className="text-stone-400 text-sm max-w-xs">
            Buat toko terlebih dahulu sebelum menambahkan kategori menu.
          </p>
        </div>

      /* Loading kategori */
      ) : loadingCategories ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>

      /* Belum ada kategori */
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
            <LayoutList className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Belum ada kategori</h3>
          <p className="text-stone-400 text-sm mb-6 max-w-xs">
            Tambahkan kategori seperti Minuman, Makanan, atau Dessert.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold rounded-xl transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Kategori Pertama
          </button>
        </div>

      /* Daftar kategori */
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="space-y-3 sm:hidden">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-[#1A1208] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-500/15 rounded-xl flex items-center justify-center shrink-0">
                      <LayoutList className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{cat.name}</p>
                      <p className="text-stone-500 text-xs">Urutan: {cat.sortOrder}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                    cat.isActive ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                  }`}>
                    {cat.isActive
                      ? <><CheckCircle className="w-3 h-3" />Aktif</>
                      : <><XCircle className="w-3 h-3" />Nonaktif</>
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="flex items-center gap-1.5 text-stone-400 text-xs">
                    <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
                    {cat._count?.menuItems ?? 0} item
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditCategory(cat)}
                      className="p-2 text-stone-400 hover:text-amber-400 hover:bg-amber-500/10 active:scale-95 rounded-lg transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-2 text-stone-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: tabel */}
          <div className="hidden sm:block bg-[#1A1208] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-stone-400 text-sm font-medium">Kategori</th>
                  <th className="text-left px-6 py-4 text-stone-400 text-sm font-medium">Urutan</th>
                  <th className="text-left px-6 py-4 text-stone-400 text-sm font-medium hidden md:table-cell">Item Menu</th>
                  <th className="text-left px-6 py-4 text-stone-400 text-sm font-medium">Status</th>
                  <th className="text-right px-6 py-4 text-stone-400 text-sm font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-500/15 rounded-xl flex items-center justify-center shrink-0">
                          <LayoutList className="w-4 h-4 text-amber-400" />
                        </div>
                        <p className="text-white font-medium text-sm">{cat.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-stone-300 text-sm">{cat.sortOrder}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-stone-300 text-sm">
                        <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
                        {cat._count?.menuItems ?? 0} item
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        cat.isActive ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                      }`}>
                        {cat.isActive
                          ? <><CheckCircle className="w-3 h-3" />Aktif</>
                          : <><XCircle className="w-3 h-3" />Nonaktif</>
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditCategory(cat)}
                          className="p-2 text-stone-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all active:scale-95"
                          title="Edit kategori"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-2 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all active:scale-95"
                          title="Hapus kategori"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}