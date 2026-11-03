import type { OrderItem, OrderSort } from '@/types/order-item'

/** The API's subtotal is always 0 today, so fall back to price × quantity (how it's stored). */
export function orderItemTotal(item: Pick<OrderItem, 'subtotal' | 'unit_price' | 'quantity'>) {
  return item.subtotal || item.unit_price * item.quantity
}

/**
 * What the provider said when the order was placed:
 * - accepted: `SUCCESS`
 * - unsent: no code, the order never reached the provider (e.g. unpaid)
 * - rejected: any other code, shown as-is
 */
export type ProviderState = 'accepted' | 'rejected' | 'unsent'

export function providerState(code: string | undefined | null): ProviderState {
  const value = code?.trim().toUpperCase() ?? ''
  if (!value) return 'unsent'
  return value === 'SUCCESS' ? 'accepted' : 'rejected'
}

/**
 * 1-based position of the first and last row on this page. Newest-first pages are read from the end,
 * so its first page holds whatever the API's last page has.
 */
export function pageRange(sort: OrderSort, page: number, limit: number, total: number, count: number) {
  if (!count) return null
  if (sort === 'oldest') {
    const from = (page - 1) * limit + 1
    return { from, to: from + count - 1 }
  }
  const pages = Math.max(1, Math.ceil(total / limit))
  const lastSize = total - (pages - 1) * limit
  const from = page === 1 ? 1 : lastSize + (page - 2) * limit + 1
  return { from, to: from + count - 1 }
}

/** `••••1234` style mask; short codes are hidden completely. */
export function maskSecret(value: string) {
  return value.length > 6 ? `${'•'.repeat(6)}${value.slice(-4)}` : '•'.repeat(Math.max(6, value.length))
}
