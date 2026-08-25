// Path → key i18n di bawah `pageTitles.*` untuk judul tab browser.
// Prefix terpanjang yang cocok menang, jadi halaman detail
// (mis. /games/:id) mewarisi judul halaman induknya.
export const pageTitleKeyMap: Record<string, string> = {
  '/': 'dashboard',
  '/login': 'login',
  '/verify-otp': 'verifyOtp',
  '/summary': 'summary',
  '/cashflow': 'cashflow',
  '/blog': 'blog',
  '/shows': 'shows',
  '/orders': 'orders',
  '/banners': 'banners',
  '/transactions': 'transactions',
  '/input': 'input',
  '/games': 'games',
  '/category-product': 'categoryProduct',
  '/categories': 'categories',
  '/products': 'products',
  '/products/callback-logs': 'productCallbackLogs',
  '/anomaly': 'anomaly',
  '/payment-methods': 'paymentMethods',
  '/payment-methods-categories': 'paymentMethodCategories',
  '/provider': 'provider',
  '/referral-codes': 'referralCodes',
  '/2fa-setup': 'twoFactorSetup',
  '/rate-limit': 'rateLimit',
  '/maintenances': 'maintenances',
  '/admin': 'admin',
  '/admin-logs': 'adminLogs',
  '/unauthorized': 'unauthorized',
}

export interface PageMatch {
  /** Key i18n di bawah `pageTitles.*` */
  key: string
  /** Path induk yang cocok, tujuan tautan breadcrumb */
  basePath: string
  /** True bila URL saat ini lebih dalam dari induknya (halaman detail) */
  isDetail: boolean
  /** Segmen terakhir URL — dipakai sebagai label detail */
  detailSegment?: string
}

export function resolvePageMatch(pathname: string): PageMatch | null {
  const basePath = Object.keys(pageTitleKeyMap)
    .filter(
      (path) =>
        pathname === path || (path !== '/' && pathname.startsWith(path + '/')),
    )
    .sort((a, b) => b.length - a.length)[0]

  if (!basePath) return null

  const isDetail = pathname !== basePath
  return {
    key: pageTitleKeyMap[basePath],
    basePath,
    isDetail,
    detailSegment: isDetail ? pathname.split('/').filter(Boolean).pop() : undefined,
  }
}

export function resolvePageTitleKey(pathname: string): string | null {
  return resolvePageMatch(pathname)?.key ?? null
}
