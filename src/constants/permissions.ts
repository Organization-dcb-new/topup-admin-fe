/**
 * Permission codes of the backend RBAC catalog (topup-be: internal/constants/permissions.go).
 * Format is "resource.action". The backend is the source of truth and enforces every check;
 * the frontend only uses these to hide menus, routes and actions the admin can't use.
 */
export const PERM = {
  dashboardView: 'dashboard.view',

  transactionView: 'transaction.view',
  transactionExport: 'transaction.export',

  orderView: 'order.view',
  customerView: 'customer.view',
  cashflowView: 'cashflow.view',
  summaryView: 'summary.view',

  gameView: 'game.view',
  gameCreate: 'game.create',
  gameUpdate: 'game.update',
  gameDelete: 'game.delete',
  gameSync: 'game.sync',

  productView: 'product.view',
  productUpdate: 'product.update',
  productDelete: 'product.delete',
  productUpdatePrice: 'product.update_price',
  productViewAnomaly: 'product.view_anomaly',
  productViewCallbackLog: 'product.view_callback_log',

  categoryView: 'category.view',
  categoryCreate: 'category.create',
  categoryUpdate: 'category.update',
  categoryDelete: 'category.delete',

  categoryProductView: 'category_product.view',
  categoryProductCreate: 'category_product.create',
  categoryProductUpdate: 'category_product.update',
  categoryProductDelete: 'category_product.delete',

  gameInputUpdate: 'game_input.update',

  providerView: 'provider.view',
  providerCreate: 'provider.create',
  providerUpdate: 'provider.update',
  providerDelete: 'provider.delete',
  providerViewBalance: 'provider.view_balance',

  paymentMethodView: 'payment_method.view',
  paymentMethodCreate: 'payment_method.create',
  paymentMethodUpdate: 'payment_method.update',
  paymentMethodDelete: 'payment_method.delete',

  paymentCategoryView: 'payment_category.view',
  paymentCategoryCreate: 'payment_category.create',
  paymentCategoryUpdate: 'payment_category.update',
  paymentCategoryDelete: 'payment_category.delete',

  bannerView: 'banner.view',
  bannerCreate: 'banner.create',
  bannerUpdate: 'banner.update',
  bannerDelete: 'banner.delete',

  showView: 'show.view',
  showCreate: 'show.create',
  showUpdate: 'show.update',
  showDelete: 'show.delete',

  blogView: 'blog.view',
  blogCreate: 'blog.create',
  blogUpdate: 'blog.update',
  blogDelete: 'blog.delete',

  maintenanceView: 'maintenance.view',
  maintenanceCreate: 'maintenance.create',
  maintenanceUpdate: 'maintenance.update',
  maintenanceDelete: 'maintenance.delete',

  referralView: 'referral.view',
  referralCreate: 'referral.create',
  referralUpdate: 'referral.update',
  referralDelete: 'referral.delete',

  adminView: 'admin.view',
  adminCreate: 'admin.create',
  adminUpdate: 'admin.update',
  adminDelete: 'admin.delete',

  roleView: 'role.view',
  roleCreate: 'role.create',
  roleUpdate: 'role.update',
  roleDelete: 'role.delete',

  adminLogView: 'admin_log.view',
  uploadCreate: 'upload.create',

  integrationViewBalance: 'integration.view_balance',
  security2faManage: 'security.2fa.manage',
} as const

export type Permission = (typeof PERM)[keyof typeof PERM]

const ALL_PERMISSIONS = Object.values(PERM)

/** Mirrors `nocPermissions` in the backend seeder. */
const NOC_PERMISSIONS: Permission[] = [
  PERM.dashboardView,
  PERM.transactionView,
  PERM.transactionExport,
  PERM.gameView,
  PERM.productView,
  PERM.productViewAnomaly,
  PERM.paymentMethodView,
  PERM.bannerView,
  PERM.bannerCreate,
  PERM.bannerUpdate,
  PERM.bannerDelete,
  PERM.showView,
  PERM.showCreate,
  PERM.showUpdate,
  PERM.showDelete,
  PERM.blogView,
  PERM.blogCreate,
  PERM.blogUpdate,
  PERM.blogDelete,
  PERM.categoryProductView,
  PERM.categoryProductCreate,
  PERM.categoryProductUpdate,
  PERM.categoryProductDelete,
  PERM.gameInputUpdate,
  PERM.security2faManage,
]

/** Mirrors `adminExcluded` in the backend seeder: user and role management stay dev-only. */
const ADMIN_EXCLUDED = new Set<Permission>([
  PERM.adminView,
  PERM.adminCreate,
  PERM.adminUpdate,
  PERM.adminDelete,
  PERM.roleView,
  PERM.roleCreate,
  PERM.roleUpdate,
  PERM.roleDelete,
  PERM.integrationViewBalance,
])

/**
 * Permissions implied by a system role slug. Only used when `/admin/me` has no `permissions`
 * field, i.e. a backend released before RBAC, so this frontend can ship first.
 */
export function defaultPermissionsForRole(role: string | null): Permission[] {
  if (role === 'dev') return ALL_PERMISSIONS
  if (role === 'admin') return ALL_PERMISSIONS.filter((code) => !ADMIN_EXCLUDED.has(code))
  if (role === 'noc') return NOC_PERMISSIONS
  return []
}
