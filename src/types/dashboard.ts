// Kontrak: Dashboard API — Frontend Integration Guide (BE draft/contract).

export type DashboardRange = 'today' | '7d' | '30d' | 'this_month' | 'custom'

export type DashboardGranularity =
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED'
  | 'REFUNDED'

export interface DashboardTimeRange {
  start: string // RFC3339 WIB
  end: string
}

export interface DashboardSummary {
  total_orders: number
  total_revenue: number
  /** Untung/rugi order sukses; bisa negatif. */
  total_margin: number
  avg_order_value: number
  /** Rasio 0..1. */
  success_rate: number
}

export interface ComparisonMetric {
  current: number
  previous: number
  /** null bila periode sebelumnya 0 (hindari bagi nol). */
  change_pct: number | null
}

export interface DashboardComparison {
  previous_start: string
  previous_end: string
  orders: ComparisonMetric
  revenue: ComparisonMetric
  margin: ComparisonMetric
}

export type StatusBreakdown = Record<OrderStatus, number>

export interface PendingAging {
  threshold_minutes: number
  count: number
  oldest_minutes: number
}

export interface FailedReason {
  /** Teks bebas dari provider — render apa adanya, bukan enum. */
  reason: string
  count: number
}

export interface TopProduct {
  product_id: string
  product_name: string
  sku: string
  qty_sold: number
  order_count: number
  revenue: number
  margin: number
}

export interface TopGame {
  game_id: string
  game_name: string
  order_count: number
  revenue: number
  margin: number
}

export interface TopPaymentMethod {
  payment_method: string
  order_count: number
  revenue: number
}

export interface DashboardOverviewData {
  range: DashboardTimeRange
  summary: DashboardSummary
  comparison: DashboardComparison
  status_breakdown: Partial<StatusBreakdown>
  pending_aging: PendingAging
  failed_reasons: FailedReason[]
  top_products: TopProduct[]
  top_games: TopGame[]
  top_payment_methods: TopPaymentMethod[]
}

export interface DashboardOverviewResponse {
  status: 'success' | 'error'
  message: string
  data: DashboardOverviewData
}

export interface TimeseriesPoint {
  time_key: string // awal bucket, RFC3339 WIB
  /** Semua order dibuat pada bucket ini. */
  count: number
  /** Order yang sudah dibayar (payments PAID/SUCCESS) pada bucket ini. */
  paid: number
  revenue: number
  margin: number
}

export interface DashboardTimeseriesData {
  granularity: DashboardGranularity
  range: DashboardTimeRange
  series: TimeseriesPoint[]
}

export interface DashboardTimeseriesResponse {
  status: 'success' | 'error'
  message: string
  data: DashboardTimeseriesData
}
