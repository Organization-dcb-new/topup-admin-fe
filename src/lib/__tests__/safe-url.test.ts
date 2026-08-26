import { describe, it, expect } from 'vitest'
import { isSafeBannerLink, toSafeLink } from '@/lib/safe-url'

describe('toSafeLink', () => {
  it('menerima path internal relatif tanpa menandainya eksternal', () => {
    expect(toSafeLink('/promo')).toEqual({ href: '/promo', isExternal: false })
  })

  it('menerima URL absolut http/https dan menandainya eksternal', () => {
    expect(toSafeLink('https://a.com/x')).toEqual({ href: 'https://a.com/x', isExternal: true })
    expect(toSafeLink('http://a.com')).toEqual({ href: 'http://a.com', isExternal: true })
  })

  // Banner tanpa link bukan kesalahan; pemanggil cukup merender teks biasa.
  it('menghasilkan null untuk nilai kosong', () => {
    expect(toSafeLink('')).toBeNull()
    expect(toSafeLink('   ')).toBeNull()
    expect(toSafeLink(null)).toBeNull()
    expect(toSafeLink(undefined)).toBeNull()
  })

  // Inti perbaikan keamanan: skema yang bisa mengeksekusi kode tidak boleh
  // pernah sampai ke atribut href.
  it('menolak skema berbahaya, termasuk yang beda kapitalisasi', () => {
    expect(toSafeLink('javascript:alert(1)')).toBeNull()
    expect(toSafeLink('JavaScript:alert(1)')).toBeNull()
    expect(toSafeLink('data:text/html,x')).toBeNull()
    expect(toSafeLink('vbscript:msgbox(1)')).toBeNull()
    expect(toSafeLink('file:///etc/passwd')).toBeNull()
    expect(toSafeLink('ftp://a.com')).toBeNull()
  })

  // Spasi di depan dibuang browser sebelum href dipakai, jadi tidak boleh
  // dipakai untuk menyelundupkan skema terlarang.
  it('menolak skema berbahaya yang disamarkan spasi di depan', () => {
    expect(toSafeLink('  javascript:x')).toBeNull()
    expect(toSafeLink('\tjavascript:alert(1)')).toBeNull()
  })

  // `//evil.com` terlihat seperti path internal tapi dibaca browser sebagai
  // host lain.
  it('menolak URL protocol-relative', () => {
    expect(toSafeLink('//evil.com')).toBeNull()
    expect(toSafeLink('//evil.com/promo')).toBeNull()
  })

  // WHATWG memperlakukan `\` sama dengan `/` pada skema khusus, jadi
  // `/\evil.com` dibaca browser sebagai `https://evil.com`. Backend sudah
  // menolaknya (IsValidBannerLink); kalau FE tidak, form berbohong kepada
  // operator dan nilai warisan tampak "internal aman".
  it('menolak protocol-relative bergaya backslash', () => {
    expect(toSafeLink('/\\evil.com')).toBeNull()
    expect(toSafeLink('/\\evil.com/promo')).toBeNull()
  })

  // `new URL()` menormalkan garis miring tunggal jadi authority yang sah,
  // sedangkan Go menganggap host-nya kosong dan menolak. Tanpa kasus ini
  // form meloloskan nilai yang dijawab API dengan 400.
  it('menolak URL absolut tanpa dua garis miring penuh', () => {
    expect(toSafeLink('https:/a.com')).toBeNull()
    expect(toSafeLink('http:/a.com')).toBeNull()
    expect(toSafeLink('https:///a.com')).toBeNull()
  })

  it('menolak nilai yang bukan path maupun URL absolut', () => {
    expect(toSafeLink('promo')).toBeNull()
    expect(toSafeLink('https://')).toBeNull()
  })

  it('menolak link melebihi 2048 karakter', () => {
    const long = `https://a.com/${'x'.repeat(2048)}`
    expect(toSafeLink(long)).toBeNull()
  })
})

describe('isSafeBannerLink', () => {
  // Kolom link opsional, jadi kosong harus lolos validasi form.
  it('menerima kosong dan nilai yang lolos toSafeLink', () => {
    expect(isSafeBannerLink('')).toBe(true)
    expect(isSafeBannerLink('   ')).toBe(true)
    expect(isSafeBannerLink('/promo')).toBe(true)
    expect(isSafeBannerLink('https://a.com/x')).toBe(true)
    expect(isSafeBannerLink('http://a.com')).toBe(true)
  })

  it('menolak nilai yang ditolak toSafeLink', () => {
    expect(isSafeBannerLink('javascript:alert(1)')).toBe(false)
    expect(isSafeBannerLink('JavaScript:alert(1)')).toBe(false)
    expect(isSafeBannerLink('  javascript:x')).toBe(false)
    expect(isSafeBannerLink('//evil.com')).toBe(false)
    expect(isSafeBannerLink('/\\evil.com')).toBe(false)
    expect(isSafeBannerLink('https:/a.com')).toBe(false)
    expect(isSafeBannerLink('data:text/html,x')).toBe(false)
    expect(isSafeBannerLink('ftp://a.com')).toBe(false)
  })
})
