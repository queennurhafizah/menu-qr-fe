"use client";

import { useEffect, useState } from "react";
import {
  Plus, Pencil, Trash2, Loader2, ShoppingBag,
  AlertCircle, CheckCircle, XCircle, ImageIcon,
} from "lucide-react";
import { storesApi, Store } from "@/lib/storesApi";
import { categoriesApi, Category } from "@/lib/categoriesApi";
import { menuItemsApi, MenuItem } from "@/lib/menuItemsApi";
import CreateMenuItem from "./createMenuItem";
import EditMenuItem from "./EditMenuItem";
import SearchBar from "@/components/search-bar";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://menu-qr-backend-production.up.railway.app";

interface CategoryWithItems extends Category {
  items: MenuItem[];
}

export default function MenuItemsPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [categoriesWithItems, setCategoriesWithItems] = useState<CategoryWithItems[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    storesApi.getMy()
      .then((data) => {
        setStores(data);
        if (data.length > 0) setSelectedStore(data[0]);
      })
      .catch(() => showToast("Gagal memuat toko"))
      .finally(() => setLoadingStores(false));
  }, []);

  useEffect(() => {
    if (!selectedStore) return;
    fetchItems();
  }, [selectedStore]);

  useEffect(() => {
    if (search.trim()) {
      const matchedCat = categoriesWithItems.find(
        (cat) =>
          cat.name.toLowerCase().includes(search.toLowerCase()) ||
          cat.items.some((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
          )
      );
      if (matchedCat) setExpandedCategory(matchedCat.id);
    }
  }, [search]);

  const fetchItems = async () => {
    if (!selectedStore) return;
    setLoadingItems(true);
    try {
      const cats = await categoriesApi.getAll(selectedStore.id);
      const result: CategoryWithItems[] = await Promise.all(
        cats.map(async (cat) => {
          const items = await menuItemsApi.getAll(cat.id);
          return { ...cat, items };
        })
      );
      setCategoriesWithItems(result);
      if (result.length > 0 && !expandedCategory) {
        setExpandedCategory(result[0].id);
      }
    } catch {
      showToast("Gagal memuat menu item");
    } finally {
      setLoadingItems(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Yakin hapus "${item.name}"?`)) return;
    try {
      await menuItemsApi.delete(item.id);
      fetchItems();
      showToast("Menu item berhasil dihapus!");
    } catch {
      showToast("Gagal menghapus menu item");
    }
  };

  const totalItems = categoriesWithItems.reduce((acc, cat) => acc + cat.items.length, 0);

  const filtered = search.trim()
    ? categoriesWithItems
        .map((cat) => ({
          ...cat,
          items: cat.items.filter(
            (item) =>
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.description?.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter(
          (cat) =>
            cat.name.toLowerCase().includes(search.toLowerCase()) ||
            cat.items.length > 0
        )
    : categoriesWithItems;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-down { animation: slideDown 0.2s ease forwards; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 bg-amber-500 text-black px-4 py-3 rounded-xl font-medium text-sm shadow-lg fade-in">
          {toast}
        </div>
      )}

      {showCreate && (
        <CreateMenuItem
          onClose={() => setShowCreate(false)}
          onCreated={() => { fetchItems(); showToast("Menu item berhasil ditambahkan!"); }}
        />
      )}

      {editItem && (
        <EditMenuItem
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => { fetchItems(); showToast("Menu item berhasil diupdate!"); }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Menu Items</h1>
          <p className="text-stone-400 mt-1 text-sm">
            {totalItems} item di {categoriesWithItems.length} kategori
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={!selectedStore || categoriesWithItems.length === 0}
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Item</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Cari nama menu atau kategori..."
        />
      </div>

      {/* Pilih toko */}
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

      {loadingStores || loadingItems ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>

      ) : stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Belum punya toko</h3>
          <p className="text-stone-400 text-sm max-w-xs">Buat toko terlebih dahulu sebelum menambahkan menu.</p>
        </div>

      ) : categoriesWithItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Belum ada kategori</h3>
          <p className="text-stone-400 text-sm max-w-xs">Buat kategori menu terlebih dahulu sebelum menambahkan item.</p>
        </div>

      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && search ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Tidak ditemukan</h3>
              <p className="text-stone-400 text-sm">
                Tidak ada menu yang cocok dengan{" "}
                <span className="text-white font-semibold">"{search}"</span>
              </p>
              <button
                onClick={() => setSearch("")}
                className="mt-4 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
              >
                Hapus pencarian
              </button>
            </div>
          ) : (
            filtered.map((cat) => {
              const isExpanded = expandedCategory === cat.id;
              return (
                <div key={cat.id} className="bg-[#1A1208] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
                  {/* Header kategori */}
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${cat.isActive ? "bg-green-400" : "bg-red-400"}`} />
                      <span className="text-white font-semibold text-sm sm:text-base">{cat.name}</span>
                      <span className="text-stone-500 text-xs bg-white/5 px-2 py-0.5 rounded-lg">
                        {cat.items.length} item
                      </span>
                    </div>
                    <div className={`w-5 h-5 text-stone-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>

                  {/* Items */}
                  {isExpanded && (
                    <div className="border-t border-white/5 slide-down">
                      {cat.items.length === 0 ? (
                        <div className="flex flex-col items-center py-8 text-center">
                          <ShoppingBag className="w-6 h-6 text-stone-600 mb-2" />
                          <p className="text-stone-500 text-sm">Belum ada item di kategori ini</p>
                          <button
                            onClick={() => setShowCreate(true)}
                            className="mt-3 text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors"
                          >
                            + Tambah item pertama
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {cat.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-white/[0.02] transition-colors">
                              {/* Gambar */}
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-white/5">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-stone-600" />
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="text-white font-medium text-sm truncate">{item.name}</p>
                                  <span className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                                    item.isAvailable ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                                  }`}>
                                    {item.isAvailable
                                      ? <><CheckCircle className="w-2.5 h-2.5" />Tersedia</>
                                      : <><XCircle className="w-2.5 h-2.5" />Habis</>
                                    }
                                  </span>
                                </div>
                                {item.description && (
                                  <p className="text-stone-500 text-xs truncate">{item.description}</p>
                                )}
                                <p className="text-amber-400 font-bold text-sm mt-1">
                                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(item.price)}
                                </p>
                              </div>

                              {/* Aksi */}
                              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                <button
                                  onClick={() => setEditItem(item)}
                                  className="p-2 text-stone-400 hover:text-amber-400 hover:bg-amber-500/10 active:scale-95 rounded-lg transition-all"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="p-2 text-stone-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95 rounded-lg transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}