import { api } from '@/api/axios'
import type { CategoryResponse } from '@/types/category'
import { useQuery } from '@tanstack/react-query'

// Get All Categories
export const useGetCategories = () =>
  useQuery<CategoryResponse>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories')
      return res.data
    },
  })
