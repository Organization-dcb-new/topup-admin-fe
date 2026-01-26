import type { PaginationMeta } from "./game"

export interface OrderItemV2Response {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  voucher_code: string
  status_order_provider: string
  unit_price: number
  subtotal: number
}


export interface OrderItemResponses {
  data: OrderItemV2Response[]
  message: string
  status: string
  meta: PaginationMeta
}
