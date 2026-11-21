import { api } from '@/api/axios'
import i18n from '@/i18n'
import type {
  GameByIDResponse,
  GameCreateRequest,
  GameImageRequest,
  GamesResponse,
  GameStatus,
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
  status?: GameStatus
  game_id?: string
}

export const gamesQueryKey = ['games'] as const

/** Backend error text, for the few messages the forms map onto a field. */
export function gameServerMessage(err: unknown) {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message
}

const serverMessage = gameServerMessage

export function useGetGames(page: number, limit: number, params: GetGamesParams = {}) {
  const { search = '', image = 'all', status, game_id } = params
  return useQuery<GamesResponse>({
    queryKey: [...gamesQueryKey, page, limit, search, image, status ?? 'all', game_id ?? ''],
    queryFn: async () => {
      const { data } = await api.get('/games/pagination', {
        params: {
          page,
          limit,
          image,
          // The backend pastes the search into its ORDER BY unescaped, so a quote breaks the query.
          // `_` is LIKE's one-character wildcard: it still matches the quote in the name filter.
          ...(search.trim() && { search: search.trim().replace(/'/g, '_') }),
          ...(status && { status }),
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
    // The backend answers a missing game with a 500, which retrying won't change.
    retry: (failures, err) => gameServerMessage(err) !== 'Game Not Found' && failures < 3,
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
      // Shows list their games, so a status change shows up there too.
      if (payload.status !== undefined) void queryClient.invalidateQueries({ queryKey: ['shows'] })
      onDone?.()
    },
    onError: (err) => toast.error(serverMessage(err) || i18n.t('gamePage.toasts.updateError')),
  })
}

/** PATCH /games/status/:id: one status sets both whether the game is listed and whether it sells. */
export function useSetGameStatus(id: string) {
  const invalidate = useInvalidateGame()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: GameStatus) => api.patch(`/games/status/${id}`, { status }),
    onSuccess: (_res, status) => {
      toast.success(i18n.t(`gamePage.toasts.status.${status}`))
      invalidate(id)
      // Shows list only listed games.
      void queryClient.invalidateQueries({ queryKey: ['shows'] })
    },
    onError: (err) => toast.error(serverMessage(err) || i18n.t('gamePage.toasts.statusError')),
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

/**
 * DELETE /games/:id archives the game: it goes HIDDEN and keeps its products, orders and shows.
 * Setting another status brings it back.
 */
export function useArchiveGame(onDone?: () => void) {
  const invalidate = useInvalidateGame()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/games/${id}`),
    onSuccess: (_res, id) => {
      toast.success(i18n.t('gamePage.toasts.archived'))
      invalidate(id)
      void queryClient.invalidateQueries({ queryKey: ['shows'] })
      onDone?.()
    },
    onError: (err) => toast.error(serverMessage(err) || i18n.t('gamePage.toasts.archiveError')),
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

/** The backend sends `data: null` when there are no games, and a `= []` default only covers undefined. */
async function fetchGameNames(): Promise<GameNames[]> {
  const res = await api.get('/games/names')
  const raw = res.data?.data
  return Array.isArray(raw) ? raw : []
}

export function useGetGameNames(enabled = true) {
  return useQuery<GameNames[]>({
    queryKey: ['game-names'],
    queryFn: fetchGameNames,
    enabled,
  })
}

export function useGetGameNamesWithType() {
  return useQuery<GameNames[]>({
    queryKey: ['game-names'],
    queryFn: fetchGameNames,
  })
}
