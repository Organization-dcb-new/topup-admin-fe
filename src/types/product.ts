import type { Game, PaginationMeta } from './game'

export interface ProductMetaData {
  min: number
  max: number
}

export interface Product {
  id: string
  game_id: string
  name: string
  sku: string
  image: string
  description: string
  product_type: string
  provider_status: string
  base_price: number
  selling_price: number
  stock_quantity: number
  is_unlimited_stock: boolean
  is_active: boolean
  meta_data: ProductMetaData | null
  sort_order: number
  created_at: string
  updated_at: string
  additional_fee: number
  additional_percent: number
  game?: Game
  last_updated_by: string
}

export interface ProductResponse {
  data: Product[]
  message: string
  status: string
  meta: PaginationMeta
}

/** Markup on top of the provider's base price: a fixed rupiah amount or a percentage. */
export type ProductPriceType = 'fee' | 'percent'

/**
 * PATCH /products/price. The backend keeps only the field matching `type` (the other is reset
 * to 0) and recomputes `selling_price` from the current base price.
 */
export interface UpdateProductPricePayload {
  id: string
  type: ProductPriceType
  additional_fee: number
  additional_percent: number
}

/** PATCH /products/by-game: sets the image of every product of one game; there is no per-product variant. */
export interface ChangeProductImageByGamePayload {
  game_id: string
  image: string
}
