import type { PaginationMeta } from "./game"

export interface PaymentMethodConfig {
  note?: string
}

export interface PaymentMethod {
  id: string
  name: string
  code: string
  type: string
  provider: string
  icon_url: string
  fee_percentage: number
  fee_fixed: number
  min_amount: number
  max_amount: number
  full_name: string
  sort_order: number
  config: PaymentMethodConfig
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PaymentMethodResponse {
  data: PaymentMethod[]
  message: string
  status: string
  meta: PaginationMeta
}
