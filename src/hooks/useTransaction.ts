import { api } from '@/api/axios'
import type { PaymentResponse } from '@/types/transaction'
import { useQuery } from '@tanstack/react-query'

export const getPayments = async (): Promise<PaymentResponse> => {
  const res = await api.get('/transactions')
  return res.data
}

export const paymentQueryKey = ['transactions']

export const usePayments = () => {
  return useQuery({
    queryKey: paymentQueryKey,
    queryFn: getPayments,
  })
}
