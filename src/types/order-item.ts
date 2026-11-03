import type { PaginationMeta } from './game'

/** One line of an order, as GET /orders/order-item returns it. */
export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  /** Code the provider delivered (vouchers); empty for direct top-ups. Treat it as a secret. */
  voucher_code: string
  /**
   * The provider's response code when the order was placed (`SUCCESS` when accepted); empty when it
   * was never sent, e.g. the payment didn't go through.
   */
  status_provider: string
  unit_price: number
  /** Always 0 today: the response mapper drops it. Use `orderItemTotal`. */
  subtotal: number
}

export interface OrderItemListResponse {
  data: OrderItem[]
  message: string
  status: string
  meta: PaginationMeta
}

export type OrderSort = 'newest' | 'oldest'
