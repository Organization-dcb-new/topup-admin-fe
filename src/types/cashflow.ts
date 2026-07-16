export interface CashflowItem {
  id: string
  order_id: string
  payment_id?: string
  type: 'PROVIDER' | 'PAYMENT_GATEWAY' | 'REVENUE'
  amount: number
  notes: string
  created_at: string
}

export interface CashflowMeta {
  page: number
  limit: number
  total: number
  last_page: number
}

export interface CashflowStats {
  total_out_provider: number
  total_out_pg: number
  total_outflow: number
  total_revenue: number
  net_profit: number
  selisih_pg: number
}

export interface CashflowResponse {
  message: string
  data: CashflowItem[]
  meta: CashflowMeta
  stats: CashflowStats
}
