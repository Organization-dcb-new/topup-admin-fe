import type { PaginationMeta } from './game'

/** What the backend did with one Paylabs notification. */
export type CallbackOutcome = 'PROCESSED' | 'DUPLICATE' | 'FAILED' | 'REJECTED' | 'UNAVAILABLE'
export const CALLBACK_OUTCOMES: CallbackOutcome[] = ['PROCESSED', 'DUPLICATE', 'FAILED', 'REJECTED', 'UNAVAILABLE']

/** Paylabs' own order status: 01 pending, 02 success, 09 failed. */
export type PaylabsStatus = '01' | '02' | '09'
export const PAYLABS_STATUSES: PaylabsStatus[] = ['02', '01', '09']

/** One notification Paylabs sent, as GET /payment-callback/logs returns it. */
export interface PaymentCallbackLog {
  id: string
  gateway: string
  /** Read from merchantTradeNo; null when that isn't one of our orders. */
  order_id: string | null
  /** The transaction of that order; null when there is none. */
  payment_id: string | null
  payment_number: string
  payment_status: string
  request_id: string
  merchant_trade_no: string
  platform_trade_no: string
  payment_type: string
  status: string
  amount: number
  outcome: CallbackOutcome | string
  error_message: string
  /** False for REJECTED (bad signature) and UNAVAILABLE; the order fields are then unverified. */
  signature_valid: boolean
  /** errCode we replied with: "0" stops Paylabs' retries, "1" asks for one. Empty when we answered with an HTTP error. */
  ack_code: string
  http_status: number
  duration_ms: number
  /** RFC3339. */
  created_at: string
}

/** GET /payment-callback/logs/:id: the request as received and our reply. */
export interface PaymentCallbackLogDetail extends PaymentCallbackLog {
  client_ip: string
  headers: Record<string, string>
  body: string
  /** `body` decoded; null when it isn't JSON. */
  body_json: unknown
  reply: string
  reply_json: unknown
}

export interface PaymentCallbackLogFilters {
  page: number
  limit: number
  search?: string
  outcome?: string
  status?: string
  orderId?: string
  /** `yyyy-MM-dd` in WIB; the end day is included. */
  startDate?: string
  endDate?: string
}

export type ProviderLogResult = 'SENT' | 'SUCCESS' | 'FAILED'
export type ProviderLogOperation = 'CREATE_ORDER' | 'CHECK_STATUS' | 'CALLBACK'
export const PROVIDER_LOG_OPERATIONS: ProviderLogOperation[] = ['CREATE_ORDER', 'CHECK_STATUS', 'CALLBACK']
export type ProviderLogType = 'REQUEST_TO_PROVIDER' | 'RESPONSE_FROM_PROVIDER' | 'CALLBACK_FROM_PROVIDER'

/** One exchange with the supplier about an order, as GET /provider-order-logs returns it. */
export interface ProviderOrderLog {
  id: string
  order_id: string | null
  payment_id: string | null
  payment_number: string
  /** The supplier's order id (TID). */
  provider_order_id: string
  provider_name: string
  log_type: ProviderLogType | string
  operation: ProviderLogOperation | string
  http_status_code: number
  /** Raw flag; prefer `result`, which also counts an HTTP 200 carrying an error code as failed. */
  is_success: boolean
  error_message: string
  response_time_ms: number
  /** The supplier's `code`, e.g. SUCCESS or USER_ID_EMPTY. */
  provider_code: string
  /** The supplier's order status, e.g. PENDING, SUCCESS or REFUNDED. */
  provider_status: string
  result: ProviderLogResult | string
  /** RFC3339. */
  created_at: string
}

export interface ProviderOrderLogDetail extends ProviderOrderLog {
  request_payload: unknown
  response_payload: unknown
}

export interface ProviderOrderLogFilters {
  page: number
  limit: number
  search?: string
  operation?: string
  result?: string
  orderId?: string
  startDate?: string
  endDate?: string
}

export interface ProviderTransaction {
  id: string
  product_name: string
  note: string
  status: string
  voucher_code: string
}

/** POST /provider-order-logs/orders/:order_id/check-status: the supplier's live answer. */
export interface ProviderOrderStatus {
  order_id: string
  provider_name: string
  provider_order_id: string
  /** SUCCESS, or an error code such as TID_NOT_FOUND. */
  code: string
  status: string
  transactions: ProviderTransaction[] | null
  checked_at: string
  /** Our order's status after the check. */
  order_status: string
  /** True when the check settled the order: LapakGaming had finished one still PROCESSING here. */
  order_updated: boolean
}

export interface ListResponse<T> {
  message: string
  data: T[]
  meta: PaginationMeta
}
