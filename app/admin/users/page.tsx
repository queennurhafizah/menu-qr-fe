"use client";

import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { usersApi, UserWithCount } from "@/lib/usersApi";
import EditUser from "./edit";
import DeleteConfirm from "./delete";
import UsersTable from "./userTable";

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<UserWithCount | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserWithCount | null>(null);
  const [toast, setToast] = useState("");

  const fetchUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch {
      showToast("Gagal memuat data users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 bg-amber-500 text-black px-4 py-3 rounded-xl font-medium text-sm shadow-lg animate-fadeIn">
          <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } } .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }`}</style>
          {toast}
        </div>
      )}

      {editUser && (
        <EditUser
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => { fetchUsers(); showToast("User berhasil diupdate!"); }}
        />
      )}

      {deleteUser && (
        <DeleteConfirm
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onDeleted={() => { fetchUsers(); showToast("User berhasil dihapus!"); }}
        />
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-black text-white">Users Management</h1>
        <p className="text-stone-400 mt-1 text-sm">Total {users.length} user terdaftar</p>
      </div>

      {/* Search */}
      <div className="relative mb-4 sm:mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#1A1208] border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : (
        <UsersTable
          users={users}
          search={search}
          onEdit={setEditUser}
          onDelete={setDeleteUser}
        />
      )}
    </div>
  );
}