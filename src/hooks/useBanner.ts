import { useEffect, useRef } from 'react'
import { api } from '@/api/axios'
import type { BannerPayload, BannerResponse } from '@/types/banner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

type UpdateBannerPayload = {
  image: string
  redirect_link: string
}

export const useGetBanners = () => {
  const { t } = useTranslation('common')
  const query = useQuery<BannerResponse>({
    queryKey: ['banners'],
    queryFn: async () => {
      const res = await api.get('/banners')
      return res.data
    },
  })

  useEffect(() => {
    if (!query.isPending) return
    const id = toast.loading(t('bannerToasts.loadingList'))
    return () => {
      toast.dismiss(id)
    }
  }, [query.isPending, t])

  const lastResultSignature = useRef<string | null>(null)
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

    if (!query.isSuccess || !query.data) return

    const signature = String(query.dataUpdatedAt)
    if (lastResultSignature.current === signature) return
    lastResultSignature.current = signature

    if (query.data.data.length === 0) {
      toast.success(t('bannerToasts.emptyList'))
    } else {
      toast.success(t('bannerToasts.loadSuccess'))
    }
  }, [query.isSuccess, query.isError, query.isFetchedAfterMount, query.data, query.dataUpdatedAt, t])

  return query
}

export function useDeleteBanner(id: string) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = api.delete(`/banners/${id}`)
      return res
    },
    onSuccess: () => {
      toast.success(t('bannerToasts.deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['banners'] })
    },
    onError: () => {
      toast.error(t('bannerToasts.deleteError'))
    },
  })

  return mutation
}

interface UpdateBannerProps {
  id: string
  setOpen?: (val: boolean) => void
}

export function useUpdateBanner({ id, setOpen }: UpdateBannerProps) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateBannerPayload) => api.patch(`/banners/${id}`, payload),

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

  const mutation = useMutation({
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

  return mutation
}
