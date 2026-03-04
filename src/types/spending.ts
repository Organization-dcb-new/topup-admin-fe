import type { PaginationMeta } from "./game"

export interface ApiSpendingResponse {
  status: string
  message: string
  data: SpendingSummary
  meta: PaginationMeta
}

export interface SpendingSummary {
  total_amount_payment_gateway: number
  total_amount_provider: number
  spending_data: SpendingData[]
}

export interface SpendingData {
  payment_id: string
  order_id: string
  status_payment: string
  status_order: string
  payment_gateway_amount: number
  payment_gateway_time: string
  provider_name: string
  provider_amount: number
  provider_callback_time: string
}
