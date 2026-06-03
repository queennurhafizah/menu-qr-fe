"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ShoppingCart, Plus, Minus, Trash2, X,
  Loader2, AlertCircle, UtensilsCrossed,
  MapPin, Phone, CreditCard, QrCode, Check, Bell, ShoppingBag,
} from "lucide-react";
import { ordersApi, PublicStore, PublicMenuItem, CartItem } from "@/lib/ordersApi";
import SearchBar from "@/components/search-bar";

type Sheet = "cart" | "order" | "payment" | null;

export default function MenuPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [store, setStore] = useState<PublicStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [showPaymentDesktop, setShowPaymentDesktop] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [tableError, setTableError] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [activeOrderNumber, setActiveOrderNumber] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`order_${slug}`);
    if (saved) setActiveOrderNumber(saved);
  }, [slug]);

  useEffect(() => {
    ordersApi.getPublicMenu(slug)
      .then((data) => {
        setStore(data);
        const firstActive = data.categories.find((c) => c.isActive);
        if (firstActive) setActiveCategory(firstActive.id);
      })
      .catch(() => setError("Toko tidak ditemukan atau tidak aktif"))
      .finally(() => setLoading(false));
  }, [slug]);

  const addToCart = (item: PublicMenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) return prev.map((c) => c.menuItemId === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl, qty: 1, note: "" }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === menuItemId);
      if (existing && existing.qty > 1) return prev.map((c) => c.menuItemId === menuItemId ? { ...c, qty: c.qty - 1 } : c);
      return prev.filter((c) => c.menuItemId !== menuItemId);
    });
  };

  const deleteFromCart = (menuItemId: string) =>
    setCart((prev) => prev.filter((c) => c.menuItemId !== menuItemId));

  const updateNote = (menuItemId: string, note: string) =>
    setCart((prev) => prev.map((c) => c.menuItemId === menuItemId ? { ...c, note } : c));

  const getQty = (menuItemId: string) =>
    cart.find((c) => c.menuItemId === menuItemId)?.qty || 0;

  const totalItems = cart.reduce((acc, c) => acc + c.qty, 0);
  const totalPrice = cart.reduce((acc, c) => acc + c.price * c.qty, 0);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  const handleLanjutKePayment = () => {
    if (!tableNumber.trim()) { setTableError("Nomor meja wajib diisi"); return; }
    setTableError("");
    if (window.innerWidth >= 1024) {
      setShowPaymentDesktop(true);
    } else {
      setSheet("payment");
    }
  };

  const handleOrder = async () => {
    if (!store) return;
    setOrderError("");
    setOrdering(true);
    try {
      const order = await ordersApi.createOrder(store.id, {
        tableNumber: tableNumber.trim(),
        notes: notes.trim() || undefined,
        source: "IN_APP",
        items: cart.map((c) => ({ menuItemId: c.menuItemId, qty: c.qty, note: c.note || undefined })),
      });

      // Simpan ke active order
      localStorage.setItem(`order_${slug}`, order.orderNumber);

      // Simpan ke history
      const historyKey = `orders_history_${slug}`;
      const existing = JSON.parse(localStorage.getItem(historyKey) || "[]");
      const updated = [order.orderNumber, ...existing];
      localStorage.setItem(historyKey, JSON.stringify(updated));

      setShowPaymentDesktop(false);
      router.push(`/menu/${slug}/track?order=${order.orderNumber}`);
    } catch (err: unknown) {
      setOrderError(err instanceof Error ? err.message : "Gagal membuat pesanan");
      setSheet("order");
      setShowPaymentDesktop(false);
    } finally {
      setOrdering(false);
    }
  };

  const hasPaymentInfo = store && (store.qrisImageUrl || store.bankName);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Memuat menu...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Toko Tidak Ditemukan</h2>
          <p className="text-stone-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const activeCategories = store.categories.filter((c) => c.isActive);

  const filteredCategories = search.trim()
    ? activeCategories
        .map((cat) => ({
          ...cat,
          menuItems: cat.menuItems.filter(
            (item) => item.isAvailable && (
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.description?.toLowerCase().includes(search.toLowerCase())
            )
          ),
        }))
        .filter((cat) => cat.menuItems.length > 0)
    : activeCategories;

  const displayCategories = search.trim()
    ? filteredCategories
    : activeCategories.filter((cat) => !activeCategory || cat.id === activeCategory);

  const cartJSX = (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.map((item) => (
          <div key={item.menuItemId} className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-white/5">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UtensilsCrossed className="w-4 h-4 text-stone-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{item.name}</p>
                <p className="text-amber-400 text-sm font-bold">{formatPrice(item.price * item.qty)}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => removeFromCart(item.menuItemId)} className="w-6 h-6 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full flex items-center justify-center transition-all">
                  <Minus className="w-3 h-3 text-white" />
                </button>
                <span className="text-white font-bold text-sm w-4 text-center">{item.qty}</span>
                <button
                  onClick={() => {
                    const menuItem = store.categories.flatMap((c) => c.menuItems).find((m) => m.id === item.menuItemId);
                    if (menuItem) addToCart(menuItem);
                  }}
                  className="w-6 h-6 bg-amber-500 hover:bg-amber-400 active:scale-95 rounded-full flex items-center justify-center transition-all"
                >
                  <Plus className="w-3 h-3 text-black" />
                </button>
                <button onClick={() => deleteFromCart(item.menuItemId)} className="w-6 h-6 bg-red-500/20 hover:bg-red-500/30 active:scale-95 rounded-full flex items-center justify-center transition-all">
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </div>
            <input
              type="text"
              value={item.note}
              onChange={(e) => updateNote(item.menuItemId, e.target.value)}
              placeholder="Catatan..."
              className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/40 transition-all text-xs"
            />
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/5 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-stone-300 font-medium">Total</span>
          <span className="text-white font-black text-lg">{formatPrice(totalPrice)}</span>
        </div>
        <div>
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => { setTableNumber(e.target.value); setTableError(""); }}
            placeholder="Nomor Meja *"
            className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 transition-all text-sm ${
              tableError ? "border-red-500/50 focus:ring-red-500/10" : "border-white/10 focus:border-amber-500/60 focus:ring-amber-500/10"
            }`}
          />
          {tableError && <p className="text-red-400 text-xs mt-1">{tableError}</p>}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Catatan pesanan (opsional)"
          rows={2}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all resize-none text-sm"
        />
        <button
          onClick={handleLanjutKePayment}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold rounded-xl transition-all text-sm"
        >
          {hasPaymentInfo ? "Lanjut ke Pembayaran →" : "Pesan Sekarang 🍽️"}
        </button>
        {activeOrderNumber && (
          <button
            onClick={() => router.push(`/menu/${slug}/track?order=${activeOrderNumber}`)}
            className="w-full py-3 bg-green-500/15 hover:bg-green-500/25 active:scale-[0.98] text-green-400 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 border border-green-500/20"
          >
            <Bell className="w-4 h-4" />
            Lihat Pesanan Aktif
          </button>
        )}
        <button
          onClick={() => router.push(`/menu/${slug}/history`)}
          className="w-full py-3 bg-white/5 hover:bg-white/10 active:scale-[0.98] text-stone-300 font-medium rounded-xl transition-all text-sm flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          Riwayat Pesanan
        </button>
      </div>
    </>
  );

  const paymentJSX = (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
          <p className="text-stone-300 text-sm mb-1">Total yang harus dibayar</p>
          <p className="text-amber-400 font-black text-3xl">{formatPrice(totalPrice)}</p>
          <p className="text-stone-500 text-xs mt-1">Meja #{tableNumber}</p>
        </div>
        {store.qrisImageUrl && (
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <QrCode className="w-4 h-4 text-amber-400" />
              <p className="text-white font-semibold text-sm">Bayar via QRIS</p>
            </div>
            <div className="bg-white p-4 rounded-xl flex items-center justify-center">
              <img src={store.qrisImageUrl} alt="QRIS" className="w-52 h-52 object-contain" />
            </div>
          </div>
        )}
        {store.bankName && (
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <p className="text-white font-semibold text-sm">Transfer Bank</p>
            </div>
            {[
              { label: "Bank", value: store.bankName },
              { label: "No. Rekening", value: store.bankAccount },
              { label: "Atas Nama", value: store.bankHolder },
            ].map((row) => row.value && (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <span className="text-stone-400 text-sm">{row.label}</span>
                <span className="text-white font-bold text-sm">{row.value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="text-stone-400 text-sm">Jumlah</span>
              <span className="text-amber-400 font-black">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setPaymentConfirmed(!paymentConfirmed)}
          className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
            paymentConfirmed ? "border-green-500/50 bg-green-500/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"
          }`}
        >
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
            paymentConfirmed ? "border-green-500 bg-green-500" : "border-white/20"
          }`}>
            {paymentConfirmed && <Check className="w-3.5 h-3.5 text-white" />}
          </div>
          <span className={`text-sm font-medium ${paymentConfirmed ? "text-green-400" : "text-stone-300"}`}>
            Saya sudah melakukan pembayaran
          </span>
        </button>
      </div>
      <div className="px-5 py-4 border-t border-white/5 space-y-2">
        <button
          onClick={handleOrder}
          disabled={!paymentConfirmed || ordering}
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-2xl transition-all text-base flex items-center justify-center gap-2"
        >
          {ordering ? <><Loader2 className="w-5 h-5 animate-spin" />Memproses...</> : "Sudah Bayar, Pesan Sekarang 🍽️"}
        </button>
        <button
          onClick={() => { setShowPaymentDesktop(false); setSheet(null); }}
          disabled={ordering}
          className="w-full py-3 border border-white/10 text-stone-300 hover:bg-white/5 active:scale-[0.98] disabled:opacity-40 rounded-2xl transition-all text-sm font-medium"
        >
          ← Kembali
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0F0D0A]">
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .slide-up { animation: slideUp 0.3s ease forwards; }
        .fade-in { animation: fadeIn 0.2s ease forwards; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="flex min-h-screen">
        <div className="flex-1 lg:mr-80 flex flex-col">
          <div className="bg-[#1A1208] border-b border-white/5 sticky top-0 z-20">
            <div className="px-4 sm:px-8 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="w-5 h-5 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-white font-bold sm:font-black text-base sm:text-xl truncate">{store.name}</h1>
                  {store.address && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                      <p className="text-stone-400 text-xs sm:text-sm truncate">{store.address}</p>
                    </div>
                  )}
                </div>
                {store.phone && (
                  <div className="flex items-center gap-1 text-stone-400 text-xs shrink-0">
                    <Phone className="w-3 h-3" />
                    <span className="hidden sm:inline">{store.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 sm:px-8 pb-3">
              <SearchBar value={search} onChange={setSearch} placeholder="Cari menu..." />
            </div>

            {!search && (
              <div className="flex gap-2 px-4 sm:px-8 pb-3 overflow-x-auto hide-scrollbar">
                {activeCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
                      activeCategory === cat.id
                        ? "bg-amber-500 text-black"
                        : "bg-white/5 text-stone-300 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 sm:px-8 py-4 sm:py-6 pb-36 lg:pb-6">
            {displayCategories.length === 0 && search ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <UtensilsCrossed className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Tidak ditemukan</h3>
                <p className="text-stone-400 text-sm">
                  Tidak ada menu yang cocok dengan{" "}
                  <span className="text-white font-semibold">"{search}"</span>
                </p>
                <button onClick={() => setSearch("")} className="mt-4 text-amber-400 hover:text-amber-300 text-sm font-medium">
                  Hapus pencarian
                </button>
              </div>
            ) : (
              displayCategories.map((cat) => (
                <div key={cat.id} className="mb-8">
                  <h2 className="text-white font-bold text-lg sm:text-xl mb-4 pb-3 border-b border-white/5">{cat.name}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                    {cat.menuItems
                      .filter((item) => item.isAvailable)
                      .map((item) => {
                        const qty = getQty(item.id);
                        return (
                          <div key={item.id} className="bg-[#1A1208] border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200 flex flex-col group">
                            <div className="relative w-full aspect-square bg-white/5 overflow-hidden">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <UtensilsCrossed className="w-8 h-8 sm:w-10 sm:h-10 text-stone-700" />
                                </div>
                              )}
                              {qty > 0 && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                                  <span className="text-black text-xs font-black">{qty}</span>
                                </div>
                              )}
                            </div>
                            <div className="p-3 sm:p-4 flex flex-col flex-1">
                              <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-1">{item.name}</h3>
                              {item.description && (
                                <p className="text-stone-500 text-xs line-clamp-2 mb-2">{item.description}</p>
                              )}
                              <p className="text-amber-400 font-black text-sm sm:text-base mb-3 mt-auto">{formatPrice(item.price)}</p>
                              {qty === 0 ? (
                                <button
                                  onClick={() => addToCart(item)}
                                  className="w-full py-2 sm:py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5"
                                >
                                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  Tambah
                                </button>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 sm:w-9 sm:h-9 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full flex items-center justify-center transition-all">
                                    <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                  </button>
                                  <span className="text-white font-black text-base sm:text-lg">{qty}</span>
                                  <button onClick={() => addToCart(item)} className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-500 hover:bg-amber-400 active:scale-95 rounded-full flex items-center justify-center transition-all">
                                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel Keranjang Desktop */}
        <aside className="hidden lg:flex w-80 bg-[#1A1208] border-l border-white/5 fixed right-0 top-0 h-full flex-col z-10">
          <div className="p-5 border-b border-white/5">
            <h3 className="text-white font-black text-lg">Pesanan</h3>
            {totalItems > 0 && (
              <p className="text-stone-400 text-sm mt-0.5">{totalItems} item dipilih</p>
            )}
          </div>
          {totalItems === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-3">
                <ShoppingCart className="w-7 h-7 text-stone-600" />
              </div>
              <p className="text-stone-400 text-sm font-medium">Keranjang kosong</p>
              <p className="text-stone-600 text-xs mt-1">Tambah menu untuk mulai memesan</p>
              <button
                onClick={() => router.push(`/menu/${slug}/history`)}
                className="mt-4 flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Riwayat Pesanan
              </button>
            </div>
          ) : cartJSX}
        </aside>
      </div>

      {/* Tombol floating mobile */}
      {!sheet && (
        <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center px-4 lg:hidden">
          <div className="w-full max-w-sm space-y-2">
            {totalItems > 0 && (
              <button
                onClick={() => setSheet("cart")}
                className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold px-6 py-4 rounded-2xl shadow-xl transition-all slide-up w-full"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center font-bold">{totalItems}</span>
                </div>
                <span className="flex-1 text-left">Lihat Keranjang</span>
                <span>{formatPrice(totalPrice)}</span>
              </button>
            )}
            {activeOrderNumber && (
              <button
                onClick={() => router.push(`/menu/${slug}/track?order=${activeOrderNumber}`)}
                className="flex items-center gap-3 bg-green-500 hover:bg-green-400 active:scale-[0.98] text-white font-bold px-6 py-4 rounded-2xl shadow-xl transition-all slide-up w-full"
              >
                <Bell className="w-5 h-5" />
                <span className="flex-1 text-left">Lihat Pesanan Saya</span>
                <span className="text-xs opacity-75 truncate">{activeOrderNumber}</span>
              </button>
            )}
            <button
              onClick={() => router.push(`/menu/${slug}/history`)}
              className="flex items-center gap-3 bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white font-bold px-6 py-4 rounded-2xl shadow-xl transition-all slide-up w-full"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="flex-1 text-left">Riwayat Pesanan</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay mobile */}
      {sheet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 fade-in lg:hidden" onClick={() => setSheet(null)} />
      )}

      {/* Sheet Keranjang Mobile */}
      {sheet === "cart" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1208] rounded-t-3xl max-h-[85vh] flex flex-col slide-up lg:hidden">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <h3 className="text-white font-bold text-lg">Keranjang ({totalItems} item)</h3>
            <button onClick={() => setSheet(null)} className="text-stone-400 hover:text-white transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          {cartJSX}
        </div>
      )}

      {/* Sheet Nomor Meja Mobile */}
      {sheet === "order" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1208] rounded-t-3xl max-h-[85vh] flex flex-col slide-up lg:hidden">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <h3 className="text-white font-bold text-lg">Detail Pesanan</h3>
            <button onClick={() => setSheet(null)} className="text-stone-400 hover:text-white transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {orderError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{orderError}</p>
              </div>
            )}
            <div>
              <label className="block text-stone-300 text-sm font-medium mb-2">Nomor Meja <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => { setTableNumber(e.target.value); setTableError(""); }}
                placeholder="Contoh: 1, 2A, VIP-1"
                autoFocus
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-stone-600 focus:outline-none focus:ring-2 transition-all text-sm ${tableError ? "border-red-500/50 focus:ring-red-500/10" : "border-white/10 focus:border-amber-500/60 focus:ring-amber-500/10"}`}
              />
              {tableError && <p className="text-red-400 text-xs mt-1.5">{tableError}</p>}
            </div>
            <div>
              <label className="block text-stone-300 text-sm font-medium mb-2">Catatan <span className="text-stone-500 font-normal">(opsional)</span></label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan umum..." rows={2} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all resize-none text-sm" />
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <p className="text-stone-400 text-xs font-medium mb-3 uppercase tracking-wider">Ringkasan</p>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.menuItemId} className="flex justify-between items-center">
                    <span className="text-stone-300 text-sm">{item.name} <span className="text-stone-500">x{item.qty}</span></span>
                    <span className="text-stone-300 text-sm">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="border-t border-white/5 pt-2 mt-2 flex justify-between">
                  <span className="text-white font-bold text-sm">Total</span>
                  <span className="text-amber-400 font-black">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-5 py-4 border-t border-white/5 space-y-2">
            <button onClick={handleLanjutKePayment} className="w-full py-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold rounded-2xl transition-all text-base">
              {hasPaymentInfo ? "Lanjut ke Pembayaran →" : "Pesan Sekarang 🍽️"}
            </button>
            <button onClick={() => setSheet("cart")} className="w-full py-3 border border-white/10 text-stone-300 hover:bg-white/5 active:scale-[0.98] rounded-2xl transition-all text-sm font-medium">
              ← Kembali ke Keranjang
            </button>
          </div>
        </div>
      )}

      {/* Sheet Pembayaran Mobile */}
      {sheet === "payment" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1208] rounded-t-3xl max-h-[85vh] flex flex-col slide-up lg:hidden">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <h3 className="text-white font-bold text-lg">Cara Pembayaran</h3>
            <button onClick={() => setSheet(null)} className="text-stone-400 hover:text-white transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          {paymentJSX}
        </div>
      )}

      {/* Modal Pembayaran Desktop */}
      {showPaymentDesktop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden lg:flex items-center justify-center p-6 fade-in">
          <div className="bg-[#1A1208] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div>
                <h3 className="text-white font-bold text-lg">Cara Pembayaran</h3>
                <p className="text-stone-500 text-xs mt-0.5">Meja #{tableNumber}</p>
              </div>
              <button onClick={() => setShowPaymentDesktop(false)} className="text-stone-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            {paymentJSX}
          </div>
        </div>
      )}
    </div>
  );
}