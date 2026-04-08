import { useEffect } from 'react'
import { api } from '@/api/axios'
import type { ShowPayload } from '@/components/Show/CreateShowModal'
import type { ShowResponse } from '@/types/show'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

type UpdateShowPayload = {
  name: string
  alias: string
  image: string
  is_hot: boolean
  is_new: boolean
  is_popular: boolean
  is_show: boolean
}

export const useGetShows = () => {
  const { t } = useTranslation('common')
  const query = useQuery<ShowResponse>({
    queryKey: ['shows'],
    queryFn: async () => {
      const res = await api.get('/shows/admin')
      return res.data
    },
  })

  useEffect(() => {
    if (!query.isPending) return
    const id = toast.loading(t('showToasts.loading'))
    return () => {
      toast.dismiss(id)
    }
  }, [query.isPending, t])

  useEffect(() => {
    if (!query.isFetchedAfterMount) return
    if (query.isSuccess) {
      toast.success(t('showToasts.loadSuccess'))
    }
    if (query.isError) {
      toast.error(t('showToasts.loadError'))
    }
  }, [query.isSuccess, query.isError, query.isFetchedAfterMount, t])

  return query
}

export const useCreateShow = (
  reset: () => void,
  setPreview: (url: string | null) => void,
  setOpen: (open: boolean) => void,
) => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (payload: ShowPayload) => {
      const res = await api.post('/shows', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('showToasts.createSuccess'))
      queryClient.invalidateQueries({ queryKey: ['shows'] })
      reset()
      setPreview(null)
      setOpen(false)
    },
    onError: () => {
      toast.error(t('showToasts.createError'))
    },
  })

  return mutation
}

export function useDeleteShow(id: string) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = api.delete(`/shows/${id}`)
      return res
    },
    onSuccess: () => {
      toast.success(t('showToasts.deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['shows'] })
    },
    onError: () => {
      toast.error(t('showToasts.deleteError'))
    },
  })

  return mutation
}

export function useAddGamesToShow(showId: string) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (gameIds: string[]) =>
      api.put(`/shows/${showId}/games`, {
        game_ids: gameIds,
      }),
    onSuccess: () => {
      toast.success(t('showToasts.addGamesSuccess'))
      queryClient.invalidateQueries({ queryKey: ['shows'] })
    },
    onError: () => {
      toast.error(t('showToasts.addGamesError'))
    },
  })
}

interface UpdateShowProps {
  id: string
  setOpen?: (val: boolean) => void
}

export function useUpdateShow({ id, setOpen }: UpdateShowProps) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateShowPayload) => api.put(`/shows/${id}`, payload),

    onSuccess: () => {
      toast.success(t('showToasts.updateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['shows'] })
      setOpen?.(false)
    },
    onError: () => {
      toast.error(t('showToasts.updateError'))
    },
  })
}
