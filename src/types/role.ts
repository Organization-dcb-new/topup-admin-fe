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

export interface RoleDetail {
  id: string
  slug: string
  name: string
  description: string
  is_system: boolean
  permissions: string[]
  created_at: string
}

export interface PermissionDef {
  code: string
  resource: string
  action: string
  description: string
}

/** The catalog grouped by resource, as `GET /admin/permissions` returns it. */
export interface PermissionGroup {
  resource: string
  permissions: PermissionDef[]
}

export interface RolePayload {
  name: string
  description: string
  permission_codes: string[]
}
