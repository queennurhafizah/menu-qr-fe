import axios from "axios";
import { getCookies } from "@/helper/cookies";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://menu-qr-backend-production.up.railway.app";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "OWNER";
  createdAt: string;
}

export interface AuthResponse {
  user: UserProfile;
  access_token: string;
}

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/register", body).then((r) => r.data),

  login: (body: { email: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/login", body).then((r) => r.data),

  me: () =>
    api.get<UserProfile>("/api/auth/me").then((r) => r.data),
};