import { api } from "@/lib/api";

export interface Store {
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface CreateStoreBody {
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
}

export interface UpdateStoreBody {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdatePaymentBody {
  qrisImageUrl?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
}

export const storesApi = {
  getAll: () =>
    api.get<Store[]>("/api/stores").then((r) => r.data),

  getMy: () =>
    api.get<Store[]>("/api/stores/my").then((r) => r.data),

  getById: (id: string) =>
    api.get<Store>(`/api/stores/${id}`).then((r) => r.data),

  create: (body: CreateStoreBody) =>
    api.post<Store>("/api/stores", body).then((r) => r.data),

  update: (id: string, body: UpdateStoreBody) =>
    api.patch<Store>(`/api/stores/${id}`, body).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/api/stores/${id}`).then((r) => r.data),

  // Upload gambar umum → dapat URL Cloudinary
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post<{ message: string; url: string; originalName: string; size: number }>(
      "/api/upload/image",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    ).then((r) => r.data);
  },

  // Update info pembayaran toko — khusus Admin
  updatePayment: (id: string, body: UpdatePaymentBody) =>
    api.patch<Store>(`/api/stores/${id}/payment`, body).then((r) => r.data),
};