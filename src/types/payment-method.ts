import type { PaginationMeta } from './game'

export interface PaymentMethod {
  id: string
  name: string
  /** Channel code sent to the gateway, e.g. `qris` or `bca_va`. */
  code: string
  type: string
  provider: string
  icon_url: string
  fee_percentage: number
  fee_fixed: number
  min_amount: number
  max_amount: number
  category_id: string
  full_name: string
  sort_order: number
  config: unknown
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

/** POST /payment-methods; `config` is a JSON string and can only be set here. */
export type PaymentMethodCreatePayload = {
  name: string
  code: string
  type: string
  provider: string
  icon_url: string
  fee_percentage: number
  fee_fixed: number
  min_amount: number
  max_amount: number
  sort_order: number
  config: string
}

/** PUT /payment-methods/:id overwrites every field listed here. */
export type PaymentMethodUpdatePayload = Omit<PaymentMethodCreatePayload, 'config'> & {
  is_active: boolean
}
