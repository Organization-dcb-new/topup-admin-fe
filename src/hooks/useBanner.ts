import { api } from '@/api/axios'
import type { BannerPayload, BannerResponse } from '@/types/banner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export const useGetBanners = () =>
  useQuery<BannerResponse>({
    queryKey: ['banners'],
    queryFn: async () => {
      const res = await api.get('/banners')
      return res.data
    },
  })

export function useDeleteBanner(id: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = api.delete(`/banners/${id}`)
      return res
    },
    onSuccess: () => {
      toast.success('Banner deleted')
      queryClient.invalidateQueries({ queryKey: ['banners'] })
    },
    onError: () => {
      toast.error('Failed to delete banners')
    },
  })

  return mutation
}

// Create Banner
export const useCreateBanner = (
  reset: () => void,
  setPreview: (url: string | null) => void,
  setOpen: (open: boolean) => void
) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (payload: BannerPayload) => {
      const res = await api.post('/banners', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Banner created successfully')
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      reset()
      setPreview(null)
      setOpen(false)
    },
    onError: () => {
      toast.error('Failed to Banners category')
    },
  })

  return mutation
}
