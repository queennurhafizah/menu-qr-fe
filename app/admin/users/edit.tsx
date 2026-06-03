"use client";

import { useState } from "react";
import { X, Check, AlertCircle, Loader2 } from "lucide-react";
import { usersApi, UserWithCount, UpdateUserBody } from "@/lib/usersApi";

interface Props {
  user: UserWithCount;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditUser({ user, onClose, onSaved }: Props) {
  const [form, setForm] = useState<UpdateUserBody>({
    name: user.name,
    email: user.email,
    role: user.role,
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof UpdateUserBody) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      const body: UpdateUserBody = { name: form.name, email: form.email, role: form.role };
      if (form.password) body.password = form.password;
      await usersApi.update(user.id, body);
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1208] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#1A1208] z-10">
          <h3 className="text-white font-bold text-lg">Edit User</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {[
            { label: "Nama", key: "name" as keyof UpdateUserBody, type: "text", placeholder: "" },
            { label: "Email", key: "email" as keyof UpdateUserBody, type: "email", placeholder: "" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-stone-300 text-sm font-medium mb-2">{field.label}</label>
              <input
                type={field.type}
                value={form[field.key] as string}
                onChange={set(field.key)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
              />
            </div>
          ))}

          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">Role</label>
            <select
              value={form.role}
              onChange={set("role")}
              className="w-full px-4 py-3 bg-[#0F0D0A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
            >
              <option value="OWNER">OWNER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">
              Password Baru <span className="text-stone-500 font-normal">(kosongkan jika tidak diganti)</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-white/5">
          <button onClick={onClose} className="flex-1 py-3 border border-white/10 rounded-xl text-stone-300 hover:bg-white/5 active:scale-[0.98] transition-all font-medium text-sm">
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50 rounded-xl text-black font-bold transition-all flex items-center justify-center gap-2 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}