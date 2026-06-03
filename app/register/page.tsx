"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, Loader2, UtensilsCrossed, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Sangat Lemah", "Lemah", "Cukup", "Kuat", "Sangat Kuat"][strength];
  const strengthColor = ["", "#EF4444", "#F97316", "#EAB308", "#22C55E", "#10B981"][strength];
  const passwordMatch = form.confirm !== "" && form.password === form.confirm;
  const passwordMismatch = form.confirm !== "" && form.password !== form.confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Password minimal 6 karakter"); return; }
    if (form.password !== form.confirm) { setError("Konfirmasi password tidak cocok"); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registrasi gagal, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0D0A] flex animate-fadeIn">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease forwards; }
        .animate-slideIn { animation: slideIn 0.6s ease forwards; }
        .input-field {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: rgba(245,158,11,0.6);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
        }
        .input-field::placeholder { color: #57534e; }
      `}</style>

      {/* Kiri: Dekoratif — hidden di mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1A1208] flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 80% 30%, #F59E0B55 0%, transparent 60%)" }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#F59E0B 1px, transparent 1px), linear-gradient(90deg, #F59E0B 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 flex items-center gap-3 animate-slideIn">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-black" />
          </div>
          <span className="text-white font-bold text-xl">MenuQR</span>
        </div>

        <div className="relative z-10 space-y-8 animate-slideIn" style={{ animationDelay: "0.1s" }}>
          <div className="space-y-3">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-[0.2em]">Bergabung Sekarang</p>
            <h1 className="text-5xl font-black text-white leading-[1.1]">
              Mulai<br />Perjalanan<br /><span className="text-amber-400">Digitalmu</span>
            </h1>
          </div>
          <div className="space-y-4">
            {[
              { emoji: "🍽️", text: "Buat menu digital dengan kategori & foto" },
              { emoji: "📱", text: "QR code otomatis untuk setiap meja" },
              { emoji: "🔔", text: "Notifikasi pesanan masuk real-time" },
              { emoji: "💳", text: "Info pembayaran QRIS & transfer bank" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-xl">{f.emoji}</span>
                <p className="text-stone-300 text-sm">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-l-2 border-amber-500/40 pl-4 animate-slideIn" style={{ animationDelay: "0.2s" }}>
          <p className="text-stone-400 text-sm italic">"Daftar gratis, langsung bisa buat toko dan menu digitalmu."</p>
        </div>
      </div>

      {/* Kanan: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[400px] py-8">

          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-black" />
            </div>
            <span className="text-white font-bold text-lg">MenuQR</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Buat Akun Baru</h2>
            <p className="text-stone-400 text-sm sm:text-base">Daftar sebagai Owner dan mulai kelola warungmu</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-stone-300 text-sm font-medium mb-2">Nama Lengkap</label>
              <input type="text" value={form.name} onChange={set("name")} placeholder="Nama Anda" required className="input-field" />
            </div>

            <div>
              <label className="block text-stone-300 text-sm font-medium mb-2">Alamat Email</label>
              <input type="email" value={form.email} onChange={set("email")} placeholder="nama@email.com" required className="input-field" />
            </div>

            <div>
              <label className="block text-stone-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Minimal 6 karakter"
                  required
                  className="input-field"
                  style={{ paddingRight: "48px" }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition-colors p-1 rounded-lg hover:bg-white/5">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ backgroundColor: i <= strength ? strengthColor : "rgba(255,255,255,0.1)" }} />
                    ))}
                  </div>
                  <p className="text-xs transition-all" style={{ color: strengthColor }}>{strengthLabel}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-stone-300 text-sm font-medium mb-2">Konfirmasi Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.confirm}
                  onChange={set("confirm")}
                  placeholder="Ulangi password"
                  required
                  className="input-field"
                  style={{
                    paddingRight: "48px",
                    borderColor: passwordMismatch ? "rgba(239,68,68,0.5)" : passwordMatch ? "rgba(34,197,94,0.5)" : undefined,
                    boxShadow: passwordMismatch ? "0 0 0 3px rgba(239,68,68,0.1)" : passwordMatch ? "0 0 0 3px rgba(34,197,94,0.1)" : undefined,
                  }}
                />
                {form.confirm && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {passwordMatch
                      ? <Check className="w-5 h-5 text-green-400" />
                      : <X className="w-5 h-5 text-red-400" />
                    }
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-blue-300 text-xs">ℹ️ Akun baru otomatis terdaftar sebagai <span className="font-bold">Owner</span>. Hubungi Admin untuk perubahan role.</p>
            </div>

            <button
              type="submit"
              disabled={loading || passwordMismatch}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Mendaftarkan...</>
                : "Buat Akun"
              }
            </button>
          </form>

          <p className="text-center text-stone-500 text-sm mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors underline-offset-2 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}