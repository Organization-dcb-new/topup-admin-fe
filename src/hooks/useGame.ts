import { api } from '@/api/axios'
import type { GamesResponse } from '@/types/game'
import { useQuery } from '@tanstack/react-query'

export const getGames = async (): Promise<GamesResponse> => {
  const res = await api.get<GamesResponse>('/games')
  return res.data
}

export const useGames = () => {
  return useQuery({
    queryKey: ['games'],
    queryFn: getGames,
  })
}
