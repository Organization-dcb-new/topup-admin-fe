import { api } from '@/api/axios'
import type { CashflowResponse } from '@/types/cashflow'
import { useQuery } from '@tanstack/react-query'

export const useGetCashflows = (
  page: number,
  limit: number,
  cashflowType?: string,
  startDate?: string,
  endDate?: string,
) =>
  useQuery<CashflowResponse>({
    queryKey: ['cashflows', page, limit, cashflowType, startDate, endDate],
    queryFn: async () => {
      const res = await api.get('/cashflows', {
        params: {
          page,
          limit,
          type: cashflowType || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      })
      return res.data
    },
  })
