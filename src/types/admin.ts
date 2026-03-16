export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "dev" | "admin" | "noc";
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
