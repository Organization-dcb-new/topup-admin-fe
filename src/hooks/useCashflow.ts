import { api } from '@/api/axios'
import type { CashflowResponse } from '@/types/cashflow'
import { useQuery } from '@tanstack/react-query'

export const useGetCashflows = (
  page: number,
  limit: number,
  cashflowType?: string,
) =>
  useQuery<CashflowResponse>({
    queryKey: ['cashflows', page, limit, cashflowType],
    queryFn: async () => {
      const res = await api.get('/cashflows', {
        params: {
          page,
          limit,
          type: cashflowType || undefined,
        },
      })
      return res.data
    },
  })
