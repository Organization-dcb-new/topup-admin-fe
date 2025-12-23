import { api } from '@/api/axios'
import type { PaymentMethodResponse } from '@/types/payment-method'
import { useQuery } from '@tanstack/react-query'

export const useGetPaymentMethods = () => {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async (): Promise<PaymentMethodResponse> => {
      const res = await api.get('/payment-methods')
      return res.data
    },
  })
}
