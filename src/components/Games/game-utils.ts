import i18n from '@/i18n'
import { formatCurrency } from '@/lib/format'
import type { Game, GameInput } from '@/types/game'
import type { GameInput as EditableGameInput } from '@/types/game-input'
import type { Product } from '@/types/product'

/** Highest markup the bulk price tools allow; the backend enforces it for the all-games update. */
export const PRICE_MAX_PERCENT = 40

function locale() {
  return i18n.language.startsWith('id') ? 'id-ID' : 'en-US'
}

export function formatPercent(value: number) {
  return `${value.toLocaleString(locale(), { maximumFractionDigits: 2 })}%`
}

/** "+12%", "+Rp2.000" or "+12% + Rp2.000"; null when the game has no markup. */
export function formatMarkup(percent?: number | null, fee?: number | null) {
  const parts: string[] = []
  if (percent) parts.push(formatPercent(percent))
  if (fee) parts.push(formatCurrency(fee))
  return parts.length ? `+${parts.join(' + ')}` : null
}

/** Selling price the backend computes for a percentage markup (never below the base price). */
export function sellingFromPercent(base: number, percent: number) {
  return Math.max(base, Math.round(base + (base * percent) / 100))
}

/** The detail endpoint sends inputs as an array or a single object; normalise to a sorted array. */
export function gameInputs(game: Pick<Game, 'input'>): GameInput[] {
  const raw = game.input
  if (raw == null) return []
  return (Array.isArray(raw) ? raw : [raw]).slice().sort((a, b) => a.sort_order - b.sort_order)
}

/** The same fields in the shape the checkout-field editor (GameInputsDialog) works with. */
export function editableInputs(game: Pick<Game, 'input'>): EditableGameInput[] {
  return gameInputs(game).map((input) => ({
    ...input,
    input_type: input.input_type as EditableGameInput['input_type'],
    Options: Array.isArray(input.Options) ? input.Options : null,
  }))
}

/** Lower case words joined by dashes, as the backend generates slugs. */
export function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
}

/** Checkout field keys are identifiers sent to the provider: lower case, digits and underscores. */
export function toInputKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+/, '')
}

/** Small uppercase status chip; colours come from the caller. */
export const gameChipClass =
  'inline-flex items-center gap-1 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.12em] hud-clip-sm'

/** Secondary action in a panel header, next to the primary HUD button. */
export const gamePanelButtonClass =
  'inline-flex h-9 items-center gap-2 bg-white px-3 font-display text-[11px] font-bold uppercase tracking-[0.15em] text-slate-600 ring-1 ring-inset ring-slate-200 hud-clip-sm ' +
  'transition-colors hover:text-brand-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:pointer-events-none disabled:opacity-50'

/** Shared `SelectTrigger` skin so selects line up with the HUD inputs in the game forms. */
export const gameSelectTriggerClass =
  'w-full rounded-md border-slate-200 bg-slate-50 text-slate-900 shadow-none data-[size=default]:h-12 ' +
  'focus-visible:border-brand-purple focus-visible:ring-brand-purple/15 aria-invalid:border-rose-400'

/**
 * GET /products/game/:id answers with only id, name, provider_status and `price` (the base price),
 * although useProductsByGame types the rows as Product.
 */
export function listingBasePrice(product: Product) {
  return product.base_price ?? (product as Product & { price?: number }).price ?? 0
}

/** The markup most of a game's products use; the detail endpoint has no game-level value. */
export function usualPercent(products: Pick<Product, 'additional_percent'>[]) {
  const counts = new Map<number, number>()
  for (const p of products) {
    const value = p.additional_percent ?? 0
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  let usual: number | undefined
  let best = 0
  for (const [value, count] of counts) {
    if (count > best) {
      usual = value
      best = count
    }
  }
  return usual
}

export type ProviderStock = 'available' | 'empty' | 'other'

export function providerStock(status?: string | null): ProviderStock {
  const value = status?.trim().toLowerCase() ?? ''
  if (value === 'available') return 'available'
  if (value === '' || value === 'empty') return 'empty'
  return 'other'
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** GET /games/:id answers a malformed id with a 500 (uuid.MustParse panics), so check first. */
export function isUuid(value: string) {
  return UUID_RE.test(value)
}
