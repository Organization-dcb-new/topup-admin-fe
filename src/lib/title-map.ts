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

export function resolvePageTitleKey(pathname: string): string | null {
  const match = Object.keys(pageTitleKeyMap)
    .filter(
      (path) =>
        pathname === path || (path !== '/' && pathname.startsWith(path + '/')),
    )
    .sort((a, b) => b.length - a.length)[0]

  return match ? pageTitleKeyMap[match] : null
}
