import { api } from '@/api/axios'
import i18n from '@/i18n'
import type {
  PaymentCategoryCreatePayload,
  PaymentCategoryUpdatePayload,
  PaymentMethodCategoriesResponse,
  PaymentMethodCategory,
} from '@/types/payment-method-categories'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { paymentMethodsQueryKey } from './usePaymentMethod'

export const paymentCategoriesQueryKey = ['payment-methods-categories'] as const

export const useGetPaymentMethodCategory = (enabled = true) =>
  useQuery<PaymentMethodCategoriesResponse>({
    queryKey: paymentCategoriesQueryKey,
    queryFn: async () => {
      const res = await api.get('/payment-categories')
      return res.data
    },
    enabled,
  })

export function toPaymentCategoryUpdate(category: PaymentMethodCategory): PaymentCategoryUpdatePayload {
  return {
    name: category.name,
    slug: category.slug,
    icon_url: category.icon_url,
    sort_order: category.sort_order,
    is_active: category.is_active,
  }
}

export function useCreatePaymentCategory(onDone?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: PaymentCategoryCreatePayload) => {
      const res = await api.post('/payment-categories', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(i18n.t('paymentCategoryPage.toasts.created'))
      void queryClient.invalidateQueries({ queryKey: paymentCategoriesQueryKey })
      onDone?.()
    },
    onError: () => toast.error(i18n.t('paymentCategoryPage.toasts.createError')),
  })
}

export function useUpdatePaymentCategory(onDone?: () => void, successKey = 'paymentCategoryPage.toasts.updated') {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: PaymentCategoryUpdatePayload }) => {
      const res = await api.put(`/payment-categories/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(i18n.t(successKey))
      void queryClient.invalidateQueries({ queryKey: paymentCategoriesQueryKey })
      onDone?.()
    },
    onError: () => toast.error(i18n.t('paymentCategoryPage.toasts.updateError')),
  })
}

export function useDeletePaymentCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/payment-categories/${id}`),
    onSuccess: () => {
      toast.success(i18n.t('paymentCategoryPage.toasts.deleted'))
      void queryClient.invalidateQueries({ queryKey: paymentCategoriesQueryKey })
      void queryClient.invalidateQueries({ queryKey: paymentMethodsQueryKey })
    },
    onError: () => toast.error(i18n.t('paymentCategoryPage.toasts.deleteError')),
  })
}

/** PATCH replaces the category's whole method list; an empty list empties it. */
export function useAssignPaymentMethods(onDone?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ categoryId, methodIds }: { categoryId: string; methodIds: string[] }) => {
      const res = await api.patch(`/payment-categories/${categoryId}/payment-methods`, { payment_method_ids: methodIds })
      return res.data
    },
    onSuccess: () => {
      toast.success(i18n.t('paymentCategoryPage.toasts.methodsSaved'))
      void queryClient.invalidateQueries({ queryKey: paymentMethodsQueryKey })
      void queryClient.invalidateQueries({ queryKey: paymentCategoriesQueryKey })
      onDone?.()
    },
    onError: () => toast.error(i18n.t('paymentCategoryPage.toasts.methodsError')),
  })
}
