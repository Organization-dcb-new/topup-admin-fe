import type {
  DashboardGranularity,
  DashboardRange,
  OrderStatus,
  TimeseriesPoint,
} from '@/types/dashboard'

/** Urutan opsi rentang di filter. */
export const RANGE_OPTIONS: DashboardRange[] = [
  'today',
  '7d',
  '30d',
  'this_month',
  'custom',
]

/**
 * Granularity yang aman ditawarkan per rentang. Sengaja tidak memunculkan
 * `second`/`minute` untuk menghindari error 400 (batas 1000 bucket & aturan
 * "granularity too fine"). Elemen pertama = default.
 */
export const GRANULARITY_BY_RANGE: Record<DashboardRange, DashboardGranularity[]> = {
  today: ['hour'],
  '7d': ['day', 'hour'],
  '30d': ['day', 'week'],
  this_month: ['day', 'week'],
  custom: ['day', 'week', 'month'],
}

export function defaultGranularity(range: DashboardRange): DashboardGranularity {
  return GRANULARITY_BY_RANGE[range][0]
}

/** Warna konsisten per status order (dipakai chart & badge). */
export const STATUS_META: Record<OrderStatus, { color: string }> = {
  COMPLETED: { color: '#059669' }, // emerald-600
  PAID: { color: '#10b981' }, // emerald-500
  PROCESSING: { color: '#0ea5e9' }, // sky-500
  PENDING: { color: '#f59e0b' }, // amber-500
  FAILED: { color: '#ef4444' }, // red-500
  EXPIRED: { color: '#94a3b8' }, // slate-400
  REFUNDED: { color: '#a855f7' }, // purple-500
}

export const ORDER_STATUSES: OrderStatus[] = [
  'COMPLETED',
  'PAID',
  'PROCESSING',
  'PENDING',
  'FAILED',
  'EXPIRED',
  'REFUNDED',
]

const STEP_MS: Partial<Record<DashboardGranularity, number>> = {
  second: 1_000,
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
}

const EMPTY_POINT = { count: 0, revenue: 0, margin: 0, failed: 0, pending: 0 }

/**
 * Server tidak mengirim bucket kosong. Untuk granularity berstep tetap
 * (WIB tanpa DST), isi celah antar titik dengan nol berdasar timestamp absolut
 * (`getTime()`), sehingga aman lintas timezone browser. `month`/`week` variabel
 * dibiarkan apa adanya.
 */
export function fillTimeseriesGaps(
  series: TimeseriesPoint[],
  granularity: DashboardGranularity,
): TimeseriesPoint[] {
  const step = STEP_MS[granularity]
  if (!step || series.length < 2) return series

  const sorted = [...series].sort(
    (a, b) => new Date(a.time_key).getTime() - new Date(b.time_key).getTime(),
  )
  const byTs = new Map(sorted.map((p) => [new Date(p.time_key).getTime(), p]))
  const start = new Date(sorted[0].time_key).getTime()
  const end = new Date(sorted[sorted.length - 1].time_key).getTime()

  const out: TimeseriesPoint[] = []
  const MAX_BUCKETS = 2000 // guard runaway
  for (let ts = start, i = 0; ts <= end && i < MAX_BUCKETS; ts += step, i++) {
    const existing = byTs.get(ts)
    out.push(existing ?? { time_key: new Date(ts).toISOString(), ...EMPTY_POINT })
  }
  return out
}

const TZ = 'Asia/Jakarta'

/** Label sumbu X sesuai granularity, dipaksa dalam WIB apa pun timezone browser. */
export function formatBucketLabel(
  timeKey: string,
  granularity: DashboardGranularity,
  locale: string,
): string {
  const date = new Date(timeKey)
  const opts: Intl.DateTimeFormatOptions = { timeZone: TZ }
  switch (granularity) {
    case 'second':
      return date.toLocaleTimeString(locale, {
        ...opts,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    case 'minute':
    case 'hour':
      return date.toLocaleTimeString(locale, {
        ...opts,
        hour: '2-digit',
        minute: '2-digit',
      })
    case 'month':
      return date.toLocaleDateString(locale, { ...opts, month: 'short', year: '2-digit' })
    default: // day, week
      return date.toLocaleDateString(locale, { ...opts, day: '2-digit', month: 'short' })
  }
}

/** Label lengkap untuk tooltip (tanggal + jam, WIB). */
export function formatBucketFull(timeKey: string, locale: string): string {
  return new Date(timeKey).toLocaleString(locale, {
    timeZone: TZ,
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
