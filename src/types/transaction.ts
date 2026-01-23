import type { PaginationMeta } from './game'

export interface PaymentGuide {
  en: string
  id: string
}

export interface Payment {
  id: string
  payment_number: string
  order_id: string
  amount: number
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED'
  payment_method_id: string
  payment_channel: string
  payment_url: string
  qr_code_url: string
  qr_string: string
  va_number: string
  guide: PaymentGuide
  created_at: string
}

export interface PaymentResponse {
  data: Payment[]
  message: string
  meta: PaginationMeta
  status: string
}
