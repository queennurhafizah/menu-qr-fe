"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { storesApi, Store } from "@/lib/storesApi";
import { Store as StoreIcon, LayoutList, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    storesApi.getMy().then(setStores).catch(() => {});
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        .fade-in-1 { animation: fadeIn 0.4s ease 0.05s both; }
        .fade-in-2 { animation: fadeIn 0.4s ease 0.1s both; }
        .fade-in-3 { animation: fadeIn 0.4s ease 0.15s both; }
      `}</style>

      <div className="mb-6 sm:mb-8 fade-in">
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Selamat datang, {user?.name} 👋
        </h1>
        <p className="text-stone-400 mt-1 text-sm">
          Kelola toko dan menu digitalmu dari sini.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: "Toko Saya", value: stores.length, icon: StoreIcon, desc: "Toko terdaftar" },
          { label: "Kategori", value: "-", icon: LayoutList, desc: "Lihat di menu Kategori" },
          { label: "Menu Item", value: "-", icon: ShoppingBag, desc: "Lihat di menu Menu" },
        ].map((card, i) => (
          <div
            key={card.label}
            className={`bg-[#1A1208] border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-amber-500/20 transition-all duration-200 fade-in-${i + 1}`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-stone-400 text-sm">{card.label}</p>
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <card.icon className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <p className="text-white text-3xl font-black mb-1">{card.value}</p>
            <p className="text-stone-500 text-xs">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Quick action */}
      <div className="bg-[#1A1208] border border-white/5 rounded-2xl p-5 sm:p-6 fade-in" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-white font-bold mb-4 text-sm sm:text-base">Mulai dari sini</h2>
        <div className="space-y-2 sm:space-y-3">
          {[
            { href: "/owner/store", label: "Buat atau kelola toko", desc: "Setup nama, alamat, dan info toko" },
            { href: "/owner/categories", label: "Atur kategori menu", desc: "Buat kategori seperti Minuman, Makanan, dll" },
            { href: "/owner/menu-items", label: "Tambah item menu", desc: "Upload foto dan atur harga menu" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between p-3 sm:p-4 bg-white/[0.02] hover:bg-white/[0.05] active:bg-white/[0.07] border border-white/5 hover:border-white/10 rounded-xl transition-all group"
            >
              <div>
                <p className="text-white text-sm font-medium">{item.label}</p>
                <p className="text-stone-500 text-xs mt-0.5">{item.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}