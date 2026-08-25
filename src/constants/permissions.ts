/**
 * Kode permission RBAC — cerminan katalog di backend
 * (`internal/constants/permissions.go`).
 *
 * Dipakai lewat konstanta, bukan string mentah, supaya salah ketik ketahuan
 * saat build dan bukan sebagai tombol yang diam-diam tak pernah muncul.
 */
export const PERM = {
  // admin
  ADMIN_VIEW: 'admin.view',
  ADMIN_CREATE: 'admin.create',
  ADMIN_UPDATE: 'admin.update',
  ADMIN_DELETE: 'admin.delete',
  // admin_log
  ADMIN_LOG_VIEW: 'admin_log.view',
  // banner
  BANNER_VIEW: 'banner.view',
  BANNER_CREATE: 'banner.create',
  BANNER_UPDATE: 'banner.update',
  BANNER_DELETE: 'banner.delete',
  // blog
  BLOG_VIEW: 'blog.view',
  BLOG_CREATE: 'blog.create',
  BLOG_UPDATE: 'blog.update',
  BLOG_DELETE: 'blog.delete',
  // cashflow
  CASHFLOW_VIEW: 'cashflow.view',
  // category
  CATEGORY_VIEW: 'category.view',
  CATEGORY_CREATE: 'category.create',
  CATEGORY_UPDATE: 'category.update',
  CATEGORY_DELETE: 'category.delete',
  // category_product
  CATEGORY_PRODUCT_VIEW: 'category_product.view',
  CATEGORY_PRODUCT_CREATE: 'category_product.create',
  CATEGORY_PRODUCT_UPDATE: 'category_product.update',
  CATEGORY_PRODUCT_DELETE: 'category_product.delete',
  // customer
  CUSTOMER_VIEW: 'customer.view',
  // dashboard
  DASHBOARD_VIEW: 'dashboard.view',
  // game
  GAME_VIEW: 'game.view',
  GAME_CREATE: 'game.create',
  GAME_UPDATE: 'game.update',
  GAME_DELETE: 'game.delete',
  GAME_SYNC: 'game.sync',
  // game_input
  GAME_INPUT_UPDATE: 'game_input.update',
  // integration
  INTEGRATION_VIEW_BALANCE: 'integration.view_balance',
  // maintenance
  MAINTENANCE_VIEW: 'maintenance.view',
  MAINTENANCE_CREATE: 'maintenance.create',
  MAINTENANCE_UPDATE: 'maintenance.update',
  MAINTENANCE_DELETE: 'maintenance.delete',
  // order
  ORDER_VIEW: 'order.view',
  // payment_category
  PAYMENT_CATEGORY_VIEW: 'payment_category.view',
  PAYMENT_CATEGORY_CREATE: 'payment_category.create',
  PAYMENT_CATEGORY_UPDATE: 'payment_category.update',
  PAYMENT_CATEGORY_DELETE: 'payment_category.delete',
  // payment_method
  PAYMENT_METHOD_VIEW: 'payment_method.view',
  PAYMENT_METHOD_CREATE: 'payment_method.create',
  PAYMENT_METHOD_UPDATE: 'payment_method.update',
  PAYMENT_METHOD_DELETE: 'payment_method.delete',
  // product
  PRODUCT_VIEW: 'product.view',
  PRODUCT_UPDATE: 'product.update',
  PRODUCT_DELETE: 'product.delete',
  PRODUCT_UPDATE_PRICE: 'product.update_price',
  PRODUCT_VIEW_ANOMALY: 'product.view_anomaly',
  PRODUCT_VIEW_CALLBACK_LOG: 'product.view_callback_log',
  // provider
  PROVIDER_VIEW: 'provider.view',
  PROVIDER_CREATE: 'provider.create',
  PROVIDER_UPDATE: 'provider.update',
  PROVIDER_DELETE: 'provider.delete',
  PROVIDER_VIEW_BALANCE: 'provider.view_balance',
  // referral
  REFERRAL_VIEW: 'referral.view',
  REFERRAL_CREATE: 'referral.create',
  REFERRAL_UPDATE: 'referral.update',
  REFERRAL_DELETE: 'referral.delete',
  // role
  ROLE_VIEW: 'role.view',
  ROLE_CREATE: 'role.create',
  ROLE_UPDATE: 'role.update',
  ROLE_DELETE: 'role.delete',
  // security
  SECURITY_2FA_MANAGE: 'security.2fa.manage',
  // show
  SHOW_VIEW: 'show.view',
  SHOW_CREATE: 'show.create',
  SHOW_UPDATE: 'show.update',
  SHOW_DELETE: 'show.delete',
  // summary
  SUMMARY_VIEW: 'summary.view',
  // transaction
  TRANSACTION_VIEW: 'transaction.view',
  TRANSACTION_EXPORT: 'transaction.export',
  // upload
  UPLOAD_CREATE: 'upload.create',
} as const

export type PermissionCode = (typeof PERM)[keyof typeof PERM]
