import i18n from '@/i18n'
import { formatCurrency } from '@/lib/format'
import type { Game, GameInput } from '@/types/game'

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
