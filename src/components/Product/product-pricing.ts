import type { Product, ProductPriceType } from '@/types/product'

type PriceFields = Pick<Product, 'base_price' | 'selling_price' | 'additional_fee' | 'additional_percent'>

export interface Markup {
  kind: ProductPriceType | 'none'
  /** Rupiah for `fee`, percent for `percent`. */
  value: number
}

const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * The markup a product is sold with. A fixed fee wins, as in the backend. The admin list sends
 * `additional_percent` cut to a whole number (2.5 arrives as 2), but `selling_price` is exact, so
 * the percentage is derived from the two prices whenever there is one to derive.
 */
export function markupOf(p: PriceFields): Markup {
  if (p.additional_fee) return { kind: 'fee', value: p.additional_fee }
  if (p.base_price > 0 && p.selling_price !== p.base_price) {
    return { kind: 'percent', value: round2(((p.selling_price - p.base_price) / p.base_price) * 100) }
  }
  if (p.additional_percent) return { kind: 'percent', value: p.additional_percent }
  return { kind: 'none', value: 0 }
}

/** Selling price the backend will store for this markup; it never goes below the base price. */
export function sellingPriceFor(base: number, kind: ProductPriceType, value: number) {
  const raw = kind === 'fee' ? base + value : base + (base * value) / 100
  return Math.max(base, raw)
}

export function marginOf(p: Pick<Product, 'base_price' | 'selling_price'>) {
  const amount = p.selling_price - p.base_price
  const percent = p.base_price > 0 ? (amount / p.base_price) * 100 : null
  return { amount, percent }
}

export type ActorKind = 'admin' | 'process' | 'system' | 'user' | 'unknown'

/** `last_updated_by` is written as `<kind>:<detail>`, e.g. `admin:<uuid>` or `process:lapakgaming_callback`. */
export function parseActor(raw: string | null | undefined): { kind: ActorKind; detail: string } {
  const value = raw?.trim() ?? ''
  const [head, ...rest] = value.split(':')
  const detail = rest.join(':')
  if (head === 'admin' || head === 'process' || head === 'system' || head === 'user') return { kind: head, detail }
  return { kind: 'unknown', detail: value }
}
