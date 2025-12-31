import { api } from '@/api/axios'
import type { FormValuesPaymentMethod } from '@/components/PaymentMethod/ModalEditPaymentMethod'
import type { PaymentMethodResponse } from '@/types/payment-method'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export type PaymentMethodPayload = {
  name: string
  code: string
  type: string
  provider: string
  icon_url: string
  fee_percentage: number
  fee_fixed: number
  min_amount: number
  max_amount: number
  sort_order: number
  config: string
}

export const useGetPaymentMethods = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['payment-methods', page, limit],
    queryFn: async (): Promise<PaymentMethodResponse> => {
      const res = await api.get('/payment-methods', {
        params: {
          page,
          limit,
        },
      })
      return res.data
    },
  })
}

interface CreatePaymentMethodProps {
  setOpen: (open: boolean) => void
}

export const useCreatePaymentMethodSubmit = ({ setOpen }: CreatePaymentMethodProps) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: PaymentMethodPayload) => {
      const res = await api.post('/payment-methods', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
      setOpen(false)
      toast.success('Payment Method created')
    },
    onError: () => {
      toast.error('Failed to create Payment Method')
    },
  })
}

export function useDeletePaymentMethod(id: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = api.delete(`/payment-methods/${id}`)
      return res
    },
    onSuccess: () => {
      toast.success('Payment Method deleted')
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
    },
    onError: () => {
      toast.error('Failed to delete Payment Method')
    },
  })

  return mutation
}

export function useEditPaymentMethod(paymentMethodId: string, onClose: () => void) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: FormValuesPaymentMethod) => {
      const payload = {
        ...values,
      }

      const res = await api.put(`/payment-methods/${paymentMethodId}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Payment Method updated')
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
      onClose()
    },
    onError: () => toast.error('Failed to update Payment Method'),
  })

  return mutation
}
