/** GET /auth/admin/brief — ringkas untuk filter (id + name). */
export interface AdminBriefUser {
  id: string;
  name: string;
}

export interface AdminBriefListResponse {
  status: string;
  message: string;
  data: AdminBriefUser[];
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  /**
   * Slug role. Sengaja `string`, bukan union literal: sejak RBAC, role bisa
   * dibuat user dan slug-nya bebas. Untuk role non-sistem, backend mengisi
   * field ini dengan "custom" — itu nilai teknis jalur rollback, bukan untuk
   * ditampilkan. Pakai `role_name` untuk tampilan.
   */
  role: string;
  role_id: string | null;
  role_name: string;
  two_factor_enabled: boolean;
  created_at: string;
}

export interface AdminResponse {
  status: string;
  message: string;
  data: AdminUser[];
  meta: {
    page: number;
    limit: number;
    total_data: number;
    total_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
}
