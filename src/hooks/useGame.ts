import { api } from '@/api/axios'
import type { GamesResponse } from '@/types/game'
import { useQuery } from '@tanstack/react-query'

export function useGetGames(search: string, page: number, limit: number) {
  return useQuery<GamesResponse>({
    queryKey: ['games', search, page, limit],
    queryFn: async () => {
      const { data } = await api.get('/games/pagination', {
        params: {
          search,
          page,
          limit,
        },
      })
      return data
    },
    staleTime: 5000,
  })
}
