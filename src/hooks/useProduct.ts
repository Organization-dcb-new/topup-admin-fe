import { api } from '@/api/axios'
import type { ProductResponse } from '@/types/product'
import { useQuery } from '@tanstack/react-query'

export const useGetProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<ProductResponse> => {
      const res = await api.get('/products')
      return res.data
    },
  })
}
