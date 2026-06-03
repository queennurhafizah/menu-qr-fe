import { api } from "@/lib/api";

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
}

export interface CreateMenuItemBody {
  name: string;
  description?: string;
  price: number;
  sortOrder?: number;
}

export interface UpdateMenuItemBody {
  name?: string;
  description?: string;
  price?: number;
  isAvailable?: boolean;
  sortOrder?: number;
}

export const menuItemsApi = {
  getAll: (categoryId: string) =>
    api.get<MenuItem[]>(`/api/categories/${categoryId}/items`).then((r) => r.data),

  create: (categoryId: string, body: CreateMenuItemBody) =>
    api.post<MenuItem>(`/api/categories/${categoryId}/items`, body).then((r) => r.data),

  update: (id: string, body: UpdateMenuItemBody) =>
    api.patch<MenuItem>(`/api/menu-items/${id}`, body).then((r) => r.data),

  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post<MenuItem>(`/api/menu-items/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  delete: (id: string) =>
    api.delete(`/api/menu-items/${id}`).then((r) => r.data),
};