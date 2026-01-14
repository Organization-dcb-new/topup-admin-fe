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
  base_price: number
  selling_price: number
  stock_quantity: number
  is_unlimited_stock: boolean
  is_active: boolean
  meta_data: ProductMetaData
  sort_order: number
  created_at: string
  updated_at: string
  game: Game
}

export interface ProductResponse {
  data: Product[]
  message: string
  status: string
  meta: PaginationMeta
}
