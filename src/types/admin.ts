/** GET /auth/admin/brief — ringkas untuk filter (id + name). */
export interface AdminBriefUser {
  id: string;
  name: string;
}

export interface AdminBriefListResponse {
  status: string;
  message: string;
  /** Service Go membangun daftar dari slice nil, jadi kosong terkirim sebagai `null`. */
  data: AdminBriefUser[] | null;
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
  /** Format backend `2006-01-02 15:04:05` — parse lewat `parseBackendDate`, bukan `new Date`. */
  created_at: string;
}

export interface AdminResponse {
  status: string;
  message: string;
  /** Sama seperti brief: halaman kosong atau di luar rentang terkirim sebagai `null`. */
  data: AdminUser[] | null;
  meta: {
    page: number;
    limit: number;
    total_data: number;
    total_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/** Payload POST /admin/users. `confirm_admin_password` adalah sandi aktor, bukan sandi admin baru. */
export interface CreateAdminPayload {
  username: string;
  email: string;
  password: string;
  full_name: string;
  /** UUID role. Backend juga menerima slug, tapi id lebih tahan rename. */
  role_id: string;
  confirm_admin_password: string;
}

export interface CreateAdminResponse {
  status: string;
  message: string;
  data: AdminUser;
}

/**
 * GET /admin/me. Diketik eksplisit supaya `user.id` — satu-satunya dasar
 * proteksi "baris saya sendiri" di halaman admin — tidak lagi bertipe `any`
 * dan perubahan kontrak backend gagal saat build, bukan diam-diam saat runtime.
 */
export interface AdminProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  role_id: string | null;
  role_name: string;
  permissions: string[];
  two_factor_enabled: boolean;
}

export interface AdminProfileResponse {
  status: string;
  message: string;
  data: AdminProfile;
}
