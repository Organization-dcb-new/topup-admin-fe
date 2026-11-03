import { api } from '@/api/axios'
import type { CashflowFilters, CashflowResponse, CashflowStats } from '@/types/cashflow'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export const useGetCashflows = (filters: CashflowFilters) =>
  useQuery<CashflowResponse>({
    queryKey: ['cashflows', 'list', filters],
    queryFn: async () => {
      const res = await api.get('/cashflows', {
        params: {
          page: filters.page,
          limit: filters.limit,
          type: filters.type || undefined,
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
        },
      })
      return res.data
    },
    // Keep the current page on screen while a new filter loads.
    placeholderData: keepPreviousData,
  })

export interface CashflowPeriodSummary {
  stats: CashflowStats
  /** Entries of every type in the period. */
  total: number
}

/**
 * Period totals for every type. The list endpoint narrows its stats by the type filter (money in
 * turns into 0 when only provider rows are listed), so the summary asks separately without a type.
 */
export const useCashflowSummary = (startDate?: string, endDate?: string) =>
  useQuery<CashflowPeriodSummary>({
    queryKey: ['cashflows', 'summary', startDate, endDate],
    queryFn: async () => {
      const res = await api.get<CashflowResponse>('/cashflows', {
        params: { page: 1, limit: 1, start_date: startDate || undefined, end_date: endDate || undefined },
      })
      return { stats: res.data.stats, total: res.data.meta?.total ?? 0 }
    },
    placeholderData: keepPreviousData,
  })
