import { api } from '@/api/axios'
import type { ProductResponse } from '@/types/product'
import { useQuery } from '@tanstack/react-query'

export const useGetProducts = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['products', page, limit],
    queryFn: async (): Promise<ProductResponse> => {
      const res = await api.get('/products', {
        params: {
          page: page,
          limit: limit,
        },
      })
      return res.data
    },
  })
}
