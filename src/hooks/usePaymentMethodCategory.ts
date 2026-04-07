import { api } from '@/api/axios'
import type { PaymentCategoryPayload } from '@/components/PaymentMethodCategory/Create'
import type { PaymentMethodCategoriesResponse } from '@/types/payment-method-categories'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export const useCreatePaymentCategory = (
  reset: () => void,
  setPreview: (url: string | null) => void,
  setOpen: (open: boolean) => void
) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (payload: PaymentCategoryPayload) => {
      const res = await api.post('/payment-categories', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Kategori berhasil dibuat')
      queryClient.invalidateQueries({
        queryKey: ['payment-methods-categories'],
      })
      reset()
      setPreview(null)
      setOpen(false)
    },
    onError: () => {
      toast.error('Gagal membuat kategori')
    },
  })

  return mutation
}

export const useGetPaymentMethodCategory = () =>
  useQuery<PaymentMethodCategoriesResponse>({
    queryKey: ['payment-methods-categories'],
    queryFn: async () => {
      const res = await api.get('/payment-categories')
      return res.data
    },
  })

export function useDeletePaymentCategory(id: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = api.delete(`/payment-categories/${id}`)
      return res
    },
    onSuccess: () => {
      toast.success('Kategori berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['payment-methods-categories'] })
    },
    onError: () => {
      toast.error('Gagal menghapus kategori')
    },
  })

  return mutation
}

export function useAssignPaymentMethods(categoryId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payment_method_ids: string[]) => {
      const res = await api.patch(`/payment-categories/${categoryId}/payment-methods`, {
        payment_method_ids,
      })
      return res.data
    },

    onSuccess: () => {
      toast.success('Metode pembayaran berhasil ditautkan ke kategori')

      queryClient.invalidateQueries({
        queryKey: ['payment-methods'],
      })

      queryClient.invalidateQueries({
        queryKey: ['payment-methods-categories'],
      })
    },
    onError: () => {
      toast.error('Gagal menautkan metode pembayaran')
    },
  })
}
