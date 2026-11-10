/**
 * What each supplier sells, as the backend keeps it (topup-be: supplier_brands, supplier_products).
 * A brand is a game, an operator, PLN and the like; LapakGaming calls it a category. `raw` is the
 * supplier's object exactly as received, so nothing it sends is lost.
 */
export type SupplierMappingStatus = 'UNMAPPED' | 'MAPPED' | 'IGNORED'

export type SupplierSyncStatus = 'RUNNING' | 'SUCCEEDED' | 'PARTIAL' | 'FAILED'

/** The supplier's own word for stock. */
export type SupplierStockStatus = 'available' | 'empty' | 'unknown'

/** RFC3339 timestamps in WIB, or null when the event hasn't happened. */
type Timestamp = string | null

export interface SupplierBrand {
  id: string
  provider_id: string
  provider_code: string
  provider_name: string
  supplier_brand_code: string
  /** The country the brand is sold for (lowercase code, e.g. my). The same code in another region is another brand. */
  region: string
  /** LapakGaming's DIGITAL or VOUCHER; empty when the supplier gives none. */
  variant: string
  name: string
  check_id_enabled: boolean
  /** The storefront game this brand supplies, when tied. */
  game_id: string | null
  game_name: string
  mapping_status: SupplierMappingStatus
  mapped_by: string
  mapped_at: Timestamp
  last_seen_at: Timestamp
  product_count: number
}

export interface SupplierBrandDetail extends SupplierBrand {
  input_mapping: unknown
  raw: unknown
}

export interface SupplierProduct {
  id: string
  provider_id: string
  provider_code: string
  provider_name: string
  supplier_brand_id: string | null
  supplier_brand_code: string
  /** The code sent to the supplier when ordering. */
  supplier_sku: string
  name: string
  /** LapakGaming's upstream server, such as S10; empty for other suppliers. */
  sub_provider_code: string
  /** Rupiah. */
  cost: number
  supplier_status: SupplierStockStatus | string
  /** Routing reads these once orders go through suppliers. */
  is_enabled: boolean
  priority: number
  /** The storefront product this supplier product fulfils, when tied. */
  product_id: string | null
  product_name: string
  mapping_status: SupplierMappingStatus
  mapped_by: string
  mapped_at: Timestamp
  cost_updated_at: Timestamp
  last_seen_at: Timestamp
}

export interface SupplierProductDetail extends SupplierProduct {
  raw: unknown
}

export interface SupplierSyncRun {
  id: string
  provider_id: string
  /** ALL is a whole catalog; BRAND is one brand's products. */
  scope: 'ALL' | 'BRAND'
  supplier_brand_id: string | null
  status: SupplierSyncStatus
  brands_seen: number
  products_seen: number
  brands_failed: number
  error: string
  triggered_by: string
  started_at: string
  finished_at: Timestamp
}

export interface SupplierListMeta {
  page: number
  limit: number
  total_data: number
  total_page: number
  has_next: boolean
  has_previous: boolean
}

export interface SupplierListResponse<T> {
  status: string
  message: string
  data: T[] | null
  meta: SupplierListMeta
}

export interface SupplierBrandFilters {
  providerId?: string
  gameId?: string
  /** A region code such as my; all regions when empty. */
  region?: string
  search?: string
  mappingStatus?: SupplierMappingStatus
  page: number
  limit: number
}

export interface SupplierProductFilters {
  providerId?: string
  supplierBrandId?: string
  productId?: string
  search?: string
  status?: SupplierStockStatus
  mappingStatus?: SupplierMappingStatus
  page: number
  limit: number
}

/** Created are new storefront products, Mapped already existed with the same SKU, Skipped were left alone. */
export interface SupplierImportProductsResult {
  created: number
  mapped: number
  skipped: number
}
