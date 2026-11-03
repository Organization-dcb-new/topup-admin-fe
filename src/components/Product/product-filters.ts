import type { GetProductsParams } from '@/hooks/useProduct'

export type ActiveFilter = 'all' | 'active' | 'inactive'
export type StockFilter = 'all' | 'available' | 'empty'
/** Matched as a substring of `last_updated_by` (`admin:<id>`, `process:<job>`, `system:<event>`). */
export type UpdatedByFilter = 'all' | 'admin' | 'process' | 'system'

export interface ProductFilterState {
  search: string
  /** Game name; the backend matches it as a substring. */
  game: string
  status: ActiveFilter
  stock: StockFilter
  sku: string
  updatedBy: UpdatedByFilter
  baseMin: string
  baseMax: string
  sellMin: string
  sellMax: string
  feeMin: string
  feeMax: string
  pctMin: string
  pctMax: string
}

export const EMPTY_PRODUCT_FILTERS: ProductFilterState = {
  search: '',
  game: '',
  status: 'all',
  stock: 'all',
  sku: '',
  updatedBy: 'all',
  baseMin: '',
  baseMax: '',
  sellMin: '',
  sellMax: '',
  feeMin: '',
  feeMax: '',
  pctMin: '',
  pctMax: '',
}

/** Fields behind "more filters"; counted so the toggle can say how many are in use. */
export const ADVANCED_KEYS = [
  'sku',
  'updatedBy',
  'baseMin',
  'baseMax',
  'sellMin',
  'sellMax',
  'feeMin',
  'feeMax',
  'pctMin',
  'pctMax',
] as const satisfies readonly (keyof ProductFilterState)[]

export function countActive(filters: ProductFilterState, keys: readonly (keyof ProductFilterState)[]) {
  return keys.filter((key) => filters[key] !== EMPTY_PRODUCT_FILTERS[key]).length
}

export function toProductParams(f: ProductFilterState): GetProductsParams {
  return {
    search: f.search,
    sku: f.sku,
    game_name: f.game,
    is_active: f.status === 'all' ? undefined : f.status === 'active',
    provider_status: f.stock === 'all' ? undefined : f.stock,
    last_updated_by: f.updatedBy === 'all' ? undefined : f.updatedBy,
    base_price_above: f.baseMin,
    base_price_below: f.baseMax,
    selling_price_above: f.sellMin,
    selling_price_below: f.sellMax,
    additional_fee_above: f.feeMin,
    additional_fee_below: f.feeMax,
    additional_percent_above: f.pctMin,
    additional_percent_below: f.pctMax,
  }
}
