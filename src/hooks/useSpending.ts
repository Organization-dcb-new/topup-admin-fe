import { api } from '@/api/axios'
import type { ApiSpendingResponse } from '@/types/spending'
import { useQuery } from '@tanstack/react-query'

export const useGetSpending = (page: number, limit: number) =>
  useQuery<ApiSpendingResponse>({
    queryKey: ['spending', page, limit],
    queryFn: async () => {
      const res = await api.get('/spending', {
        params: {
          page,
          limit,
        },
      })
      return res.data
    },
  })
