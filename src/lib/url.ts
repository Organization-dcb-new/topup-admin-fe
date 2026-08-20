/** Basis sintetis untuk menguji apakah sebuah path benar-benar tetap di origin sendiri. */
const SAME_ORIGIN_PROBE = 'https://same-origin.invalid'

/**
 * Hanya http(s) dan path yang benar-benar tetap di origin sendiri yang boleh
 * dipakai sebagai `href`.
 *
 * Nilai seperti `redirect_link` datang dari form dan disimpan apa adanya oleh
 * backend, jadi `javascript:` / `data:` bisa ikut tersimpan dan akan
 * tereksekusi saat tautannya diklik di dashboard.
 *
 * Cabang path internal sengaja TIDAK memakai pencocokan pola. Parser URL
 * menormalkan `\` menjadi `/` untuk skema http(s) dan membuang TAB/CR/LF,
 * sehingga `/\evil.com` dan `/<CR><LF>/evil.com` sama-sama resolve ke
 * `https://evil.com/` — dua-duanya lolos dari guard berbasis regex `^\/(?!\/)`.
 * Biarkan parser yang memutuskan, lalu buktikan origin-nya tidak berpindah.
 */
export function safeRedirectHref(url: string | null | undefined): string | null {
  const trimmed = url?.trim()
  if (!trimmed) return null

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
      if (!parsed.host) return null
      return trimmed
    } catch {
      return null
    }
  }

  if (!trimmed.startsWith('/')) return null

  try {
    const resolved = new URL(trimmed, SAME_ORIGIN_PROBE)
    if (resolved.origin !== SAME_ORIGIN_PROBE) return null

    // Dinormalkan supaya yang diteruskan ke router persis seperti yang diuji.
    const path = `${resolved.pathname}${resolved.search}${resolved.hash}`
    // Hasil normalisasi masih bisa diawali "//" (mis. "/..//evil.com"), yang
    // saat dirender ulang berubah jadi protocol-relative. Uji ulang keluarannya.
    if (new URL(path, SAME_ORIGIN_PROBE).origin !== SAME_ORIGIN_PROBE) return null
    return path
  } catch {
    return null
  }
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href)
}
