/**
 * Zona jadwal maintenance — selaras penyimpanan DB (timestamptz / RFC3339 +07:00).
 * Contoh dari API: `2026-04-08T04:52:00+07:00`, `2026-04-08T11:42:02.996372+07:00`.
 */
export const MAINTENANCE_DISPLAY_TZ = 'Asia/Jakarta' as const

/** Offset WIB tetap (tanpa DST). */
const WIB_RFC3339_OFFSET = '+07:00'

const DATETIME_LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/

function pickPart(parts: Intl.DateTimeFormatPart[], type: string): string {
  return parts.find((p) => p.type === type)?.value ?? ''
}

function zonedWallParts(d: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d)
  return {
    y: pickPart(parts, 'year'),
    m: pickPart(parts, 'month'),
    day: pickPart(parts, 'day'),
    h: pickPart(parts, 'hour'),
    min: pickPart(parts, 'minute'),
  }
}

/** Isi input `datetime-local`: jam dinding WIB dari string API (apa pun offset di string). */
export function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const { y, m, day, h, min } = zonedWallParts(d, MAINTENANCE_DISPLAY_TZ)
  if (!y || !m || !day || h === '' || min === '') return ''
  return `${y}-${m}-${day}T${h}:${min}`
}

/**
 * Untuk request API/DB: RFC3339 dengan `+07:00`.
 * Nilai dari `datetime-local` selalu diartikan sebagai jam dinding WIB.
 */
export function datetimeLocalToIso(local: string): string | undefined {
  const t = local.trim()
  if (!t) return undefined
  const match = DATETIME_LOCAL_RE.exec(t)
  if (match) {
    const [, y, mo, da, h, mi] = match
    return `${y}-${mo}-${da}T${h}:${mi}:00${WIB_RFC3339_OFFSET}`
  }
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return undefined
  const { y, m: mo, day, h: hr, min } = zonedWallParts(d, MAINTENANCE_DISPLAY_TZ)
  return `${y}-${mo}-${day}T${hr}:${min}:00${WIB_RFC3339_OFFSET}`
}

export function formatMaintenanceInstant(
  iso: string | null | undefined,
  options?: { timeZone?: string },
): string {
  if (!iso) return '—'
  try {
    const timeZone = options?.timeZone ?? MAINTENANCE_DISPLAY_TZ
    return new Date(iso).toLocaleString('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone,
    })
  } catch {
    return iso
  }
}

function datetimeLocalMsWib(local: string): number {
  const t = local.trim()
  const match = DATETIME_LOCAL_RE.exec(t)
  if (!match) return Number.NaN
  const [, y, mo, da, h, mi] = match
  return new Date(`${y}-${mo}-${da}T${h}:${mi}:00${WIB_RFC3339_OFFSET}`).getTime()
}

/** Jika mulai & selesai terisi, mulai harus ≤ selesai (keduanya diinterpretasikan sebagai WIB). */
export function maintenanceWindowOrderMessage(
  startLocal: string,
  endLocal: string,
): string | undefined {
  const s = startLocal.trim()
  const e = endLocal.trim()
  if (!s || !e) return undefined
  const t0 = datetimeLocalMsWib(s)
  const t1 = datetimeLocalMsWib(e)
  if (Number.isNaN(t0) || Number.isNaN(t1)) return undefined
  if (t0 > t1) return 'Waktu mulai tidak boleh setelah waktu selesai.'
  return undefined
}
