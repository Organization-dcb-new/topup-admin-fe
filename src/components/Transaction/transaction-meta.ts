import type { OrderFulfilmentStatus, TransactionStatus } from '@/types/transaction'

export interface Tone {
  chip: string
  dot: string
}

const NEUTRAL: Tone = { chip: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' }

/** Payment statuses, in the order the status filter offers them. */
export const PAYMENT_STATUSES: TransactionStatus[] = ['PAID', 'PENDING', 'PROCESSING', 'FAILED', 'EXPIRED', 'REFUNDED']

const PAYMENT_TONES: Record<TransactionStatus, Tone> = {
  PAID: { chip: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  PENDING: { chip: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500 animate-hud-signal' },
  WAITING: { chip: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500 animate-hud-signal' },
  PROCESSING: { chip: 'bg-cyan-50 text-cyan-700', dot: 'bg-brand-cyan animate-hud-signal' },
  FAILED: { chip: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
  EXPIRED: { chip: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
  REFUNDED: { chip: 'bg-brand-purple/10 text-brand-purple', dot: 'bg-brand-purple' },
}

const ORDER_TONES: Record<OrderFulfilmentStatus, Tone> = {
  PENDING: PAYMENT_TONES.PENDING,
  PAID: { chip: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-400' },
  PROCESSING: PAYMENT_TONES.PROCESSING,
  COMPLETED: { chip: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  FAILED: PAYMENT_TONES.FAILED,
  EXPIRED: PAYMENT_TONES.EXPIRED,
  REFUNDED: PAYMENT_TONES.REFUNDED,
}

export function paymentTone(status: string): Tone {
  return PAYMENT_TONES[status as TransactionStatus] ?? NEUTRAL
}

export function orderTone(status: string): Tone {
  return ORDER_TONES[status as OrderFulfilmentStatus] ?? NEUTRAL
}

export function isKnownPaymentStatus(status: string): status is TransactionStatus {
  return status in PAYMENT_TONES
}

export function isKnownOrderStatus(status: string): status is OrderFulfilmentStatus {
  return status in ORDER_TONES
}

/** The provider's own word for the fulfilment, e.g. SUCCESS, PENDING, PROCESS or FAILED. */
export function providerTone(status: string): Tone {
  const value = status.toUpperCase()
  if (value === 'SUCCESS' || value === 'COMPLETED' || value === 'DONE') return ORDER_TONES.COMPLETED
  if (value === 'PENDING' || value === 'PROCESS' || value === 'PROCESSING') return PAYMENT_TONES.PROCESSING
  if (value === 'FAILED' || value === 'GAGAL' || value === 'ERROR') return PAYMENT_TONES.FAILED
  return NEUTRAL
}

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

/**
 * The first or last second of a calendar day in WIB, written as the UTC wall time the backend expects:
 * it parses `start_date`/`end_date` as UTC, so a plain "2026-11-03 00:00:00" would start at 07:00 WIB.
 */
export function wibDayBoundaryAsUtc(day: Date, edge: 'start' | 'end') {
  const end = edge === 'end'
  const ms =
    Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), end ? 23 : 0, end ? 59 : 0, end ? 59 : 0) - WIB_OFFSET_MS
  return new Date(ms).toISOString().slice(0, 19).replace('T', ' ')
}

/** `qris` → `QRIS`, `bca_va` → `BCA VA`. */
export function formatChannel(channel: string | undefined) {
  return channel ? channel.replace(/[_-]+/g, ' ').trim().toUpperCase() : '—'
}

/** Game account fields from the order, as label/value pairs; nested values are flattened to JSON. */
export function accountFields(meta: Record<string, unknown> | null | undefined) {
  if (!meta || typeof meta !== 'object') return []
  return Object.entries(meta)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([key, value]) => ({ key, value: typeof value === 'object' ? JSON.stringify(value) : String(value) }))
}

/** The customer can still pay: instructions (QR, VA, payment page) are worth showing. */
export function isAwaitingPayment(status: string | undefined) {
  return status === 'PENDING' || status === 'WAITING'
}

export type StepState = 'done' | 'current' | 'failed' | 'upcoming'

export function paymentStep(status: string): StepState {
  if (status === 'PAID' || status === 'REFUNDED') return 'done'
  if (status === 'FAILED' || status === 'EXPIRED') return 'failed'
  return 'current'
}

/** Fulfilment only starts once the payment is through. */
export function fulfilmentStep(orderStatus: string, paymentStatus: string): StepState {
  if (paymentStep(paymentStatus) !== 'done') return 'upcoming'
  if (orderStatus === 'COMPLETED') return 'done'
  if (orderStatus === 'FAILED' || orderStatus === 'EXPIRED' || orderStatus === 'REFUNDED') return 'failed'
  return 'current'
}

/** The detail endpoint sends `yyyy-MM-dd HH:mm:ss` in WIB without an offset; pin it so other time zones read it right. */
export function wibToIso(raw: string | undefined) {
  if (!raw) return raw
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(raw) ? `${raw.replace(' ', 'T')}+07:00` : raw
}

/** `user_id` → `User ID`, `zoneId` → `Zone ID`. */
export function humanizeKey(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((word) => (/^id$/i.test(word) ? 'ID' : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ')
}
