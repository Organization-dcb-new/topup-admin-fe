export type AdminRole = 'dev' | 'admin' | 'noc'

const ALL: AdminRole[] = ['dev', 'admin', 'noc']
const ADMIN_UP: AdminRole[] = ['dev', 'admin']
const DEV_ONLY: AdminRole[] = ['dev']

/**
 * Satu-satunya sumber kebenaran otorisasi halaman: dibaca RoleGuard di router
 * sekaligus penyaring menu sidebar. Sebelumnya sidebar mencocokkan label
 * berbahasa Indonesia, jadi mengubah teks label diam-diam mengubah hak akses.
 */
export const ROUTE_ROLES: Record<string, AdminRole[]> = {
  '/': ALL,
  '/summary': ADMIN_UP,
  '/cashflow': ADMIN_UP,
  '/blog': ALL,
  '/shows': ALL,
  '/orders': ADMIN_UP,
  '/banners': ALL,
  '/transactions': ALL,
  '/transactions/:paymentId': ALL,
  '/input': ALL,
  '/games': ALL,
  '/games/:gameId': ALL,
  '/category-product': ALL,
  '/categories': ADMIN_UP,
  '/products': ALL,
  '/products/callback-logs': ADMIN_UP,
  '/products/callback-logs/:id': ADMIN_UP,
  '/anomaly': ALL,
  '/payment-methods': ADMIN_UP,
  '/payment-methods-categories': ADMIN_UP,
  '/provider': ADMIN_UP,
  '/referral-codes': ADMIN_UP,
  '/referral-codes/:id': ADMIN_UP,
  '/2fa-setup': ADMIN_UP,
  '/rate-limit': DEV_ONLY,
  '/maintenances': ADMIN_UP,
  '/admin': DEV_ONLY,
  '/admin-logs': ADMIN_UP,
  '/admin-logs/:id': ADMIN_UP,
}

/**
 * Fail-closed: path tak dikenal atau role kosong selalu ditolak, supaya menu
 * tidak pernah menampilkan halaman yang guard-nya akan menolak.
 */
export function canAccessPath(
  path: string | undefined,
  role: string | null,
): boolean {
  if (!path || !role) return false
  const allowed = ROUTE_ROLES[path]
  return !!allowed && allowed.includes(role as AdminRole)
}
