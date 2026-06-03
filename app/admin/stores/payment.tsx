"use client";

import { useState } from "react";
import { X, Check, AlertCircle, Loader2, CreditCard, QrCode } from "lucide-react";
import { storesApi, Store } from "@/lib/storesApi";

interface PaymentBody {
  qrisImageUrl?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
}

interface Props {
  store: Store;
  onClose: () => void;
  onSaved: () => void;
}

export default function PaymentModal({ store, onClose, onSaved }: Props) {
  const [form, setForm] = useState<PaymentBody>({
    qrisImageUrl: store.qrisImageUrl || "",
    bankName: store.bankName || "",
    bankAccount: store.bankAccount || "",
    bankHolder: store.bankHolder || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof PaymentBody) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    console.log("Token:", localStorage.getItem("token"));
    setError("");
    setLoading(true);
    try {
      await storesApi.updatePayment(store.id, form);
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal update pembayaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1208] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/5 sticky top-0 bg-[#1A1208] z-10">
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg">Info Pembayaran</h3>
            <p className="text-stone-500 text-xs mt-0.5">{store.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-blue-300 text-xs">
              ℹ️ Hanya Admin yang bisa mengatur info pembayaran. Info ini akan tampil ke pelanggan saat checkout.
            </p>
          </div>

          {/* Input URL QRIS */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="w-4 h-4 text-stone-400" />
              <label className="text-stone-300 text-sm font-medium">
                URL Gambar QRIS
              </label>
            </div>
            <input
              type="text"
              value={form.qrisImageUrl}
              onChange={set("qrisImageUrl")}
              placeholder="https://res.cloudinary.com/..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
            />
            <p className="text-stone-500 text-xs mt-1.5">
              Masukkan URL QRIS yang dikirim oleh Owner
            </p>

            {/* Preview QRIS */}
            {form.qrisImageUrl && (
              <div className="mt-3 bg-white p-4 rounded-xl flex items-center justify-center">
                <img
                  src={form.qrisImageUrl}
                  alt="Preview QRIS"
                  className="w-48 h-48 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Info Bank */}
          <div className="border-t border-white/5 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-stone-400" />
              <p className="text-stone-300 text-sm font-medium">Info Transfer Bank</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-stone-400 text-xs font-medium mb-1.5">
                  Nama Bank
                </label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={set("bankName")}
                  placeholder="BCA, BRI, Mandiri, dll"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-stone-400 text-xs font-medium mb-1.5">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  value={form.bankAccount}
                  onChange={set("bankAccount")}
                  placeholder="1234567890"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-stone-400 text-xs font-medium mb-1.5">
                  Nama Pemilik Rekening
                </label>
                <input
                  type="text"
                  value={form.bankHolder}
                  onChange={set("bankHolder")}
                  placeholder="Nama sesuai rekening"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 sm:p-6 border-t border-white/5">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-white/10 rounded-xl text-stone-300 hover:bg-white/5 active:scale-[0.98] transition-all font-medium text-sm"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50 rounded-xl text-black font-bold transition-all flex items-center justify-center gap-2 text-sm"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Check className="w-4 h-4" />
            }
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}