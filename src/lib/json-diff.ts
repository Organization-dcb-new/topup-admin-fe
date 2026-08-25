export type ChangeKind = 'added' | 'removed' | 'changed' | 'unchanged'

export interface FieldChange {
  key: string
  kind: ChangeKind
  before: unknown
  after: unknown
}

const isEmptyRecord = (value: Record<string, unknown> | null | undefined) =>
  !value || Object.keys(value).length === 0

/** Perbandingan nilai apa adanya; cukup untuk payload log yang dangkal. */
const isSame = (a: unknown, b: unknown) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

/**
 * Membandingkan snapshot sebelum/sesudah menjadi daftar perubahan per field.
 * Log lama menampilkan dua blok JSON mentah berdampingan sehingga pembaca
 * harus memindai sendiri bedanya.
 */
export function diffRecords(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): FieldChange[] {
  const keys = Array.from(
    new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]),
  ).sort()

  return keys.map((key) => {
    const hasBefore = !!before && key in before
    const hasAfter = !!after && key in after
    const beforeValue = before?.[key]
    const afterValue = after?.[key]

    let kind: ChangeKind = 'unchanged'
    if (!hasBefore && hasAfter) kind = 'added'
    else if (hasBefore && !hasAfter) kind = 'removed'
    else if (!isSame(beforeValue, afterValue)) kind = 'changed'

    return { key, kind, before: beforeValue, after: afterValue }
  })
}

/** True bila log ini memang membawa snapshot data (LOGIN/RECOVERY tidak). */
export function hasSnapshot(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
) {
  return !isEmptyRecord(before) || !isEmptyRecord(after)
}

/** Nilai satu field untuk ditampilkan; objek/array dirapikan sebagai JSON. */
export function formatFieldValue(value: unknown): string {
  if (value === undefined || value === null) return '—'
  if (typeof value === 'string') return value === '' ? '""' : value
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return JSON.stringify(value, null, 2)
}
