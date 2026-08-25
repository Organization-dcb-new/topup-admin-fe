/**
 * Backend mengembalikan `qr_url` berupa URI `otpauth://totp/...?secret=...`
 * (pquerna/otp `key.URL()`), bukan gambar. Secret-nya ada di dalam URI itu,
 * jadi FE bisa menawarkan entri manual tanpa endpoint tambahan.
 */
export function parseTotpSecret(otpauthUrl: string): string | null {
  try {
    const secret = new URL(otpauthUrl).searchParams.get('secret')
    return secret && secret.trim() ? secret.trim() : null
  } catch {
    return null
  }
}

/** Memecah secret base32 jadi kelompok 4 karakter agar mudah disalin manual. */
export function formatSecretGroups(secret: string, groupSize = 4): string {
  return secret.replace(new RegExp(`.{1,${groupSize}}`, 'g'), '$& ').trim()
}

/** Isi berkas .txt yang diunduh user sebagai cadangan kode pemulihan. */
export function buildRecoveryCodesFile(
  codes: string[],
  meta: { accountLabel: string; heading: string; note: string },
): string {
  return [
    meta.heading,
    meta.accountLabel,
    '',
    ...codes.map((code, i) => `${String(i + 1).padStart(2, '0')}. ${code}`),
    '',
    meta.note,
    '',
  ].join('\n')
}

/** Memicu unduhan berkas teks di browser lalu melepas object URL-nya. */
export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
