import { api } from '@/api/axios'
import type { PaymentResponse } from '@/types/transaction'
import { useQuery } from '@tanstack/react-query'

export const useGetTransactions = (
  page: number,
  limit: number,
  search: string,
  startDate?: string,
  endDate?: string,
) => {
  return useQuery({
    queryKey: ['transactions', page, limit, search, startDate, endDate],
    queryFn: async (): Promise<PaymentResponse> => {
      const res = await api.get('/transactions', {
        params: {
          page,
          limit,
          search,
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
        },
      })
      return res.data
    },
  })
}
