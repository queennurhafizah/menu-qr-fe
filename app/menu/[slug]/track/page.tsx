"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import {
  CheckCircle, Clock, ChefHat, Bell,
  XCircle, Loader2, RefreshCw, ArrowLeft,
  CreditCard, QrCode, FileText,
} from "lucide-react";
import { ordersApi, Order } from "@/lib/ordersApi";
import jsPDF from "jspdf";

const STATUS_CONFIG = {
  PENDING: {
    label: "Menunggu Konfirmasi",
    desc: "Pesananmu sedang menunggu dikonfirmasi dapur",
    icon: Clock, color: "text-amber-400", bg: "bg-amber-500/15", step: 1,
  },
  PREPARING: {
    label: "Sedang Dimasak",
    desc: "Dapur sedang menyiapkan pesananmu",
    icon: ChefHat, color: "text-blue-400", bg: "bg-blue-500/15", step: 2,
  },
  READY: {
    label: "Pesanan Siap!",
    desc: "Pesananmu sudah siap, segera diambil",
    icon: Bell, color: "text-green-400", bg: "bg-green-500/15", step: 3,
  },
  COMPLETED: {
    label: "Selesai",
    desc: "Pesanan telah selesai. Terima kasih!",
    icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/15", step: 4,
  },
  CANCELLED: {
    label: "Dibatalkan",
    desc: "Pesanan telah dibatalkan",
    icon: XCircle, color: "text-red-400", bg: "bg-red-500/15", step: 0,
  },
};

const STEPS = ["PENDING", "PREPARING", "READY", "COMPLETED"];

export default function TrackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const orderNumber = searchParams.get("order") || "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const fetchOrder = useCallback(async (isRefresh = false) => {
    if (!orderNumber) return;
    if (isRefresh) setRefreshing(true);
    try {
      const data = await ordersApi.trackOrder(orderNumber);
      setOrder(data);
      setError("");
    } catch {
      setError("Pesanan tidak ditemukan");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(() => fetchOrder(true), 10000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  useEffect(() => {
    if (order?.status === "COMPLETED" || order?.status === "CANCELLED") {
      localStorage.removeItem(`order_${slug}`);
    }
  }, [order?.status, slug]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  const downloadStruk = () => {
    if (!order) return;
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
        doc.text(`  📝 ${item.note}`, 7, y);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Memuat status pesanan...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-stone-400 text-sm mb-6">{error}</p>
          <button onClick={() => router.push(`/menu/${slug}`)} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold rounded-xl transition-all text-sm">
            Kembali ke Menu
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;
  const currentStep = statusConfig.step;
  const isDone = order.status === "COMPLETED" || order.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-[#0F0D0A]">
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .pulse { animation: pulse 2s infinite; }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
      `}</style>

      {/* Header */}
      <div className="bg-[#1A1208] border-b border-white/5 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.push(`/menu/${slug}`)} className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Menu</span>
          </button>
          <p className="text-white font-bold text-sm">Tracking Pesanan</p>
          <button onClick={() => fetchOrder(true)} disabled={refreshing} className="text-stone-400 hover:text-white transition-colors p-1">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4 fade-in pb-8">
        {/* Order number & status */}
        <div className="bg-[#1A1208] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-stone-400 text-xs">Nomor Pesanan</p>
              <p className="text-white font-black text-lg">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-stone-400 text-xs">Meja</p>
              <p className="text-white font-black text-lg">#{order.tableNumber}</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-4 ${statusConfig.bg} rounded-xl`}>
            <div className={`${order.status === "PENDING" || order.status === "PREPARING" ? "pulse" : ""}`}>
              <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
            </div>
            <div>
              <p className={`font-bold text-base ${statusConfig.color}`}>{statusConfig.label}</p>
              <p className="text-stone-400 text-xs mt-0.5">{statusConfig.desc}</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {order.status !== "CANCELLED" && (
          <div className="bg-[#1A1208] border border-white/5 rounded-2xl p-5">
            <p className="text-stone-400 text-xs font-medium mb-4 uppercase tracking-wider">Progress Pesanan</p>
            <div className="flex items-center">
              {STEPS.map((step, idx) => {
                const stepNum = idx + 1;
                const isCompleted = currentStep > stepNum;
                const isCurrent = currentStep === stepNum;
                const labels = ["Menunggu", "Dimasak", "Siap", "Selesai"];
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted ? "bg-amber-500 border-amber-500" : isCurrent ? "border-amber-500 bg-amber-500/20" : "border-white/10 bg-white/5"
                      }`}>
                        {isCompleted ? <CheckCircle className="w-4 h-4 text-black" /> : (
                          <span className={`text-xs font-bold ${isCurrent ? "text-amber-400" : "text-stone-500"}`}>{stepNum}</span>
                        )}
                      </div>
                      <p className={`text-xs mt-1 font-medium ${isCompleted || isCurrent ? "text-amber-400" : "text-stone-500"}`}>
                        {labels[idx]}
                      </p>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-1 mb-4 transition-all ${currentStep > stepNum ? "bg-amber-500" : "bg-white/10"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rincian pesanan */}
        <div className="bg-[#1A1208] border border-white/5 rounded-2xl p-5">
          <p className="text-stone-400 text-xs font-medium mb-3 uppercase tracking-wider">Rincian Pesanan</p>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.menuItem.imageUrl && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5">
                    <img src={item.menuItem.imageUrl} alt={item.menuItem.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{item.menuItem.name}</p>
                  {item.note && <p className="text-stone-500 text-xs whitespace-pre-wrap">📝 {item.note}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-stone-300 text-sm">x{item.qty}</p>
                  <p className="text-amber-400 text-sm font-bold">{formatPrice(item.subtotal)}</p>
                </div>
              </div>
            ))}
            <div className="border-t border-white/5 pt-3 flex justify-between">
              <span className="text-white font-bold">Total</span>
              <span className="text-amber-400 font-black text-lg">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Info pembayaran */}
        {order.store && (order.store.qrisImageUrl || order.store.bankName) && (
          <div className="bg-[#1A1208] border border-white/5 rounded-2xl p-5">
            <button onClick={() => setShowPayment(!showPayment)} className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-stone-400" />
                <p className="text-white font-medium text-sm">Info Pembayaran</p>
              </div>
              <div className={`transition-transform duration-200 text-stone-400 ${showPayment ? "rotate-180" : ""}`}>▾</div>
            </button>
            {showPayment && (
              <div className="mt-4 space-y-4 fade-in">
                {order.store.qrisImageUrl && (
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-2">
                      <QrCode className="w-4 h-4 text-stone-400" />
                      <p className="text-stone-300 text-sm font-medium">Bayar via QRIS</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl inline-block">
                      <img src={order.store.qrisImageUrl} alt="QRIS" className="w-48 h-48 object-contain mx-auto" />
                    </div>
                  </div>
                )}
                {order.store.bankName && (
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                    <p className="text-stone-400 text-xs font-medium mb-2">Transfer Bank</p>
                    <div className="space-y-1.5">
                      {[
                        { label: "Bank", value: order.store.bankName },
                        { label: "No. Rekening", value: order.store.bankAccount },
                        { label: "Atas Nama", value: order.store.bankHolder },
                      ].map((row) => row.value && (
                        <div key={row.label} className="flex justify-between">
                          <span className="text-stone-400 text-sm">{row.label}</span>
                          <span className="text-white font-bold text-sm">{row.value}</span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t border-white/5 pt-2 mt-1">
                        <span className="text-stone-400 text-sm">Jumlah</span>
                        <span className="text-amber-400 font-black">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tombol Pesan Lagi & Download Struk */}
        {isDone && (
          <>
            <button
              onClick={() => { localStorage.removeItem(`order_${slug}`); router.push(`/menu/${slug}`); }}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold rounded-2xl transition-all text-base"
            >
              🍽️ Pesan Lagi
            </button>
            {order.status === "COMPLETED" && (
              <button
                onClick={downloadStruk}
                className="w-full py-4 bg-blue-500 hover:bg-blue-400 active:scale-[0.98] text-white font-bold rounded-2xl transition-all text-base flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Download Struk PDF
              </button>
            )}
          </>
        )}

        {!isDone && (
          <p className="text-center text-stone-600 text-xs">
            Status diperbarui otomatis setiap 10 detik
          </p>
        )}
      </div>
    </div>
  );
}