/** Satu hak akses atomik, diidentifikasi lewat `code` berformat `resource.action`. */
export interface Permission {
  code: string
  resource: string
  action: string
  /** Deskripsi dari server — satu bahasa. Untuk tampilan pakai locale FE. */
  description: string
}

/** Katalog permission dari `GET /admin/permissions`, sudah dikelompokkan. */
export interface PermissionGroup {
  resource: string
  permissions: Permission[]
}

export interface PermissionCatalogResponse {
  status: string
  message: string
  data: PermissionGroup[]
}

/** Baris daftar role dari `GET /admin/roles`. */
export interface Role {
  id: string
  slug: string
  name: string
  description: string
  is_system: boolean
  permission_count: number
  admin_count: number
  created_at: string
}

/** Detail role dari `GET /admin/roles/:id`, lengkap dengan kode permission-nya. */
export interface RoleDetail {
  id: string
  slug: string
  name: string
  description: string
  is_system: boolean
  permissions: string[]
  created_at: string
}

export interface RoleListResponse {
  status: string
  message: string
  data: Role[]
}

export interface RoleDetailResponse {
  status: string
  message: string
  data: RoleDetail
}

export interface CreateRolePayload {
  name: string
  description: string
  permission_codes: string[]
}

export interface UpdateRolePayload {
  name: string
  description: string
}

/** Mengganti seluruh himpunan permission role — bukan menambah. */
export interface SetRolePermissionsPayload {
  permission_codes: string[]
}
