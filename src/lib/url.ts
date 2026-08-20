/**
 * Hanya http(s) dan path absolut yang boleh dipakai sebagai `href`.
 *
 * Nilai seperti `redirect_link` datang dari form dan disimpan apa adanya oleh
 * backend, jadi `javascript:` / `data:` bisa ikut tersimpan dan akan
 * tereksekusi saat tautannya diklik di dashboard. `//evil.com` juga ditolak
 * karena protocol-relative tetap keluar ke host lain.
 */
export function safeRedirectHref(url: string | null | undefined): string | null {
  const trimmed = url?.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^\/(?!\/)/.test(trimmed)) return trimmed
  return null
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href)
}
