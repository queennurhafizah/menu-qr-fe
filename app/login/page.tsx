"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, Loader2, UtensilsCrossed } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Email atau password salah");
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
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 20% 50%, #F59E0B55 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #EF444433 0%, transparent 50%)" }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#F59E0B 1px, transparent 1px), linear-gradient(90deg, #F59E0B 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 flex items-center gap-3 animate-slideIn">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-black" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">MenuQR</span>
        </div>

        <div className="relative z-10 space-y-6 animate-slideIn" style={{ animationDelay: "0.1s" }}>
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-[0.2em]">Sistem Manajemen</p>
          <h1 className="text-5xl font-black text-white leading-[1.1]">
            Kelola Menu<br />
            <span className="text-amber-400">Warungmu</span><br />
            dengan Mudah
          </h1>
          <p className="text-stone-400 text-base leading-relaxed max-w-sm">
            Buat QR code menu digital, kelola pesanan, dan pantau transaksi — semuanya dalam satu platform.
          </p>
          <div className="flex gap-8 pt-2">
            {[
              { value: "100%", label: "Digital" },
              { value: "Real-time", label: "Pesanan" },
              { value: "QR", label: "Sistem" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-amber-400 text-2xl font-black">{s.value}</p>
                <p className="text-stone-500 text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-l-2 border-amber-500/40 pl-4 animate-slideIn" style={{ animationDelay: "0.2s" }}>
          <p className="text-stone-400 text-sm italic">"Pelanggan scan, pesanan masuk, dapur langsung tahu."</p>
        </div>
      </div>

      {/* Kanan: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-[400px]">

          {/* Logo — tampil di mobile & tablet */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-black" />
            </div>
            <span className="text-white font-bold text-lg">MenuQR</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Selamat Datang</h2>
            <p className="text-stone-400 text-sm sm:text-base">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-stone-300 text-sm font-medium mb-2">Alamat Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-stone-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field"
                  style={{ paddingRight: "48px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition-colors p-1 rounded-lg hover:bg-white/5"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-2 text-sm sm:text-base"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Memproses...</>
              ) : (
                "Masuk Sekarang"
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1.5">
            <p className="text-amber-400/80 text-xs font-semibold uppercase tracking-wider mb-2">Demo Login</p>
            <p className="text-stone-400 text-xs">
              <span className="text-stone-300 font-medium">Admin:</span> admin@menuqr.com
            </p>
            <p className="text-stone-400 text-xs">
              <span className="text-stone-300 font-medium">Owner:</span> owner@warung.com / owner123
            </p>
          </div>

          <p className="text-center text-stone-500 text-sm mt-6">
            Belum punya akun?{" "}
            <Link href="/register" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors underline-offset-2 hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}