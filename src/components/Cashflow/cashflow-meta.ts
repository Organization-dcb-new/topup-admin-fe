import { format, parse, startOfMonth, subDays } from 'date-fns'
import type { DateRange } from 'react-day-picker'

import type { CashflowItem, CashflowType } from '@/types/cashflow'

export type CashflowDirection = 'in' | 'out' | 'other'

export function directionOf(type: CashflowItem['type']): CashflowDirection {
  if (type === 'PAYMENT_GATEWAY') return 'in'
  if (type === 'PROVIDER') return 'out'
  return 'other'
}

export const DIRECTION_TYPE: Record<'in' | 'out', CashflowType> = { in: 'PAYMENT_GATEWAY', out: 'PROVIDER' }

/** What the backend's generated notes say, pulled apart for display. Raw notes stay the fallback. */
export interface ParsedNotes {
  method?: string
  provider?: string
  sku?: string
  tid?: string
}

const PG_NOTE = /^Payment Revenue for Method:\s*(.+)$/i
const PROVIDER_NOTE = /^(.+?)\s+provider cost for Product:\s*(.+?),\s*TID:\s*(.*)$/i

export function parseNotes(notes: string | undefined): ParsedNotes {
  const text = notes?.trim() ?? ''
  const pg = PG_NOTE.exec(text)
  if (pg) return { method: pg[1].trim() }
  const provider = PROVIDER_NOTE.exec(text)
  if (provider) return { provider: provider[1].trim(), sku: provider[2].trim(), tid: provider[3].trim() || undefined }
  return {}
}

export type RangeKey = 'today' | '7d' | '30d' | 'month' | 'custom'
export const RANGE_KEYS: RangeKey[] = ['today', '7d', '30d', 'month', 'custom']

const DAY = 'yyyy-MM-dd'

export function toDay(date: Date) {
  return format(date, DAY)
}

/** Local-midnight date from a `yyyy-MM-dd` string; undefined when it doesn't parse. */
export function fromDay(value: string | null | undefined) {
  if (!value) return undefined
  const date = parse(value, DAY, new Date())
  return Number.isNaN(date.getTime()) ? undefined : date
}

/**
 * Start and end days for a range. The backend only filters when both ends are sent, so a custom
 * range with just a start uses that day as the end too; an empty custom range means "all time".
 */
export function rangeDays(key: RangeKey, custom: DateRange | undefined, now = new Date()) {
  switch (key) {
    case 'today':
      return { start: toDay(now), end: toDay(now) }
    case '7d':
      return { start: toDay(subDays(now, 6)), end: toDay(now) }
    case '30d':
      return { start: toDay(subDays(now, 29)), end: toDay(now) }
    case 'month':
      return { start: toDay(startOfMonth(now)), end: toDay(now) }
    case 'custom':
      if (!custom?.from) return { start: undefined, end: undefined }
      return { start: toDay(custom.from), end: toDay(custom.to ?? custom.from) }
  }
}
