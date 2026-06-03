import jsPDF from "jspdf";
import { Order } from "@/lib/ordersApi";
import { Store } from "@/lib/storesApi";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

export const exportMutasiPDF = (orders: Order[], store: Store, filterDate: string) => {
  if (orders.length === 0) return;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const w = 210;
  let y = 15;

  doc.setFillColor(26, 18, 8);
  doc.rect(0, 0, w, 35, "F");
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(245, 158, 11);
  doc.text("LAPORAN MUTASI PESANAN", w / 2, y + 5, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text(store.name, w / 2, y + 13, { align: "center" });
  doc.text(
    `Tanggal: ${new Date(filterDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    w / 2, y + 19, { align: "center" }
  );
  y = 45;

  const completed = orders.filter((o) => o.status === "COMPLETED");
  const cancelled = orders.filter((o) => o.status === "CANCELLED");
  const totalRevenue = completed.reduce((acc, o) => acc + o.totalAmount, 0);

  doc.setFillColor(245, 245, 245);
  doc.rect(10, y, w - 20, 20, "F");
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(10, y, w - 20, 20);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("Total Pesanan", 20, y + 7);
  doc.text("Selesai", 75, y + 7);
  doc.text("Dibatalkan", 120, y + 7);
  doc.text("Total Pendapatan", 155, y + 7);

  doc.setFontSize(12);
  doc.setTextColor(26, 18, 8);
  doc.text(String(orders.length), 20, y + 16);
  doc.setTextColor(34, 197, 94);
  doc.text(String(completed.length), 75, y + 16);
  doc.setTextColor(239, 68, 68);
  doc.text(String(cancelled.length), 120, y + 16);
  doc.setTextColor(245, 158, 11);
  doc.text(formatPrice(totalRevenue), 155, y + 16);
  y += 28;

  doc.setFillColor(245, 158, 11);
  doc.rect(10, y, w - 20, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("No. Pesanan", 13, y + 5.5);
  doc.text("Meja", 60, y + 5.5);
  doc.text("Waktu", 80, y + 5.5);
  doc.text("Items", 120, y + 5.5);
  doc.text("Total", 155, y + 5.5);
  doc.text("Status", 180, y + 5.5);
  y += 10;

  orders.forEach((order, idx) => {
    if (y > 270) { doc.addPage(); y = 15; }
    if (idx % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(10, y - 4, w - 20, 8, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text(order.orderNumber, 13, y);
    doc.text(`#${order.tableNumber}`, 60, y);
    doc.text(new Date(order.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }), 80, y);
    doc.text(String(order.items.reduce((acc, i) => acc + i.qty, 0)) + " item", 120, y);
    doc.text(formatPrice(order.totalAmount), 155, y);

    const statusColor: Record<string, [number, number, number]> = {
      COMPLETED: [34, 197, 94],
      CANCELLED: [239, 68, 68],
      PENDING: [245, 158, 11],
      PREPARING: [59, 130, 246],
      READY: [34, 197, 94],
    };
    const color = statusColor[order.status] || [100, 100, 100];
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(order.status, 180, y);
    y += 8;
  });

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(10, y + 5, w - 10, y + 5);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 10, y);
  doc.text("Powered by MenuQR", w - 10, y, { align: "right" });

  doc.save(`mutasi-${store.name}-${filterDate}.pdf`);
};