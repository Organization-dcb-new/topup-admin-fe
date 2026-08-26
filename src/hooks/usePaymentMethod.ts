import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import { api } from '@/api/axios'
import { apiErrorMessage } from '@/lib/api-error'
import type {
  PaymentMethodFormValues,
  PaymentMethodResponse,
} from '@/types/payment-method'

const LIST_KEY = ['payment-methods'] as const

export const useGetPaymentMethods = (page: number, limit: number) =>
  useQuery({
    queryKey: [...LIST_KEY, page, limit],
    queryFn: async ({ signal }): Promise<PaymentMethodResponse> => {
      const res = await api.get('/payment-methods/admin', {
        signal,
        params: { page, limit },
      })
      return res.data
    },
    // Data lama tetap tampil saat pindah halaman, jadi tabel tidak berkedip
    placeholderData: (previous) => previous,
  })

export const useCreatePaymentMethod = () => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: PaymentMethodFormValues) => {
      const res = await api.post('/payment-methods', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY })
      toast.success(t('paymentMethodToasts.createSuccess'))
    },
    onError: (err: unknown) =>
      toast.error(apiErrorMessage(err, t('paymentMethodToasts.createError'))),
  })
}

export const useUpdatePaymentMethod = (id: string) => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: PaymentMethodFormValues) => {
      const res = await api.put(`/payment-methods/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY })
      toast.success(t('paymentMethodToasts.updateSuccess'))
    },
    onError: (err: unknown) =>
      toast.error(apiErrorMessage(err, t('paymentMethodToasts.updateError'))),
  })
}

export function useDeletePaymentMethod(id: string) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/payment-methods/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY })
      toast.success(t('paymentMethodToasts.deleteSuccess'))
    },
    onError: (err: unknown) =>
      toast.error(apiErrorMessage(err, t('paymentMethodToasts.deleteError'))),
  })
}
