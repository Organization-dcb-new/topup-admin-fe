import { api } from '@/api/axios'
import i18n from '@/i18n'
import type {
  GameByIDResponse,
  GameCreateRequest,
  GameImageRequest,
  GamesResponse,
  GameUpdateRequest,
} from '@/types/game'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export interface GameNames {
  id: string
  name: string
}

/** Filters GET /games/pagination actually honours; anything else is ignored by the backend. */
export type GetGamesParams = {
  search?: string
  image?: 'all' | 'with_image' | 'no_image'
  /** Omit for all games. */
  is_active?: boolean
  game_id?: string
}

export const gamesQueryKey = ['games'] as const

/** Backend error text, for the few messages the forms map onto a field. */
export function gameServerMessage(err: unknown) {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message
}

const serverMessage = gameServerMessage

export function useGetGames(page: number, limit: number, params: GetGamesParams = {}) {
  const { search = '', image = 'all', is_active, game_id } = params
  return useQuery<GamesResponse>({
    queryKey: [...gamesQueryKey, page, limit, search, image, is_active ?? 'all', game_id ?? ''],
    queryFn: async () => {
      const { data } = await api.get('/games/pagination', {
        params: {
          page,
          limit,
          image,
          ...(search.trim() && { search: search.trim() }),
          ...(is_active !== undefined && { is_active }),
          ...(game_id && { game_id }),
        },
      })
      return data
    },
    // Keep the current page on screen while a new filter loads.
    placeholderData: keepPreviousData,
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

/** Refreshes every view of a game after a change. */
function useInvalidateGame() {
  const queryClient = useQueryClient()
  return (gameId?: string) => {
    void queryClient.invalidateQueries({ queryKey: gamesQueryKey })
    void queryClient.invalidateQueries({ queryKey: ['game-names'] })
    if (gameId) void queryClient.invalidateQueries({ queryKey: ['game', gameId] })
  }
}

export function useCreateGame(onDone?: () => void) {
  const invalidate = useInvalidateGame()
  return useMutation({
    mutationFn: async (payload: GameCreateRequest) => {
      const res = await api.post('/games', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(i18n.t('gamePage.toasts.created'))
      invalidate()
      onDone?.()
    },
  })
}

export function useUpdateGame(onDone?: () => void) {
  const invalidate = useInvalidateGame()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: GameUpdateRequest }) => {
      const res = await api.put(`/games/${id}`, payload)
      return res.data
    },
    onSuccess: (_res, { id, payload }) => {
      toast.success(i18n.t('gamePage.toasts.updated'))
      invalidate(id)
      // Shows list their games, so a visibility change shows up there too.
      if (payload.is_show !== undefined) void queryClient.invalidateQueries({ queryKey: ['shows'] })
      onDone?.()
    },
    onError: (err) => toast.error(serverMessage(err) || i18n.t('gamePage.toasts.updateError')),
  })
}

export function useToggleGameShow(id: string) {
  const invalidate = useInvalidateGame()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (is_show: boolean) => api.put(`/games/${id}`, { is_show }),
    onSuccess: (_res, isShow) => {
      toast.success(i18n.t(isShow ? 'gamePage.toasts.shown' : 'gamePage.toasts.hidden'))
      invalidate(id)
      void queryClient.invalidateQueries({ queryKey: ['shows'] })
    },
    onError: (err) => toast.error(serverMessage(err) || i18n.t('gamePage.toasts.updateError')),
  })
}

export function useToggleGameStatus(id: string) {
  const invalidate = useInvalidateGame()
  return useMutation({
    mutationFn: (is_active: boolean) => api.patch(`/games/status/${id}`, { is_active }),
    onSuccess: (_res, isActive) => {
      toast.success(i18n.t(isActive ? 'gamePage.toasts.activated' : 'gamePage.toasts.deactivated'))
      invalidate(id)
    },
    onError: () => toast.error(i18n.t('gamePage.toasts.statusError')),
  })
}

export function useUpdateGameImage(onDone?: () => void) {
  const invalidate = useInvalidateGame()
  return useMutation({
    mutationFn: async (payload: GameImageRequest) => {
      const res = await api.patch('/games/image', payload)
      return res.data
    },
    onSuccess: (_res, payload) => {
      toast.success(i18n.t('gamePage.toasts.imagesSaved'))
      invalidate(payload.game_id)
      onDone?.()
    },
    onError: () => toast.error(i18n.t('gamePage.toasts.imagesError')),
  })
}

export function useDeleteGame(onDone?: () => void) {
  const invalidate = useInvalidateGame()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/games/${id}`),
    onSuccess: () => {
      toast.success(i18n.t('gamePage.toasts.deleted'))
      invalidate()
      onDone?.()
    },
    onError: (err) => toast.error(serverMessage(err) || i18n.t('gamePage.toasts.deleteError')),
  })
}

/** Sets one markup percentage on every product of a game (PATCH /products/price/bulk). */
export function useBulkUpdateGamePrice(gameId: string, onDone?: () => void) {
  const invalidate = useInvalidateGame()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (additionalPercent: number) =>
      api.patch('/products/price/bulk', { game_id: gameId, additional_percent: additionalPercent, type: 'percent' }),
    onSuccess: () => {
      toast.success(i18n.t('gamePage.toasts.priceSaved'))
      invalidate(gameId)
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      void queryClient.invalidateQueries({ queryKey: ['products-by-game', gameId] })
      void queryClient.invalidateQueries({ queryKey: ['product-names', gameId] })
      onDone?.()
    },
    onError: (err) => toast.error(serverMessage(err) || i18n.t('gamePage.toasts.priceError')),
  })
}

/** Pulls this game's products from the provider (POST /games/:id/sync-products). */
export function useSyncGameProducts(gameId: string, onDone?: () => void) {
  const invalidate = useInvalidateGame()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post(`/games/${gameId}/sync-products`),
    onSuccess: () => {
      toast.success(i18n.t('gamePage.toasts.productsSynced'))
      invalidate(gameId)
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      void queryClient.invalidateQueries({ queryKey: ['products-by-game', gameId] })
      onDone?.()
    },
    onError: (err) => toast.error(serverMessage(err) || i18n.t('gamePage.toasts.syncError')),
  })
}

/** Imports the provider's game catalogue (POST /games/init-provider). */
export function useInitGamesFromProvider(onDone?: () => void) {
  const invalidate = useInvalidateGame()
  return useMutation({
    mutationFn: () => api.post('/games/init-provider'),
    onSuccess: () => {
      toast.success(i18n.t('gamePage.toasts.gamesSynced'))
      invalidate()
      onDone?.()
    },
    onError: (err) => toast.error(serverMessage(err) || i18n.t('gamePage.toasts.syncError')),
  })
}

export function useGetGameNames(enabled = true) {
  return useQuery<GameNames[]>({
    queryKey: ['game-names'],
    queryFn: async () => {
      const res = await api.get('/games/names')
      return res.data.data
    },
    enabled,
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
