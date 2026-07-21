import type { PaginationMeta } from './game'

export interface PaymentGuide {
  en: string;
  id: string;
}

export interface Payment {
  id: string;
  payment_number: string;
  order_id: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'PROCESSING' | 'EXPIRED';
  payment_method_id: string;
  payment_channel: string;
  status_provider: string;
  payment_url: string;
  qr_code_url: string;
  qr_string: string;
  va_number: string;
  app_name: string;
  margin: number;
  guide: PaymentGuide;
  created_at: string;
}

export interface TransactionPaginationMeta extends PaginationMeta {
  total_volume?: number
  total_paid_count?: number
  total_margin?: number
  success_rate?: number
}

export interface PaymentResponse {
  data: Payment[];
  message: string;
  meta: TransactionPaginationMeta;
  status: string;
}
