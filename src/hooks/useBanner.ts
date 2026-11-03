import { api } from '@/api/axios'
import i18n from '@/i18n'
import type { BannerPayload, BannerResponse } from '@/types/banner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export const bannersQueryKey = ['banners'] as const

export const useGetBanners = () =>
  useQuery<BannerResponse>({
    queryKey: bannersQueryKey,
    queryFn: async () => {
      const res = await api.get('/banners')
      return res.data
    },
  })

export function useCreateBanner(onDone?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: BannerPayload) => {
      const res = await api.post('/banners', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(i18n.t('bannerPage.toasts.created'))
      void queryClient.invalidateQueries({ queryKey: bannersQueryKey })
      onDone?.()
    },
    onError: () => toast.error(i18n.t('bannerPage.toasts.createError')),
  })
}

export function useUpdateBanner(onDone?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BannerPayload }) => api.patch(`/banners/${id}`, payload),
    onSuccess: () => {
      toast.success(i18n.t('bannerPage.toasts.updated'))
      void queryClient.invalidateQueries({ queryKey: bannersQueryKey })
      onDone?.()
    },
    onError: () => toast.error(i18n.t('bannerPage.toasts.updateError')),
  })
}

export function useDeleteBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/banners/${id}`),
    onSuccess: () => {
      toast.success(i18n.t('bannerPage.toasts.deleted'))
      void queryClient.invalidateQueries({ queryKey: bannersQueryKey })
    },
    onError: () => toast.error(i18n.t('bannerPage.toasts.deleteError')),
  })
}
