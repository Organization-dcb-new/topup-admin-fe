import { api } from '@/api/axios'
import type { PaymentResponse } from '@/types/transaction'
import { useQuery } from '@tanstack/react-query'

export const useGetTransactions = (page: number, limit: number, search: string) => {
  return useQuery({
    queryKey: ['transactions', page, limit, search],
    queryFn: async (): Promise<PaymentResponse> => {
      const res = await api.get('/transactions', {
        params: {
          page,
          limit,
          search,
        },
      })
      return res.data
    },
  })
}
