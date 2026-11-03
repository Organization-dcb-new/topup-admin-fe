import type { DateRange } from 'react-day-picker'

import type { TransactionListFilters } from '@/types/transaction'
import { wibDayBoundaryAsUtc } from './transaction-meta'

export interface TransactionFilterState {
  search: string
  /** '' means every status. */
  status: string
  range: DateRange | undefined
  gameId: string
  paymentMethodId: string
  priceAbove: string
  priceBelow: string
  price: string
}

export const EMPTY_FILTERS: TransactionFilterState = {
  search: '',
  status: '',
  range: undefined,
  gameId: '',
  paymentMethodId: '',
  priceAbove: '',
  priceBelow: '',
  price: '',
}

/** Filters tucked into the "more filters" panel; counted so the toggle can show how many are on. */
export function advancedCount(f: TransactionFilterState) {
  return [f.gameId, f.paymentMethodId, f.priceAbove, f.priceBelow, f.price].filter(Boolean).length
}

export function hasAnyFilter(f: TransactionFilterState) {
  return !!(f.search.trim() || f.status || f.range?.from || advancedCount(f))
}

/** Calendar days → the UTC wall times the backend compares against. */
export function rangeToQuery(range: DateRange | undefined) {
  if (!range?.from) return { startDate: undefined, endDate: undefined }
  return {
    startDate: wibDayBoundaryAsUtc(range.from, 'start'),
    endDate: wibDayBoundaryAsUtc(range.to ?? range.from, 'end'),
  }
}

export function toListQuery(f: TransactionFilterState, page: number, limit: number): TransactionListFilters {
  return {
    page,
    limit,
    search: f.search.trim(),
    status: f.status || undefined,
    gameId: f.gameId || undefined,
    paymentMethodId: f.paymentMethodId || undefined,
    priceAbove: f.priceAbove || undefined,
    priceBelow: f.priceBelow || undefined,
    price: f.price || undefined,
    ...rangeToQuery(f.range),
  }
}
