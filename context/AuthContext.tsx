"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi, UserProfile } from "@/lib/api";
import { storeCookies, deleteCookies } from "@/helper/cookies";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem("token", data.access_token);
    document.cookie = `token=${data.access_token}; path=/; max-age=${60 * 60 * 24}`;
    await storeCookies("token", data.access_token);
    setUser(data.user);
    if (data.user.role === "ADMIN") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/owner";
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await authApi.register({ name, email, password });
    localStorage.setItem("token", data.access_token);
    await storeCookies("token", data.access_token);
    setUser(data.user);
    router.push("/owner");
  };

  const logout = async () => {
    localStorage.removeItem("token");
    await deleteCookies("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus digunakan di dalam AuthProvider");
  return ctx;
}