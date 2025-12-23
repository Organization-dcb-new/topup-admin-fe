import { api } from '@/api/axios'
import type { ProductResponse } from '@/types/product'
import { useQuery } from '@tanstack/react-query'

export const getProducts = async (): Promise<ProductResponse> => {
  const res = await api.get('/products')
  return res.data
}

export const productQueryKey = ['products']

export const useProducts = () => {
  return useQuery({
    queryKey: productQueryKey,
    queryFn: getProducts,
  })
}
