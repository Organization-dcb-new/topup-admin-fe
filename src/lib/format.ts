import i18n from '@/i18n'

/** Locale aktif untuk Intl — mengikuti bahasa i18n (id/en). */
function activeLocale() {
  return i18n.language.startsWith('id') ? 'id-ID' : 'en-US'
}

/** Format rupiah tanpa desimal, mis. `Rp993.229.432`. */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat(activeLocale(), {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Rupiah ringkas untuk kartu/tooltip, mis. `Rp45,8 jt`. */
export function formatCompactCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat(activeLocale(), {
    style: 'currency',
    currency: 'IDR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/** Angka biasa dengan pemisah ribuan, mis. `1.240`. */
export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat(activeLocale()).format(value)
}

/** Angka ringkas, mis. `1,2rb`. */
export function formatCompactNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat(activeLocale(), {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/**
 * Persentase dari rasio 0..1, mis. `0.879` → `87,9%`.
 */
export function formatRatioPercent(
  value: number | null | undefined,
  fractionDigits = 1,
): string {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat(activeLocale(), {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

/**
 * Format `change_pct` dari API (sudah dalam satuan persen, mis. `12.42` / `-3.13`).
 * `null` → "N/A". Mengembalikan teks dengan tanda + eksplisit untuk kenaikan.
 */
export function formatChangePct(
  value: number | null | undefined,
  fractionDigits = 1,
): string {
  if (value == null || Number.isNaN(value)) return 'N/A'
  const formatted = new Intl.NumberFormat(activeLocale(), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    signDisplay: 'exceptZero',
  }).format(value)
  return `${formatted}%`
}
