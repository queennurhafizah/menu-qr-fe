import { api, UserProfile } from "@/lib/api";

export interface UserWithCount extends UserProfile {
  _count: { stores: number };
}

export interface UpdateUserBody {
  name?: string;
  email?: string;
  password?: string;
  role?: "ADMIN" | "OWNER";
}

export const usersApi = {
  getAll: () =>
    api.get<UserWithCount[]>("/api/users").then((r) => r.data),

  getById: (id: string) =>
    api.get<UserProfile & { stores: { id: string; name: string; slug: string; isActive: boolean }[] }>(
      `/api/users/${id}`
    ).then((r) => r.data),

  update: (id: string, body: UpdateUserBody) =>
    api.patch<UserProfile>(`/api/users/${id}`, body).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/api/users/${id}`).then((r) => r.data),
};