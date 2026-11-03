import { api } from '@/api/axios'
import i18n from '@/i18n'
import type { CreateShowPayload, Show, ShowResponse, UpdateShowPayload } from '@/types/show'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export const showsQueryKey = ['shows'] as const

export const useGetShows = () =>
  useQuery<ShowResponse>({
    queryKey: showsQueryKey,
    queryFn: async () => {
      const res = await api.get('/shows/admin')
      return res.data
    },
  })

/** Everything PUT /shows/:id needs, taken from the show as it is now. */
export function toUpdatePayload(show: Show): UpdateShowPayload {
  return {
    name: show.name,
    alias: show.alias,
    image: show.image,
    is_hot: show.is_hot,
    is_new: show.is_new,
    is_popular: show.is_popular,
    is_show: show.is_show,
  }
}

export function useCreateShow(onDone?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateShowPayload) => {
      const res = await api.post('/shows', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(i18n.t('showPage.toasts.created'))
      void queryClient.invalidateQueries({ queryKey: showsQueryKey })
      onDone?.()
    },
    onError: () => toast.error(i18n.t('showPage.toasts.createError')),
  })
}

export function useUpdateShow(onDone?: () => void, successKey = 'showPage.toasts.updated') {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateShowPayload }) => api.put(`/shows/${id}`, payload),
    onSuccess: () => {
      toast.success(i18n.t(successKey))
      void queryClient.invalidateQueries({ queryKey: showsQueryKey })
      onDone?.()
    },
    onError: () => toast.error(i18n.t('showPage.toasts.updateError')),
  })
}

export function useDeleteShow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/shows/${id}`),
    onSuccess: () => {
      toast.success(i18n.t('showPage.toasts.deleted'))
      void queryClient.invalidateQueries({ queryKey: showsQueryKey })
    },
    onError: () => toast.error(i18n.t('showPage.toasts.deleteError')),
  })
}

/** PUT /shows/:id/games replaces the whole list; an empty list clears it. */
export function useSetShowGames(onDone?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ showId, gameIds }: { showId: string; gameIds: string[] }) =>
      api.put(`/shows/${showId}/games`, { game_ids: gameIds }),
    onSuccess: () => {
      toast.success(i18n.t('showPage.toasts.gamesSaved'))
      void queryClient.invalidateQueries({ queryKey: showsQueryKey })
      onDone?.()
    },
    onError: () => toast.error(i18n.t('showPage.toasts.gamesError')),
  })
}
