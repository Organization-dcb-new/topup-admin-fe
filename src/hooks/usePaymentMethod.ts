import { api } from '@/api/axios'
import i18n from '@/i18n'
import type {
  PaymentMethod,
  PaymentMethodCreatePayload,
  PaymentMethodResponse,
  PaymentMethodUpdatePayload,
} from '@/types/payment-method'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export const paymentMethodsQueryKey = ['payment-methods'] as const

export const useGetPaymentMethods = (page: number, limit: number) =>
  useQuery({
    queryKey: [...paymentMethodsQueryKey, page, limit],
    queryFn: async (): Promise<PaymentMethodResponse> => {
      const res = await api.get('/payment-methods/admin', { params: { page, limit } })
      return res.data
    },
  })

/** Everything PUT /payment-methods/:id needs, taken from the method as it is now. */
export function toPaymentMethodUpdate(pm: PaymentMethod): PaymentMethodUpdatePayload {
  return {
    name: pm.name,
    code: pm.code,
    type: pm.type,
    provider: pm.provider,
    icon_url: pm.icon_url,
    fee_percentage: pm.fee_percentage,
    fee_fixed: pm.fee_fixed,
    min_amount: pm.min_amount,
    max_amount: pm.max_amount,
    sort_order: pm.sort_order,
    is_active: pm.is_active,
  }
}

export function useCreatePaymentMethod(onDone?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: PaymentMethodCreatePayload) => {
      const res = await api.post('/payment-methods', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(i18n.t('paymentMethodPage.toasts.created'))
      void queryClient.invalidateQueries({ queryKey: paymentMethodsQueryKey })
      onDone?.()
    },
    onError: () => toast.error(i18n.t('paymentMethodPage.toasts.createError')),
  })
}

export function useUpdatePaymentMethod(onDone?: () => void, successKey = 'paymentMethodPage.toasts.updated') {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: PaymentMethodUpdatePayload }) => {
      const res = await api.put(`/payment-methods/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(i18n.t(successKey))
      void queryClient.invalidateQueries({ queryKey: paymentMethodsQueryKey })
      onDone?.()
    },
    onError: () => toast.error(i18n.t('paymentMethodPage.toasts.updateError')),
  })
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/payment-methods/${id}`),
    onSuccess: () => {
      toast.success(i18n.t('paymentMethodPage.toasts.deleted'))
      void queryClient.invalidateQueries({ queryKey: paymentMethodsQueryKey })
    },
    onError: () => toast.error(i18n.t('paymentMethodPage.toasts.deleteError')),
  })
}
