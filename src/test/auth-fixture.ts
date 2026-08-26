import { PERM } from '@/constants/permissions'
import type { AdminProfile } from '@/types/admin'

/**
 * Cerminan preset role bawaan di backend (`internal/constants/permissions.go`).
 *
 * Tes lama menguji perilaku per role; sejak gating memakai permission, fixture
 * inilah yang menjembatani keduanya sehingga tes tetap menguji hal yang sama.
 */
const ALL = Object.values(PERM) as string[]

const ADMIN_EXCLUDED = new Set<string>([
  PERM.ADMIN_VIEW,
  PERM.ADMIN_CREATE,
  PERM.ADMIN_UPDATE,
  PERM.ADMIN_DELETE,
  PERM.ROLE_VIEW,
  PERM.ROLE_CREATE,
  PERM.ROLE_UPDATE,
  PERM.ROLE_DELETE,
  PERM.INTEGRATION_VIEW_BALANCE,
])

const NOC: string[] = [
  PERM.DASHBOARD_VIEW,
  PERM.TRANSACTION_VIEW,
  PERM.TRANSACTION_EXPORT,
  PERM.GAME_VIEW,
  PERM.PRODUCT_VIEW,
  PERM.PRODUCT_VIEW_ANOMALY,
  PERM.PAYMENT_METHOD_VIEW,
  PERM.BANNER_VIEW,
  PERM.BANNER_CREATE,
  PERM.BANNER_UPDATE,
  PERM.BANNER_DELETE,
  PERM.SHOW_VIEW,
  PERM.SHOW_CREATE,
  PERM.SHOW_UPDATE,
  PERM.SHOW_DELETE,
  PERM.BLOG_VIEW,
  PERM.BLOG_CREATE,
  PERM.BLOG_UPDATE,
  PERM.BLOG_DELETE,
  PERM.CATEGORY_PRODUCT_VIEW,
  PERM.CATEGORY_PRODUCT_CREATE,
  PERM.CATEGORY_PRODUCT_UPDATE,
  PERM.CATEGORY_PRODUCT_DELETE,
  PERM.GAME_INPUT_UPDATE,
  PERM.SECURITY_2FA_MANAGE,
]

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  dev: ALL,
  admin: ALL.filter((code) => !ADMIN_EXCLUDED.has(code)),
  noc: NOC,
}

export function permissionsForRole(role: string | null): string[] {
  if (!role) return []
  return ROLE_PERMISSIONS[role] ?? []
}

/** Bentuk kembalian useAuthUser untuk keperluan mock. */
export function authStateForRole(role: string | null) {
  const permissions = permissionsForRole(role)
  const user: AdminProfile | null = role
    ? {
        id: 'admin-1',
        username: 'vian',
        email: 'vian@example.com',
        role,
        role_id: `role-${role}`,
        role_name: role,
        permissions,
        two_factor_enabled: false,
      }
    : null

  return {
    isAuthenticated: !!role,
    isMfaRequired: false,
    role,
    roleName: role,
    permissions,
    user,
    isLoading: false,
    isError: false,
    refetchProfile: () => {},
  }
}
