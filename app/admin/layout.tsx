"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Users, Store, UtensilsCrossed,
  LogOut, ChevronRight, Menu, X,
  ClipboardList, ChevronLeft,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/stores", label: "Stores", icon: Store },
  { href: "/admin/orders", label: "Pesanan", icon: ClipboardList },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("admin_sidebar_collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem("admin_sidebar_collapsed", String(!prev));
      return !prev;
    });
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "ADMIN") { router.push("/owner"); }
  }, [user, loading, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-[#0F0D0A] flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-[#1A1208] border-r border-white/5
          flex flex-col z-30 transition-all duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${collapsed ? "w-16" : "w-64"}
        `}
      >
        {/* Logo */}
        <div className={`border-b border-white/5 flex items-center p-4 ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-5 h-5 text-black" />
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">MenuQR</p>
                <p className="text-amber-400 text-xs">Admin Panel</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-stone-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${collapsed ? "justify-center px-2" : ""}
                  ${active ? "bg-amber-500/15 text-amber-400" : "text-stone-400 hover:text-white hover:bg-white/5"}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="flex-1">{label}</span>}
                {!collapsed && active && <ChevronRight className="w-3 h-3" />}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout + Collapse */}
        <div className="p-3 border-t border-white/5 space-y-1">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0">
                <span className="text-amber-400 text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                <p className="text-stone-500 text-xs truncate">{user.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            title={collapsed ? "Keluar" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-[0.98]
              ${collapsed ? "justify-center px-2" : ""}
            `}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </button>

          {/* Tombol collapse — hanya desktop */}
          <button
            onClick={toggleCollapsed}
            title={collapsed ? "Perluas" : "Ciutkan"}
            className={`hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:text-white hover:bg-white/5 transition-all
              ${collapsed ? "justify-center px-2" : ""}
            `}
          >
            {collapsed
              ? <ChevronRight className="w-4 h-4 shrink-0" />
              : <><ChevronLeft className="w-4 h-4 shrink-0" /><span>Ciutkan</span></>
            }
          </button>
        </div>
      </aside>

      {/* Konten */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? "ml-16" : "ml-0 lg:ml-64"}`}>
        {/* Top bar mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#1A1208] border-b border-white/5 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-stone-400 hover:text-white transition-colors p-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-black" />
            </div>
            <span className="text-white font-bold text-sm">MenuQR</span>
          </div>
          <div className="w-7" />
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}