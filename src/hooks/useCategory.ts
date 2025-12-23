import { api } from '@/api/axios'
import type { CategoryResponse } from '@/types/category'
import { useQuery } from '@tanstack/react-query'

export const getCategories = async (): Promise<CategoryResponse> => {
  const res = await api.get('/categories')
  return res.data
}

export const categoryQueryKey = ['categories']

export const useCategories = () => {
  return useQuery({
    queryKey: categoryQueryKey,
    queryFn: getCategories,
  })
}
