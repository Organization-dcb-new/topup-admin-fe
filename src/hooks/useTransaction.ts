import { api } from '@/api/axios'
import type { PaymentResponse } from '@/types/transaction'
import { useQuery } from '@tanstack/react-query'

export const useGetTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async (): Promise<PaymentResponse> => {
      const res = await api.get('/transactions')
      return res.data
    },
  })
}
