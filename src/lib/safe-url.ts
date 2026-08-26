/**
 * Satu-satunya tempat link banner dinilai aman.
 *
 * Sebelumnya `redirect_link` dirender langsung sebagai `href`, jadi nilai
 * tersimpan seperti `javascript:...` ikut dieksekusi begitu admin mengkliknya.
 * Aturan di bawah menyalin persis `validation.IsValidBannerLink` di backend
 * (pkg/validators/validator.go), dan pemanggil yang menerima `null` wajib
 * merender teks biasa — bukan `<a>`.
 *
 * Dua bentuk di bawah ini menuntut perhatian khusus karena `new URL()`
 * bersikap lebih longgar daripada `url.Parse` milik Go, dan setiap selisih
 * berarti form menerima nilai yang lalu ditolak API dengan 400:
 *   - `/\evil.com` — WHATWG memperlakukan `\` sama dengan `/`, jadi browser
 *     membacanya sebagai host asing persis seperti `//evil.com`.
 *   - `https:/a.com` — `new URL()` menormalkannya menjadi `https://a.com/`,
 *     sedangkan Go menganggap host-nya kosong dan menolaknya.
 */

export type SafeLink = { href: string; isExternal: boolean } | null

/** Sama dengan batas kolom di backend. */
const MAX_LINK_LENGTH = 2048

/**
 * Browser membuang karakter kontrol dari `href` sebelum memakainya, sehingga
 * `java\tscript:alert(1)` tetap berjalan. Tolak sejak awal. Ditulis sebagai
 * pemeriksaan kode karakter, bukan regex, karena regex berisi karakter kontrol
 * dilarang aturan lint `no-control-regex`.
 */
function hasControlChar(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i)
    if (code <= 0x1f || code === 0x7f) return true
  }
  return false
}

/**
 * Bentuk absolut dinilai dari string mentah, bukan dari hasil normalisasi
 * `new URL()`: skema http/https, tepat dua garis miring, lalu minimal satu
 * karakter host. Ini yang menyamakan hasilnya dengan `parsed.Host != ""`
 * di backend.
 */
const ABSOLUTE_HTTP_URL = /^https?:\/\/[^/?#]/i

/**
 * Menilai satu link banner. Diterima bila:
 *   1. path internal relatif — diawali `/` tapi bukan `//` maupun `/\`, atau
 *   2. URL absolut berskema http/https dengan host tidak kosong.
 * String kosong berarti "tanpa link", jadi ikut menghasilkan `null`.
 */
export function toSafeLink(raw: string | null | undefined): SafeLink {
  if (typeof raw !== 'string') return null

  const href = raw.trim()
  if (href === '') return null
  if (href.length > MAX_LINK_LENGTH) return null
  if (hasControlChar(href)) return null

  if (href.startsWith('/')) {
    // `//evil.com` dan `/\evil.com` adalah protocol-relative: browser
    // membacanya sebagai host lain, bukan path internal.
    if (href.startsWith('//') || href.startsWith('/\\')) return null
    return { href, isExternal: false }
  }

  // Regex sekaligus mengunci skema, jadi `javascript:` dan `data:` berhenti
  // di sini tanpa perlu menebak bagaimana `new URL()` menormalkannya.
  if (!ABSOLUTE_HTTP_URL.test(href)) return null

  let parsed: URL
  try {
    parsed = new URL(href)
  } catch {
    return null
  }

  if (parsed.hostname === '') return null

  return { href, isExternal: true }
}

/**
 * Bentuk boolean untuk skema zod: link kosong tetap sah karena `redirect_link`
 * memang opsional, selebihnya mengikuti `toSafeLink`.
 */
export function isSafeBannerLink(raw: string): boolean {
  if (raw.trim() === '') return true
  return toSafeLink(raw) !== null
}
