import { api } from '@/api/axios'
import type { GamesResponse } from '@/types/game'
import { useQuery } from '@tanstack/react-query'

// Use Get Games
export const useGetGames = () =>
  useQuery<GamesResponse>({
    queryKey: ['games'],
    queryFn: async () => {
      const res = await api.get('/games')
      return res.data
    },
  })
