import { PERM } from '@/constants/permissions'

/**
 * Satu-satunya sumber kebenaran otorisasi halaman: dibaca guard di router
 * sekaligus penyaring menu sidebar dan command palette.
 *
 * Sebelumnya berisi daftar role. Sejak backend memakai RBAC, yang menentukan
 * akses adalah permission — role bisa dibuat user dan slug-nya bebas, jadi
 * bercabang berdasarkan role tidak lagi sahih.
 */
export const ROUTE_PERMISSIONS: Record<string, string> = {
  '/': PERM.DASHBOARD_VIEW,
  '/summary': PERM.SUMMARY_VIEW,
  '/cashflow': PERM.CASHFLOW_VIEW,
  '/blog': PERM.BLOG_VIEW,
  '/shows': PERM.SHOW_VIEW,
  '/orders': PERM.ORDER_VIEW,
  '/banners': PERM.BANNER_VIEW,
  '/transactions': PERM.TRANSACTION_VIEW,
  '/transactions/:paymentId': PERM.TRANSACTION_VIEW,
  // Resource game_input hanya punya satu hak akses: mengubah label.
  '/input': PERM.GAME_INPUT_UPDATE,
  '/games': PERM.GAME_VIEW,
  '/games/:gameId': PERM.GAME_VIEW,
  '/category-product': PERM.CATEGORY_PRODUCT_VIEW,
  '/categories': PERM.CATEGORY_VIEW,
  '/products': PERM.PRODUCT_VIEW,
  '/products/callback-logs': PERM.PRODUCT_VIEW_CALLBACK_LOG,
  '/products/callback-logs/:id': PERM.PRODUCT_VIEW_CALLBACK_LOG,
  '/anomaly': PERM.PRODUCT_VIEW_ANOMALY,
  '/payment-methods': PERM.PAYMENT_METHOD_VIEW,
  '/payment-methods-categories': PERM.PAYMENT_CATEGORY_VIEW,
  '/provider': PERM.PROVIDER_VIEW,
  '/referral-codes': PERM.REFERRAL_VIEW,
  '/referral-codes/:id': PERM.REFERRAL_VIEW,
  '/2fa-setup': PERM.SECURITY_2FA_MANAGE,
  // Halaman statis tanpa API. Dulu dev-only; kini disamakan dengan hak akses
  // dev lain yang tidak punya padanan resource sendiri.
  '/rate-limit': PERM.INTEGRATION_VIEW_BALANCE,
  '/maintenances': PERM.MAINTENANCE_VIEW,
  '/admin': PERM.ADMIN_VIEW,
  '/roles': PERM.ROLE_VIEW,
  '/admin-logs': PERM.ADMIN_LOG_VIEW,
  '/admin-logs/:id': PERM.ADMIN_LOG_VIEW,
}

/**
 * Fail-closed: path tak terdaftar selalu ditolak, supaya menu tidak pernah
 * menampilkan halaman yang guard-nya akan menolak.
 */
export function canAccessPath(
  path: string | undefined,
  can: (code: string) => boolean,
): boolean {
  if (!path) return false
  const required = ROUTE_PERMISSIONS[path]
  return !!required && can(required)
}
