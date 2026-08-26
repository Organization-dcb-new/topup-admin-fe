import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import { api } from '@/api/axios'
import { apiErrorMessage } from '@/lib/api-error'
import type {
  PaymentCategoryFormValues,
  PaymentMethodCategoriesResponse,
} from '@/types/payment-method-categories'

const CATEGORY_KEY = ['payment-methods-categories'] as const
const METHOD_KEY = ['payment-methods'] as const

export const useGetPaymentMethodCategory = () =>
  useQuery({
    queryKey: CATEGORY_KEY,
    queryFn: async ({ signal }): Promise<PaymentMethodCategoriesResponse> => {
      const res = await api.get('/payment-categories', { signal })
      return res.data
    },
  })

export const useCreatePaymentCategory = () => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: PaymentCategoryFormValues) => {
      const res = await api.post('/payment-categories', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEY })
      toast.success(t('paymentMethodCategoryToasts.createSuccess'))
    },
    onError: (err: unknown) =>
      toast.error(
        apiErrorMessage(err, t('paymentMethodCategoryToasts.createError')),
      ),
  })
}

export const useUpdatePaymentCategory = (id: string) => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: PaymentCategoryFormValues) => {
      const res = await api.put(`/payment-categories/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEY })
      toast.success(t('paymentMethodCategoryToasts.updateSuccess'))
    },
    onError: (err: unknown) =>
      toast.error(
        apiErrorMessage(err, t('paymentMethodCategoryToasts.updateError')),
      ),
  })
}

export function useDeletePaymentCategory(id: string) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/payment-categories/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEY })
      toast.success(t('paymentMethodCategoryToasts.deleteSuccess'))
    },
    onError: (err: unknown) =>
      toast.error(
        apiErrorMessage(err, t('paymentMethodCategoryToasts.deleteError')),
      ),
  })
}

export function useAssignPaymentMethods(categoryId: string) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payment_method_ids: string[]) => {
      const res = await api.patch(
        `/payment-categories/${categoryId}/payment-methods`,
        { payment_method_ids },
      )
      return res.data
    },
    onSuccess: () => {
      // Penugasan mengubah kedua sisi relasi
      queryClient.invalidateQueries({ queryKey: METHOD_KEY })
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEY })
      toast.success(t('paymentMethodCategoryToasts.assignSuccess'))
    },
    onError: (err: unknown) =>
      toast.error(
        apiErrorMessage(err, t('paymentMethodCategoryToasts.assignError')),
      ),
  })
}
