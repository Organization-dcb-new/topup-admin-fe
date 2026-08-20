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

const DAY_MS = 86_400_000

/** Lebar bucket per granularity — sama dengan asumsi server saat menghitung batas. */
const BUCKET_MS: Record<DashboardGranularity, number> = {
  second: 1_000,
  minute: 60_000,
  hour: 3_600_000,
  day: DAY_MS,
  week: 7 * DAY_MS,
  month: 30 * DAY_MS,
}

/** Server menolak lebih dari 1000 bucket, dan `second`/`minute` di atas 24 jam. */
const MAX_BUCKETS = 1000
const FINE_GRANULARITY_MAX_MS = DAY_MS

/** Di atas ini grafik jadi rapat dan tak terbaca, jadi bukan pilihan default. */
const READABLE_BUCKETS = 100

/** Kasar → halus; urutan tampilan mengikuti ini. */
const GRANULARITY_ORDER: DashboardGranularity[] = ['hour', 'day', 'week', 'month']

/**
 * Perkiraan panjang rentang (ms), sengaja dibulatkan ke atas supaya opsi yang
 * ditawarkan tidak pernah melampaui batas server.
 */
export function rangeSpanMs(
  range: DashboardRange,
  startDate?: string,
  endDate?: string,
): number {
  const now = new Date()
  switch (range) {
    case 'today': {
      const midnight = new Date(now)
      midnight.setHours(0, 0, 0, 0)
      return Math.max(now.getTime() - midnight.getTime(), BUCKET_MS.hour)
    }
    case '7d':
      return 7 * DAY_MS
    case '30d':
      return 30 * DAY_MS
    case 'this_month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
      return Math.max(now.getTime() - first.getTime(), DAY_MS)
    }
    case 'custom': {
      if (!startDate || !endDate) return DAY_MS
      const start = new Date(`${startDate}T00:00:00`).getTime()
      const end = new Date(`${endDate}T00:00:00`).getTime() + DAY_MS // end_date inklusif
      return Number.isFinite(start) && Number.isFinite(end) && end > start ? end - start : DAY_MS
    }
  }
}

/**
 * Granularity yang aman untuk sebuah rentang. Daftar statis per preset dulu bisa
 * menawarkan `day` untuk rentang kustom bertahun-tahun — di atas 1000 bucket
 * server membalas 400, jadi pilihan yang pasti gagal tidak lagi ditampilkan.
 */
export function granularityOptions(
  range: DashboardRange,
  startDate?: string,
  endDate?: string,
): DashboardGranularity[] {
  const span = rangeSpanMs(range, startDate, endDate)
  const allowed = GRANULARITY_ORDER.filter((g) => {
    if ((g === 'second' || g === 'minute') && span > FINE_GRANULARITY_MAX_MS) return false
    return span / BUCKET_MS[g] <= MAX_BUCKETS
  })
  // Rentang yang sangat panjang menyisakan `month`; jangan pernah kembalikan kosong.
  return allowed.length > 0 ? allowed : ['month']
}

/** Granularity terhalus yang masih terbaca; jatuh ke yang terkasar bila tak ada. */
export function defaultGranularity(
  range: DashboardRange,
  startDate?: string,
  endDate?: string,
): DashboardGranularity {
  const options = granularityOptions(range, startDate, endDate)
  const span = rangeSpanMs(range, startDate, endDate)
  return (
    options.find((g) => span / BUCKET_MS[g] <= READABLE_BUCKETS) ??
    options[options.length - 1]
  )
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

/** Granularity berstep tetap saja; `month` panjangnya bervariasi. */
const STEP_MS: Partial<Record<DashboardGranularity, number>> = {
  second: BUCKET_MS.second,
  minute: BUCKET_MS.minute,
  hour: BUCKET_MS.hour,
  day: BUCKET_MS.day,
  week: BUCKET_MS.week,
}

const EMPTY_POINT = { count: 0, paid: 0, revenue: 0, margin: 0 }

/** Batas pengaman; di atas ini pengisian celah dilewati, bukan dipotong. */
const MAX_FILLED_BUCKETS = 2000

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
  if (!Number.isFinite(start) || !Number.isFinite(end)) return series

  // Memotong di tengah jalan akan menyembunyikan ekor grafik tanpa jejak apa pun;
  // lebih jujur menggambar titik apa adanya daripada separuh rentang yang mulus.
  if ((end - start) / step + 1 > MAX_FILLED_BUCKETS) return sorted

  const out: TimeseriesPoint[] = []
  for (let ts = start; ts <= end; ts += step) {
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

/**
 * Rapikan kode channel pembayaran dari `payments.payment_channel`
 * (mis. `qris` → `QRIS`, `indomaret_otc` → `INDOMARET OTC`).
 */
export function formatPaymentChannel(channel: string): string {
  return channel.replace(/[_-]+/g, ' ').trim().toUpperCase()
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
