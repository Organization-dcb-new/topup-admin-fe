import { api } from '@/api/axios'
import type { FormValuesEditGame } from '@/components/Games/EditGameModal'
import type { FormValuesChangeImage } from '@/components/Games/UploadImageModal'
import type { GameByIDResponse, GamesResponse } from '@/types/game'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export interface GameNames {
  id: string
  name: string
}

export type GetGamesParams = {
  search?: string
  image?: 'all' | 'no_image'
  /** Backend: filter `is_active` (true = aktif, false = nonaktif); omit = semua */
  is_active?: boolean
  /** Backend: filter per `game_id` */
  game_id?: string
  is_show?: boolean
  is_check_id?: boolean
  updated_by?: string
  updated_from?: string
  updated_to?: string
  sort?: 'name' | 'updated_at'
  order?: 'asc' | 'desc'
}

export function useGetGames(page: number, limit: number, params: GetGamesParams = {}) {
  const {
    search = '',
    image = 'all',
    is_active,
    game_id,
    is_show,
    is_check_id,
    updated_by,
    updated_from,
    updated_to,
    sort,
    order,
  } = params

  return useQuery<GamesResponse>({
    queryKey: [
      'games',
      page,
      limit,
      search,
      image,
      is_active ?? 'all',
      game_id ?? '',
      is_show ?? 'all',
      is_check_id ?? 'all',
      updated_by ?? '',
      updated_from ?? '',
      updated_to ?? '',
      sort ?? '',
      order ?? '',
    ],
    queryFn: async () => {
      const { data } = await api.get('/games/pagination', {
        params: {
          page,
          limit,
          image,
          ...(search.trim() !== '' && { search: search.trim() }),
          ...(is_active !== undefined && { is_active }),
          ...(game_id && { game_id }),
          ...(is_show !== undefined && { is_show }),
          ...(is_check_id !== undefined && { is_check_id }),
          ...(updated_by?.trim() && { updated_by: updated_by.trim() }),
          ...(updated_from && { updated_from }),
          ...(updated_to && { updated_to }),
          ...(sort && order && { sort, order }),
        },
      })

      return data
    },

    staleTime: 5000,
  })
}

export function useGetGameById(gameId: string) {
  return useQuery<GameByIDResponse>({
    queryKey: ['game', gameId],
    queryFn: async () => {
      const { data } = await api.get(`/games/${gameId}`)
      return data
    },
    enabled: !!gameId,
    staleTime: 5000,
  })
}

export const useCreateGame = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await api.post('/games', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
  })
}

export const useDeleteGame = (id: string) => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/games/${id}`)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('gameToasts.deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
    onError: () => toast.error(t('gameToasts.deleteError')),
  })
}

export function useUpdateImageGame(onClose: () => void) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: FormValuesChangeImage) => {
      const payload = {
        ...values,
      }

      const res = await api.patch(`/games/image`, payload)
      return res.data
    },
    onSuccess: (_data, variables) => {
      toast.success(t('gameToasts.imageUpdateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['game', variables.game_id] })
      onClose()
    },
    onError: () => toast.error(t('gameToasts.imageUpdateError')),
  })

  return mutation
}

export function useUpdateGame(setOpen: (open: boolean) => void, id: string) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: FormValuesEditGame) => {
      const payload = {
        ...values,
      }

      const res = await api.put(`/games/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('gameToasts.gameUpdateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['game', id] })
      setOpen(false)
    },
    onError: () => toast.error(t('gameToasts.gameUpdateError')),
  })

  return mutation
}

export function useGetGameNames() {
  return useQuery({
    queryKey: ['game-names'],
    queryFn: async () => {
      const res = await api.get('/games/names')
      return res.data.data
    },
  })
}

export function useGetGameNamesWithType() {
  return useQuery<GameNames[]>({
    queryKey: ['game-names'],
    queryFn: async () => {
      const res = await api.get('/games/names')
      return res.data.data
    },
  })
}

export function useToggleGameShow(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (is_show: boolean) => api.put(`/games/${id}`, { is_show }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['shows'] })
    },
  })
}

export function useToggleGameStatus(id: string) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (is_active: boolean) => api.patch(`/games/status/${id}`, { is_active }),
    onSuccess: () => {
      toast.success(t('gameToasts.statusToggleSuccess'))
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
    onError: () => toast.error(t('gameToasts.statusToggleError')),
  })
}

export function useBulkUpdateGameStatus() {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (is_active: boolean) => api.patch('/games/bulk-status', { is_active }),
    onSuccess: () => {
      toast.success(t('gameToasts.bulkStatusSuccess'))
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
    onError: () => toast.error(t('gameToasts.bulkStatusError')),
  })
}
