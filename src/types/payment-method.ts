import type { PaginationMeta } from './game'

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
  config: string
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

export type FormValuesPaymentMethodCreate = {
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

export type FormValuesPaymentMethod = {
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
}

export type FormValuesPaymentMethodEdit = {
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
}
