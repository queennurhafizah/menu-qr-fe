"use client";

import { useEffect, useState } from "react";
import {
  Search, Loader2, Store, MapPin, Phone,
  QrCode, CheckCircle, XCircle, Pencil,
  Trash2, CreditCard, User,
} from "lucide-react";
import { storesApi, Store as StoreType } from "@/lib/storesApi";
import EditStore from "./edit";
import Payment from "./payment";

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editStore, setEditStore] = useState<StoreType | null>(null);
  const [paymentStore, setPaymentStore] = useState<StoreType | null>(null);
  const [toast, setToast] = useState("");

  const fetchStores = async () => {
    try {
      const data = await storesApi.getAll();
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

  const handleDelete = async (store: StoreType) => {
    if (!confirm(`Yakin hapus toko "${store.name}"? Semua data akan hilang.`)) return;
    try {
      await storesApi.delete(store.id);
      fetchStores();
      showToast("Toko berhasil dihapus!");
    } catch {
      showToast("Gagal menghapus toko");
    }
  };

  const filtered = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase())
  );

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

      {editStore && (
        <EditStore
          store={editStore}
          onClose={() => setEditStore(null)}
          onSaved={() => { fetchStores(); showToast("Toko berhasil diupdate!"); }}
        />
      )}

      {paymentStore && (
        <Payment
          store={paymentStore}
          onClose={() => setPaymentStore(null)}
          onSaved={() => { fetchStores(); showToast("Info pembayaran berhasil diupdate!"); }}
        />
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-black text-white">Stores Management</h1>
        <p className="text-stone-400 mt-1 text-sm">
          Total {stores.length} toko terdaftar
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4 sm:mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Cari nama atau slug toko..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#1A1208] border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#1A1208] border border-white/5 rounded-2xl p-12 text-center">
          <p className="text-stone-500 text-sm">
            {search ? "Tidak ada toko yang cocok" : "Belum ada toko"}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="space-y-3 sm:hidden">
            {filtered.map((store) => (
              <div key={store.id} className="bg-[#1A1208] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all fade-in">
                {/* Header card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-500/15 rounded-xl flex items-center justify-center shrink-0">
                      <Store className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{store.name}</p>
                      <p className="text-stone-500 text-xs">/{store.slug}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold shrink-0 ${
                    store.isActive ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                  }`}>
                    {store.isActive
                      ? <><CheckCircle className="w-3 h-3" />Aktif</>
                      : <><XCircle className="w-3 h-3" />Nonaktif</>
                    }
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-1 mb-3 text-xs text-stone-400">
                  {store.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                      <span className="truncate">{store.address}</span>
                    </div>
                  )}
                  {store.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-stone-500 shrink-0" />
                      {store.phone}
                    </div>
                  )}
                  {store.bankName && (
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3 h-3 text-stone-500 shrink-0" />
                      {store.bankName} — {store.bankAccount}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-white/5">
                  <button
                    onClick={() => setPaymentStore(store)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-stone-300 hover:text-blue-400 hover:bg-blue-500/10 active:scale-[0.98] border border-white/10 rounded-xl transition-all text-xs font-medium"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Payment
                  </button>
                  <button
                    onClick={() => setEditStore(store)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-stone-300 hover:text-amber-400 hover:bg-amber-500/10 active:scale-[0.98] border border-white/10 rounded-xl transition-all text-xs font-medium"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(store)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-stone-300 hover:text-red-400 hover:bg-red-500/10 active:scale-[0.98] border border-white/10 rounded-xl transition-all text-xs font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: tabel */}
          <div className="hidden sm:block bg-[#1A1208] border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-4 text-stone-400 text-sm font-medium">Toko</th>
                    <th className="text-left px-6 py-4 text-stone-400 text-sm font-medium hidden md:table-cell">Owner</th>
                    <th className="text-left px-6 py-4 text-stone-400 text-sm font-medium hidden lg:table-cell">Info</th>
                    <th className="text-left px-6 py-4 text-stone-400 text-sm font-medium">Status</th>
                    <th className="text-right px-6 py-4 text-stone-400 text-sm font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((store) => (
                    <tr key={store.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      {/* Toko */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-amber-500/15 rounded-xl flex items-center justify-center shrink-0">
                            <Store className="w-4 h-4 text-amber-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{store.name}</p>
                            <p className="text-stone-500 text-xs">/{store.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-stone-300 text-sm">
                          <User className="w-3.5 h-3.5 text-stone-500" />
                          <span className="text-xs text-stone-400 truncate max-w-[120px]">
                            {store.ownerId.slice(0, 8)}...
                          </span>
                        </div>
                      </td>

                      {/* Info */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="space-y-1">
                          {store.phone && (
                            <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                              <Phone className="w-3 h-3 text-stone-500" />
                              {store.phone}
                            </div>
                          )}
                          {store.bankName && (
                            <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                              <CreditCard className="w-3 h-3 text-stone-500" />
                              {store.bankName}
                            </div>
                          )}
                          {store.qrisImageUrl && (
                            <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                              <QrCode className="w-3 h-3 text-stone-500" />
                              QRIS tersedia
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          store.isActive
                            ? "bg-green-500/15 text-green-400"
                            : "bg-red-500/15 text-red-400"
                        }`}>
                          {store.isActive
                            ? <><CheckCircle className="w-3 h-3" />Aktif</>
                            : <><XCircle className="w-3 h-3" />Nonaktif</>
                          }
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPaymentStore(store)}
                            className="p-2 text-stone-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all active:scale-95"
                            title="Update pembayaran"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditStore(store)}
                            className="p-2 text-stone-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all active:scale-95"
                            title="Edit toko"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(store)}
                            className="p-2 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all active:scale-95"
                            title="Hapus toko"
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
          </div>
        </>
      )}
    </div>
  );
}