"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2, RefreshCw, Clock, ChefHat,
  Bell, CheckCircle, XCircle, ChevronRight,
  ShoppingBag, TrendingUp, X, FileText,
} from "lucide-react";
import { storesApi, Store } from "@/lib/storesApi";
import { ownerOrdersApi, Order } from "@/lib/ordersApi";
import { exportMutasiPDF } from "@/lib/pdf/mutasi";

const STATUS_CONFIG = {
  PENDING: { label: "Menunggu", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30" },
  PREPARING: { label: "Dimasak", icon: ChefHat, color: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/30" },
  READY: { label: "Siap", icon: Bell, color: "text-green-400", bg: "bg-green-500/15", border: "border-green-500/30" },
  COMPLETED: { label: "Selesai", icon: CheckCircle, color: "text-stone-400", bg: "bg-white/5", border: "border-white/10" },
  CANCELLED: { label: "Dibatalkan", icon: XCircle, color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30" },
};

const FILTER_TABS = [
  { label: "Semua", value: "" },
  { label: "Menunggu", value: "PENDING" },
  { label: "Dimasak", value: "PREPARING" },
  { label: "Siap", value: "READY" },
  { label: "Selesai", value: "COMPLETED" },
  { label: "Dibatalkan", value: "CANCELLED" },
];

function OrderCard({ order, onNext, onCancel, loadingId }: {
  order: Order;
  onNext: (id: string) => void;
  onCancel: (id: string) => void;
  loadingId: string | null;
}) {
  const config = STATUS_CONFIG[order.status];
  const StatusIcon = config.icon;
  const isLoading = loadingId === order.id;
  const canNext = order.status !== "COMPLETED" && order.status !== "CANCELLED";
  const canCancel = order.status === "PENDING" || order.status === "PREPARING";

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  const nextLabel: Record<string, string> = {
    PENDING: "Mulai Masak →",
    PREPARING: "Tandai Siap →",
    READY: "Selesai →",
  };

  return (
    <div className={`bg-[#1A1208] border rounded-2xl overflow-hidden transition-all hover:border-opacity-60 ${config.border}`}>
      <div className={`flex items-center justify-between px-4 py-3 ${config.bg}`}>
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white font-black text-sm">Meja #{order.tableNumber}</span>
          <span className="text-stone-400 text-xs">{order.orderNumber}</span>
        </div>
      </div>
      <div className="px-4 py-3 space-y-1.5">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <span className="text-stone-300 text-sm">
              {item.menuItem.name}<span className="text-stone-500"> x{item.qty}</span>
            </span>
            <span className="text-stone-400 text-sm">{formatPrice(item.subtotal)}</span>
          </div>
        ))}
        {order.notes && (
          <p className="text-stone-500 text-xs mt-2 pt-2 border-t border-white/5 whitespace-pre-wrap">
            📝 {order.notes}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
        <div>
          <p className="text-stone-500 text-xs">Total</p>
          <p className="text-amber-400 font-black">{formatPrice(order.totalAmount)}</p>
        </div>
        <div className="flex items-center gap-2">
          {canCancel && (
            <button
              onClick={() => onCancel(order.id)}
              disabled={isLoading}
              className="px-3 py-2 text-red-400 hover:bg-red-500/10 active:scale-[0.98] border border-red-500/20 rounded-xl transition-all text-xs font-medium disabled:opacity-40 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Batalkan
            </button>
          )}
          {canNext && (
            <button
              onClick={() => onNext(order.id)}
              disabled={isLoading}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold rounded-xl transition-all text-xs disabled:opacity-40 flex items-center gap-1.5"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronRight className="w-3 h-3" />}
              {nextLabel[order.status] || "Lanjut"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<{ totalOrders: number; totalRevenue: number; byStatus: Record<string, number> } | null>(null);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    storesApi.getMy()
      .then((data) => {
        setStores(data);
        if (data.length > 0) setSelectedStore(data[0]);
      })
      .finally(() => setLoadingStores(false));
  }, []);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (!selectedStore) return;
    if (isRefresh) setRefreshing(true);
    else setLoadingOrders(true);
    try {
      const [ordersData, summaryData] = await Promise.all([
        ownerOrdersApi.getAll(selectedStore.id, activeFilter),
        ownerOrdersApi.dailySummary(selectedStore.id),
      ]);
      setOrders(ordersData);
      setSummary(summaryData);
    } catch {
      showToast("Gagal memuat pesanan");
    } finally {
      setLoadingOrders(false);
      setRefreshing(false);
    }
  }, [selectedStore, activeFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    const interval = setInterval(() => fetchOrders(true), 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleNext = async (id: string) => {
    setLoadingId(id);
    try {
      await ownerOrdersApi.nextStatus(id);
      fetchOrders(true);
      showToast("Status pesanan diperbarui!");
    } catch {
      showToast("Gagal update status");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Yakin ingin membatalkan pesanan ini?")) return;
    setLoadingId(id);
    try {
      await ownerOrdersApi.setStatus(id, "CANCELLED");
      fetchOrders(true);
      showToast("Pesanan dibatalkan");
    } catch {
      showToast("Gagal membatalkan pesanan");
    } finally {
      setLoadingId(null);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {toast && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 bg-amber-500 text-black px-4 py-3 rounded-xl font-medium text-sm shadow-lg fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white">Pesanan Masuk</h1>
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-black text-xs font-black px-2 py-1 rounded-full animate-pulse">
                {pendingCount} baru
              </span>
            )}
          </div>
          <p className="text-stone-400 mt-1 text-sm">Kelola dan update status pesanan</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/60 transition-all"
          />
          <button
            onClick={() => selectedStore && exportMutasiPDF(orders, selectedStore, filterDate)}
            disabled={orders.length === 0 || !selectedStore}
            className="flex items-center gap-2 px-3 py-2.5 bg-blue-500 hover:bg-blue-400 active:scale-[0.98] disabled:opacity-40 text-white font-bold rounded-xl transition-all text-sm"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 rounded-xl transition-all text-sm text-stone-300"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {stores.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => setSelectedStore(store)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                selectedStore?.id === store.id ? "bg-amber-500 text-black" : "bg-white/5 text-stone-300 hover:bg-white/10 border border-white/10"
              }`}
            >
              {store.name}
            </button>
          ))}
        </div>
      )}

      {loadingStores ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Belum punya toko</h3>
          <p className="text-stone-400 text-sm">Buat toko terlebih dahulu.</p>
        </div>
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Total Pesanan", value: summary.totalOrders, icon: ShoppingBag },
                { label: "Pendapatan Hari Ini", value: formatPrice(summary.totalRevenue), icon: TrendingUp },
                { label: "Menunggu", value: summary.byStatus?.PENDING ?? 0, icon: Clock },
                { label: "Dimasak", value: summary.byStatus?.PREPARING ?? 0, icon: ChefHat },
              ].map((card) => (
                <div key={card.label} className="bg-[#1A1208] border border-white/5 rounded-2xl p-4 hover:border-amber-500/20 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-stone-400 text-xs">{card.label}</p>
                    <card.icon className="w-4 h-4 text-amber-400/60" />
                  </div>
                  <p className="text-white font-black text-lg sm:text-xl">{card.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                  activeFilter === tab.value ? "bg-amber-500 text-black" : "bg-white/5 text-stone-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                {tab.label}
                {tab.value === "PENDING" && pendingCount > 0 && (
                  <span className="ml-1.5 bg-black/20 text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>

          {loadingOrders ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">
                {activeFilter ? `Tidak ada pesanan ${STATUS_CONFIG[activeFilter as keyof typeof STATUS_CONFIG]?.label}` : "Belum ada pesanan"}
              </h3>
              <p className="text-stone-400 text-sm">
                {activeFilter ? "Coba pilih filter lain" : "Pesanan akan muncul di sini saat pelanggan memesan"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 fade-in">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} onNext={handleNext} onCancel={handleCancel} loadingId={loadingId} />
              ))}
            </div>
          )}

          <p className="text-center text-stone-600 text-xs mt-6">
            Diperbarui otomatis setiap 15 detik
          </p>
        </>
      )}
    </div>
  );
}