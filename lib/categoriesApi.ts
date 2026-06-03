import { api } from "@/lib/api";

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  storeId: string;
  _count?: { menuItems: number };
}

export interface CreateCategoryBody {
  name: string;
  sortOrder?: number;
}

export interface UpdateCategoryBody {
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export const categoriesApi = {
  getAll: (storeId: string) =>
    api.get<Category[]>(`/api/stores/${storeId}/categories`).then((r) => r.data),

  create: (storeId: string, body: CreateCategoryBody) =>
    api.post<Category>(`/api/stores/${storeId}/categories`, body).then((r) => r.data),

  update: (id: string, body: UpdateCategoryBody) =>
    api.patch<Category>(`/api/categories/${id}`, body).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/api/categories/${id}`).then((r) => r.data),
};