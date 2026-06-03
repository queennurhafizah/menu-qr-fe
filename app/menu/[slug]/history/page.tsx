"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Clock, ChefHat, Bell,
  CheckCircle, XCircle, Loader2, UtensilsCrossed,
  ShoppingBag, Trash2,
} from "lucide-react";
import { ordersApi, Order } from "@/lib/ordersApi";

const STATUS_CONFIG = {
  PENDING: { label: "Menunggu", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/15" },
  PREPARING: { label: "Dimasak", icon: ChefHat, color: "text-blue-400", bg: "bg-blue-500/15" },
  READY: { label: "Siap!", icon: Bell, color: "text-green-400", bg: "bg-green-500/15" },
  COMPLETED: { label: "Selesai", icon: CheckCircle, color: "text-stone-400", bg: "bg-white/5" },
  CANCELLED: { label: "Dibatalkan", icon: XCircle, color: "text-red-400", bg: "bg-red-500/15" },
};

export default function HistoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderNumbers, setOrderNumbers] = useState<string[]>([]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  const fetchOrders = useCallback(async (numbers: string[]) => {
    if (numbers.length === 0) { setLoading(false); return; }
    try {
      const results = await Promise.allSettled(
        numbers.map((num) => ordersApi.trackOrder(num))
      );
      const validOrders = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<Order>).value);
      setOrders(validOrders);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const historyKey = `orders_history_${slug}`;
    const saved = JSON.parse(localStorage.getItem(historyKey) || "[]");
    setOrderNumbers(saved);
    fetchOrders(saved);
  }, [slug, fetchOrders]);

  const handleClearHistory = () => {
    if (!confirm("Yakin hapus semua riwayat pesanan?")) return;
    localStorage.removeItem(`orders_history_${slug}`);
    setOrders([]);
    setOrderNumbers([]);
  };

  return (
    <div className="min-h-screen bg-[#0F0D0A]">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
      `}</style>

      {/* Header */}
      <div className="bg-[#1A1208] border-b border-white/5 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push(`/menu/${slug}`)}
            className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Menu</span>
          </button>
          <p className="text-white font-bold text-sm">Riwayat Pesanan</p>
          {orders.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-red-400 hover:text-red-300 transition-colors p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {orders.length === 0 && <div className="w-6" />}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Belum ada riwayat</h3>
            <p className="text-stone-400 text-sm">Pesanan yang kamu buat akan muncul di sini</p>
            <button
              onClick={() => router.push(`/menu/${slug}`)}
              className="mt-6 px-6 py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold rounded-xl transition-all text-sm"
            >
              Pesan Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-3 fade-in">
            <p className="text-stone-400 text-xs mb-4">{orders.length} pesanan dari device ini</p>
            {orders.map((order) => {
              const config = STATUS_CONFIG[order.status];
              const StatusIcon = config.icon;
              return (
                <div
                  key={order.id}
                  onClick={() => router.push(`/menu/${slug}/track?order=${order.orderNumber}`)}
                  className="bg-[#1A1208] border border-white/5 rounded-2xl p-4 hover:border-amber-500/20 transition-all cursor-pointer active:scale-[0.99]"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-bold text-sm">{order.orderNumber}</p>
                      <p className="text-stone-500 text-xs mt-0.5">
                        Meja #{order.tableNumber} · {new Date(order.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.bg}`}>
                      <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
                      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1 mb-3">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        {item.menuItem.imageUrl ? (
                          <img src={item.menuItem.imageUrl} alt={item.menuItem.name} className="w-6 h-6 rounded-md object-cover shrink-0" />
                        ) : (
                          <div className="w-6 h-6 bg-white/5 rounded-md flex items-center justify-center shrink-0">
                            <UtensilsCrossed className="w-3 h-3 text-stone-600" />
                          </div>
                        )}
                        <span className="text-stone-300 text-xs truncate">{item.menuItem.name}</span>
                        <span className="text-stone-500 text-xs shrink-0">x{item.qty}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-stone-500 text-xs">+{order.items.length - 3} item lainnya</p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-stone-400 text-xs">Total</span>
                    <span className="text-amber-400 font-black text-sm">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}