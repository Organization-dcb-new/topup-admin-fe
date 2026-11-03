import type { PaginationMeta } from './game'

/** One product update pushed by the provider (price and stock), as GET /products/callback-logs returns it. */
export interface ProductCallbackLogResponse {
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
  minPrice?: string
  maxPrice?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
