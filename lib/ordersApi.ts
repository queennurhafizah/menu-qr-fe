import axios from "axios";
import { api } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://menu-qr-backend-production.up.railway.app";

// Khusus untuk public API (tidak butuh token)
const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export interface PublicStore {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  logoUrl: string | null;
  qrisImageUrl: string | null;
  bankName: string | null;
  bankAccount: string | null;
  bankHolder: string | null;
  categories: PublicCategory[];
}

export interface PublicCategory {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  menuItems: PublicMenuItem[];
}

export interface PublicMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  qty: number;
  note: string;
}

export interface CreateOrderBody {
  tableNumber: string;
  notes?: string;
  source: "IN_APP";
  items: {
    menuItemId: string;
    qty: number;
    note?: string;
  }[];
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
  source: string;
  notes: string | null;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  store?: {
    name: string;
    qrisImageUrl: string | null;
    bankName: string | null;
    bankAccount: string | null;
    bankHolder: string | null;
  };
  items: {
    id: string;
    qty: number;
    price: number;
    subtotal: number;
    note: string | null;
    menuItemId: string;
    menuItem: {
      name: string;
      price?: number;
      imageUrl?: string | null;
    };
  }[];
}

// ─── Public API (tanpa token) ─────────────────────────────────────────────────
export const ordersApi = {
  getPublicMenu: (slug: string) =>
    publicApi.get<PublicStore>(`/api/stores/public/${slug}`).then((r) => r.data),

  createOrder: (storeId: string, body: CreateOrderBody) =>
    publicApi.post<Order>(`/api/stores/${storeId}/orders`, body).then((r) => r.data),

  trackOrder: (orderNumber: string) =>
    publicApi.get<Order>(`/api/orders/track/${orderNumber}`).then((r) => r.data),
};

export const ownerOrdersApi = {
  getAll: (storeId: string, status?: string) =>
    api.get<Order[]>(`/api/stores/${storeId}/orders${status ? `?status=${status}` : ""}`).then((r) => r.data),

  nextStatus: (id: string) =>
    api.patch<Order>(`/api/orders/${id}/next`).then((r) => r.data),

  setStatus: (id: string, status: string) =>
    api.patch<Order>(`/api/orders/${id}/status`, { status }).then((r) => r.data),

  dailySummary: (storeId: string) =>
    api.get<{
      date: string;
      totalOrders: number;
      totalRevenue: number;
      byStatus: Record<string, number>;
    }>(`/api/stores/${storeId}/orders/summary/daily`).then((r) => r.data),
};

export const adminOrdersApi = {
  getAll: (storeId: string, status?: string) =>
    api.get<Order[]>(`/api/stores/${storeId}/orders${status ? `?status=${status}` : ""}`).then((r) => r.data),

  getById: (id: string) =>
    api.get<Order>(`/api/orders/${id}`).then((r) => r.data),

  nextStatus: (id: string) =>
    api.patch<Order>(`/api/orders/${id}/next`).then((r) => r.data),

  setStatus: (id: string, status: string) =>
    api.patch<Order>(`/api/orders/${id}/status`, { status }).then((r) => r.data),

  dailySummary: (storeId: string) =>
    api.get<{
      date: string;
      totalOrders: number;
      totalRevenue: number;
      byStatus: Record<string, number>;
    }>(`/api/stores/${storeId}/orders/summary/daily`).then((r) => r.data),
};