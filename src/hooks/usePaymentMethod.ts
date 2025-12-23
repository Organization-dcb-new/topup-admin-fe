import { api } from '@/api/axios'
import type { PaymentMethodResponse } from '@/types/payment-method'
import { useQuery } from '@tanstack/react-query'

export const getPaymentMethods = async (): Promise<PaymentMethodResponse> => {
  const res = await api.get('/payment-methods')
  return res.data
}

export const paymentMethodQueryKey = ['payment-methods']

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: paymentMethodQueryKey,
    queryFn: getPaymentMethods,
  })
}
