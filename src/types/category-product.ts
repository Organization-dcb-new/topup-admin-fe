import type { PaginationMeta } from './game'

/** A product inside a category, as the admin list embeds it (no provider stock status). */
export interface CategoryProductItem {
  id: string
  game_id: string
  name: string
  sku: string
  image: string
  description: string
  product_type: string
  selling_price: number
  stock_quantity: number
  is_unlimited_stock: boolean
  is_active: boolean
  meta_data: Record<string, unknown> | null
  sort_order: number
  created_at: string
  updated_at: string
}

/**
 * A storefront grouping of one game's products (e.g. "Diamonds", "Weekly pass").
 * Only active categories, and only their available + active products, reach the storefront.
 */
export interface CategoryProduct {
  id: string
  name: string
  game_id: string
  game_name: string
  /** Lower-cased by the backend and unique across every game. */
  slug: string
  icon_url: string
  description: string
  is_active: boolean | null
  product: CategoryProductItem[] | null
}

export interface CategoryProductListResponse {
  data: CategoryProduct[]
  message: string
  meta: PaginationMeta
  status: string
}

/** POST /category-product. */
export type CategoryProductCreatePayload = {
  name: string
  game_id: string
  slug: string
  icon_url: string
  description: string
  is_active: boolean
}

/** One row of GET /products/game/:id/available — only products the provider has in stock. */
export interface AvailableGameProduct {
  id: string
  name: string
  provider_status: string
  /** The product's base (cost) price. */
  price: number
}
