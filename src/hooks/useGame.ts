import { api } from '@/api/axios'
import type { GameByIDResponse, GamesResponse } from '@/types/game'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useGetGames(
  search: string,
  page: number,
  limit: number,
  image: 'all' | 'no_image' = 'all'
) {
  return useQuery<GamesResponse>({
    queryKey: ['games', search, page, limit, image],
    queryFn: async () => {
      const { data } = await api.get('/games/pagination', {
        params: {
          search,
          page,
          limit,
          image,
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
    mutationFn: async (payload: any) => {
      const res = await api.post('/games', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
  })
}

export const useDeleteGame = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/games/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
  })
}

export const useUpdateGame = (id: string) => {
  return useMutation({
    mutationFn: (payload: any) => api.patch(`/games/${id}`, payload),
  })
}
