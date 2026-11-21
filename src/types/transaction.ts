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
  /** Referral commission on this payment; only in a referral code's detail. */
  earnings?: number;
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

/**
 * Every payment status the backend can send. `Payment['status']` keeps the common ones (other pages key
 * maps by it), so treat incoming values as this wider union and expect unknown strings too.
 */
export type TransactionStatus = Payment['status'] | 'WAITING' | 'REFUNDED' | 'FULFILMENT_FAILED'

/**
 * Fulfilment status of the order behind a payment. `FULFILMENT_FAILED`: the buyer paid, but placing the
 * order with the supplier failed; it waits for an admin to send it again.
 */
export type OrderFulfilmentStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'FULFILMENT_FAILED'
  | 'EXPIRED'
  | 'REFUNDED'

/** GET /transactions query; dates are `yyyy-MM-dd HH:mm:ss` and the backend reads them as UTC. */
export interface TransactionListFilters {
  page: number
  limit: number
  search?: string
  startDate?: string
  endDate?: string
  gameId?: string
  paymentMethodId?: string
  status?: string
  /** Amount at least this much. */
  priceAbove?: string
  /** Amount at most this much. */
  priceBelow?: string
  /** Amount exactly this much. */
  price?: string
}

/** GET /transactions/export-csv query. */
export interface TransactionExportFilters {
  startDate?: string
  endDate?: string
  status?: string
  paymentMethodId?: string
}

export interface TransactionDetailOrderItem {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  subtotal: number
  voucher_code: string
  /** The supplier's raw fulfilment status, e.g. SUCCESS or USER_ID_EMPTY. Older backends do not send it. */
  status_provider?: string
  /** The supplier's order id (TID). */
  provider_order_id?: string
  margin?: number
}

export interface TransactionDetailOrder {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
  customer_email: string
  ip_address: string
  /** The account fields the customer typed at checkout, e.g. user_id and zone_id. */
  meta_data: Record<string, unknown> | null
  /** The provider's order reference. */
  tid: string
}

/**
 * GET /transactions/detail/:id. Margin and provider status sit under `order_item` (older backends only
 * sent them with the list), and the customer's IP, game fields and TID under `order`.
 */
export interface TransactionDetail {
  id: string
  payment_number: string
  order_id: string
  amount: number
  status: string
  payment_method_id: string
  /** Gateway that took the payment: `paylabs`, or `redision` for payments made before the switch. Older backends do not send it. */
  gateway?: 'paylabs' | 'redision'
  /** The gateway's own order number (Paylabs), for looking the payment up in its dashboard. */
  gateway_reference?: string
  payment_channel: string
  order_item: TransactionDetailOrderItem
  order: TransactionDetailOrder
  email: string
  sku: string
  payment_url: string
  qr_code_url: string
  qr_string: string
  va_number: string
  guide?: PaymentGuide
  /** RFC3339 in WIB; older backends sent `yyyy-MM-dd HH:mm:ss` in WIB. */
  created_at: string
}

/**
 * POST /transactions/detail/:id/reveal. The list, detail and export always mask the voucher codes,
 * buyer email, IP and game account; this returns them for one transaction, and the backend logs it.
 */
export interface TransactionReveal {
  voucher_codes: string[]
  customer_email: string
  client_ip: string
  meta_data: Record<string, unknown> | null
}

/** What the list knows about a row and the detail endpoint doesn't; passed along as router state. */
export interface TransactionRowState {
  id: string
  margin?: number
  status_provider?: string
  app_name?: string
}
