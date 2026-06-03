"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Clock, ChefHat, Bell,
  CheckCircle, XCircle, Loader2, UtensilsCrossed,
  ShoppingBag, Trash2, FileText,
} from "lucide-react";
import { ordersApi, Order } from "@/lib/ordersApi";
import jsPDF from "jspdf";

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

  const downloadStruk = (order: Order) => {
    const doc = new jsPDF({ unit: "mm", format: [80, 220] });
    const w = 80;
    let y = 8;

    // Header
    doc.setFillColor(26, 18, 8);
    doc.rect(0, 0, w, 28, "F");
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(245, 158, 11);
    doc.text(order.store?.name || "MenuQR", w / 2, y + 4, { align: "center" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 180, 180);
    if (order.store?.address) {
      doc.text(order.store.address, w / 2, y + 10, { align: "center" });
    }
    if (order.store?.phone) {
      doc.text(order.store.phone, w / 2, y + 15, { align: "center" });
    }
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text("Powered by MenuQR", w / 2, y + 20, { align: "center" });
    y = 32;

    // Info Pesanan
    doc.setDrawColor(60, 40, 20);
    doc.setLineWidth(0.3);
    doc.line(5, y, w - 5, y); y += 4;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(245, 158, 11);
    doc.text("DETAIL PESANAN", w / 2, y, { align: "center" }); y += 4;
    doc.line(5, y, w - 5, y); y += 4;

    const infoRows = [
      { label: "No. Pesanan", value: order.orderNumber },
      { label: "Meja", value: `#${order.tableNumber}` },
      { label: "Tanggal", value: new Date(order.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
      { label: "Status", value: order.status },
    ];

    infoRows.forEach((row) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(row.label, 5, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50, 50, 50);
      doc.text(row.value, w - 5, y, { align: "right" });
      y += 5;
    });

    y += 2;
    doc.line(5, y, w - 5, y); y += 4;

    // Header Tabel
    doc.setFillColor(245, 158, 11);
    doc.rect(5, y - 3, w - 10, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);
    doc.text("Item", 7, y + 1);
    doc.text("Qty", 50, y + 1, { align: "center" });
    doc.text("Total", w - 7, y + 1, { align: "right" });
    y += 7;

    // Items
    order.items.forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(248, 244, 240);
        doc.rect(5, y - 3, w - 10, 6, "F");
      }
      const name = item.menuItem.name.length > 24
        ? item.menuItem.name.substring(0, 24) + "..."
        : item.menuItem.name;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(30, 30, 30);
      doc.text(name, 7, y);
      doc.text(String(item.qty), 50, y, { align: "center" });
      doc.text(formatPrice(item.subtotal), w - 7, y, { align: "right" });
      y += 6;
      if (item.note) {
        doc.setFontSize(6.5);
        doc.setTextColor(120, 120, 120);
        doc.text(`  Catatan: ${item.note}`, 7, y);
        doc.setFontSize(7.5);
        y += 4;
      }
    });

    y += 1;
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.5);
    doc.line(5, y, w - 5, y); y += 1;

    // Total
    doc.setFillColor(26, 18, 8);
    doc.rect(5, y, w - 10, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(245, 158, 11);
    doc.text("TOTAL", 9, y + 6);
    doc.text(formatPrice(order.totalAmount), w - 7, y + 6, { align: "right" });
    y += 13;

    // Catatan
    if (order.notes) {
      doc.setDrawColor(60, 40, 20);
      doc.setLineWidth(0.3);
      doc.line(5, y, w - 5, y); y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text("Catatan:", 5, y); y += 4;
      doc.setFont("helvetica", "normal");
      doc.text(order.notes, 5, y); y += 6;
    }

    // Footer
    doc.setDrawColor(60, 40, 20);
    doc.setLineWidth(0.3);
    doc.line(5, y, w - 5, y); y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(245, 158, 11);
    doc.text("Terima kasih telah memesan!", w / 2, y, { align: "center" }); y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("Powered by MenuQR", w / 2, y, { align: "center" });

    doc.save(`struk-${order.orderNumber}.pdf`);
  };

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
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
      `}</style>

      {/* Header */}
      <div className="bg-[#1A1208] border-b border-white/5 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.push(`/menu/${slug}`)} className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Menu</span>
          </button>
          <p className="text-white font-bold text-sm">Riwayat Pesanan</p>
          {orders.length > 0 ? (
            <button onClick={handleClearHistory} className="text-red-400 hover:text-red-300 transition-colors p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          ) : <div className="w-6" />}
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

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-stone-400 text-xs">Total</span>
                    <span className="text-amber-400 font-black text-sm">{formatPrice(order.totalAmount)}</span>
                  </div>

                  {order.status === "COMPLETED" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadStruk(order); }}
                      className="mt-3 w-full py-2.5 bg-blue-500/15 hover:bg-blue-500/25 active:scale-[0.98] text-blue-400 font-medium rounded-xl transition-all text-xs flex items-center justify-center gap-2 border border-blue-500/20"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Download Struk PDF
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}