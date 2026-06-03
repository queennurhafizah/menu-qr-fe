"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { usersApi } from "@/lib/usersApi";
import { storesApi } from "@/lib/storesApi";
import { Users, Store, Shield, Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalStores, setTotalStores] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([usersApi.getAll(), storesApi.getAll()])
      .then(([users, stores]) => {
        setTotalUsers(users.length);
        setTotalStores(stores.length);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Selamat datang, {user?.name} 👋
        </h1>
        <p className="text-stone-400 mt-1 text-sm">
          Ini adalah Admin Panel MenuQR. Pilih menu di sidebar untuk mulai.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card Total Users */}
        <div className="bg-[#1A1208] border border-white/5 rounded-2xl p-6 hover:border-amber-500/20 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <p className="text-stone-400 text-sm">Total Users</p>
            <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          {loading ? (
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin mb-1" />
          ) : (
            <p className="text-white text-3xl font-black mb-1">{totalUsers}</p>
          )}
          <p className="text-stone-500 text-xs">User terdaftar</p>
        </div>

        {/* Card Total Stores */}
        <div className="bg-[#1A1208] border border-white/5 rounded-2xl p-6 hover:border-amber-500/20 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <p className="text-stone-400 text-sm">Total Stores</p>
            <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Store className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          {loading ? (
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin mb-1" />
          ) : (
            <p className="text-white text-3xl font-black mb-1">{totalStores}</p>
          )}
          <p className="text-stone-500 text-xs">Toko terdaftar</p>
        </div>

        {/* Card Role */}
        <div className="bg-[#1A1208] border border-white/5 rounded-2xl p-6 hover:border-amber-500/20 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <p className="text-stone-400 text-sm">Role Anda</p>
            <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <p className="text-white text-3xl font-black mb-1">ADMIN</p>
          <p className="text-stone-500 text-xs">Akses penuh</p>
        </div>
      </div>
    </div>
  );
}