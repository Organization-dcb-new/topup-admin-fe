/**
 * The backend writes two kinds of rows, both with a positive amount:
 * - `PAYMENT_GATEWAY`: money in, what the player paid through the gateway (notes "Payment Revenue for Method: X").
 * - `PROVIDER`: money out, what the provider charged for the order (notes "<provider> provider cost for Product: SKU, TID: …").
 */
export type CashflowType = 'PROVIDER' | 'PAYMENT_GATEWAY'

export interface CashflowItem {
  id: string
  order_id: string
  payment_id?: string
  /** A plain string on the wire; unknown values are shown as-is. */
  type: CashflowType | (string & {})
  amount: number
  notes: string
  /** RFC3339. */
  created_at: string
}

export interface CashflowMeta {
  page: number
  limit: number
  total: number
  last_page: number
}

export interface CashflowStats {
  /** Sum of PROVIDER rows. */
  total_out_provider: number
  /** Gateway fees; the backend doesn't record them yet, so this is always 0. */
  total_out_pg: number
  /** total_out_provider + total_out_pg. */
  total_outflow: number
  /** Sum of PAYMENT_GATEWAY rows (money in). */
  total_revenue: number
  /** total_revenue − total_outflow. */
  net_profit: number
  /** total_revenue − total_out_pg. */
  selisih_pg: number
}

export interface CashflowResponse {
  message: string
  data: CashflowItem[]
  meta: CashflowMeta
  stats: CashflowStats
}

export interface CashflowFilters {
  page: number
  limit: number
  type?: CashflowType
  /** `yyyy-MM-dd`; the backend only filters when both ends are set. */
  startDate?: string
  endDate?: string
}
