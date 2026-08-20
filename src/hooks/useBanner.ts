import { useEffect, useRef } from 'react'
import { api } from '@/api/axios'
import type { BannerPayload, BannerResponse } from '@/types/banner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export const useGetBanners = () => {
  const { t } = useTranslation('common')
  const query = useQuery<BannerResponse>({
    queryKey: ['banners'],
    queryFn: async () => {
      const res = await api.get('/banners')
      return res.data
    },
    staleTime: 60_000,
  })

  // Hanya kegagalan yang ditoast. Status memuat / berhasil / kosong sudah
  // tampil di halaman (tag status, blok loading, state kosong), dan dulu
  // toast-nya ikut muncul lagi setiap refetch — termasuk setelah tiap
  // mutation dan setiap window kembali fokus.
  const hadError = useRef(false)

  useEffect(() => {
    if (!query.isFetchedAfterMount) return

    if (query.isError) {
      if (!hadError.current) {
        hadError.current = true
        toast.error(t('bannerToasts.loadError'))
      }
      return
    }

    hadError.current = false
  }, [query.isError, query.isFetchedAfterMount, t])

  return query
}

export function useDeleteBanner(id: string) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.delete(`/banners/${id}`),
    onSuccess: () => {
      toast.success(t('bannerToasts.deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['banners'] })
    },
    onError: () => {
      toast.error(t('bannerToasts.deleteError'))
    },
  })
}

interface UpdateBannerProps {
  id: string
  setOpen?: (val: boolean) => void
}

export function useUpdateBanner({ id, setOpen }: UpdateBannerProps) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BannerPayload) => api.patch(`/banners/${id}`, payload),

    onSuccess: () => {
      toast.success(t('bannerToasts.updateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      setOpen?.(false)
    },
    onError: () => {
      toast.error(t('bannerToasts.updateError'))
    },
  })
}

// Create Banner
export const useCreateBanner = (
  reset: () => void,
  setPreview: (url: string | null) => void,
  setOpen: (open: boolean) => void
) => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: BannerPayload) => {
      const res = await api.post('/banners', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('bannerToasts.createSuccess'))
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      reset()
      setPreview(null)
      setOpen(false)
    },
    onError: () => {
      toast.error(t('bannerToasts.createError'))
    },
  })
}
