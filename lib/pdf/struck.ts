import jsPDF from "jspdf";
import { Order } from "@/lib/ordersApi";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

export const downloadStruk = (order: Order) => {
  const doc = new jsPDF({ unit: "mm", format: [80, 220] });
  const w = 80;
  let y = 8;

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

  doc.setFillColor(245, 158, 11);
  doc.rect(5, y - 3, w - 10, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text("Item", 7, y + 1);
  doc.text("Qty", 50, y + 1, { align: "center" });
  doc.text("Total", w - 7, y + 1, { align: "right" });
  y += 7;

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

  doc.setFillColor(26, 18, 8);
  doc.rect(5, y, w - 10, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(245, 158, 11);
  doc.text("TOTAL", 9, y + 6);
  doc.text(formatPrice(order.totalAmount), w - 7, y + 6, { align: "right" });
  y += 13;

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