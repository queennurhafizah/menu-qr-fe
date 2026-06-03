"use client";

import { Pencil, Trash2, Store, Shield, User } from "lucide-react";
import { UserWithCount } from "@/lib/usersApi";

interface Props {
  users: UserWithCount[];
  search: string;
  onEdit: (user: UserWithCount) => void;
  onDelete: (user: UserWithCount) => void;
}

export default function UsersTable({ users, search, onEdit, onDelete }: Props) {
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) {
    return (
      <div className="bg-[#1A1208] border border-white/5 rounded-2xl p-12 text-center">
        <p className="text-stone-500 text-sm">
          {search ? "Tidak ada user yang cocok" : "Belum ada user"}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className="space-y-3 sm:hidden">
        {filtered.map((u) => (
          <div key={u.id} className="bg-[#1A1208] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-500/15 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-amber-400 text-sm font-bold">
                    {u.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{u.name}</p>
                  <p className="text-stone-500 text-xs">{u.email}</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                u.role === "ADMIN" ? "bg-amber-500/15 text-amber-400" : "bg-blue-500/15 text-blue-400"
              }`}>
                {u.role === "ADMIN" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                {u.role}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-stone-400">
                <span className="flex items-center gap-1">
                  <Store className="w-3 h-3" /> {u._count.stores} toko
                </span>
                <span>{new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => onEdit(u)} className="p-2 text-stone-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all active:scale-95">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(u)} className="p-2 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all active:scale-95">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: tabel */}
      <div className="hidden sm:block bg-[#1A1208] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-stone-400 text-sm font-medium">User</th>
                <th className="text-left px-6 py-4 text-stone-400 text-sm font-medium">Role</th>
                <th className="text-left px-6 py-4 text-stone-400 text-sm font-medium hidden md:table-cell">Toko</th>
                <th className="text-left px-6 py-4 text-stone-400 text-sm font-medium hidden lg:table-cell">Bergabung</th>
                <th className="text-right px-6 py-4 text-stone-400 text-sm font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-500/15 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-amber-400 text-sm font-bold">
                          {u.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{u.name}</p>
                        <p className="text-stone-500 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      u.role === "ADMIN" ? "bg-amber-500/15 text-amber-400" : "bg-blue-500/15 text-blue-400"
                    }`}>
                      {u.role === "ADMIN" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-stone-300 text-sm">
                      <Store className="w-3.5 h-3.5 text-stone-500" />
                      {u._count.stores} toko
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <p className="text-stone-400 text-sm">
                      {new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEdit(u)} className="p-2 text-stone-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all active:scale-95" title="Edit user">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(u)} className="p-2 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all active:scale-95" title="Hapus user">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}