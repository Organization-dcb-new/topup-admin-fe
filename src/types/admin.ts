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
  /** Role slug: dev, admin, noc or a custom role. */
  role: string;
  role_id?: string | null;
  role_name?: string;
  two_factor_enabled: boolean;
  created_at: string;
}

/** POST /admin/users; confirm_admin_password is the acting admin's own password. */
export interface CreateAdminPayload {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: string;
  role_id?: string;
  confirm_admin_password: string;
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
