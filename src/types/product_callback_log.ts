import type { PaginationMeta } from './game'

/**
 * Where a price or stock change came from: the 12-hour sync job, an admin's product sync, checkout's live
 * price check, or LapakGaming's push (rows from before 2026-11-17; no push is taken now).
 */
export type ProductChangeSource = 'SCHEDULER' | 'MANUAL_SYNC' | 'CHECKOUT' | 'CALLBACK'
export const PRODUCT_CHANGE_SOURCES: ProductChangeSource[] = ['SCHEDULER', 'MANUAL_SYNC', 'CHECKOUT', 'CALLBACK']

/** One supplier price or stock change of a product, as GET /products/callback-logs returns it. */
export interface ProductCallbackLogResponse {
  source: ProductChangeSource | string
  /** Stock before the change; empty on rows from before it was kept. */
  previous_status: string
  id: string
  product_code: string
  product_name: string
  provider_code: string
  /** New provider price. */
  price: number
  /** The product's base price before this update. */
  previous_price: number
  /** Provider stock status, e.g. `available` or `empty`. */
  status: string
  meta_level: string
  /** Provider event time, Unix seconds or milliseconds. */
  meta_timestamp: number
  /** Raw callback body; the detail endpoint doesn't send it today. */
  original_payload?: Record<string, unknown> | null
  created_at: string
}

export interface ProductCallbackLogListResponse {
  message: string
  data: ProductCallbackLogResponse[]
  meta: PaginationMeta
}

export interface ProductCallbackLogFilters {
  page: number
  limit: number
  /** `yyyy-MM-dd`; the backend fills in the time of day. */
  startDate?: string
  endDate?: string
  search?: string
  status?: string
  source?: ProductChangeSource
  minPrice?: string
  maxPrice?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
