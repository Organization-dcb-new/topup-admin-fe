import { api } from '@/api/axios'
import type { ProductResponse } from '@/types/product'
import { useQuery } from '@tanstack/react-query'

export const useGetProducts = (page: number, limit: number, search: string, isActive: boolean) => {
  return useQuery({
    queryKey: ['products', page, limit, search, isActive],
    queryFn: async (): Promise<ProductResponse> => {
      const res = await api.get('/products', {
        params: {
          page: page,
          limit: limit,
          search: search,
          is_active: isActive ? true : undefined,
        },
      })
      return res.data
    },
  })
}
