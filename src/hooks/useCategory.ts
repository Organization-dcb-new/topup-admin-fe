import { api } from '@/api/axios'
import type { CategoriesNameResponse, CategoryResponse } from '@/types/category'
import { useQuery } from '@tanstack/react-query'

/*
 * Game categories. Still read by the game forms, but the backend does not register the
 * /categories routes (CategoryRoutes is missing from InitRoutes), so these return 404 for now.
 */

export const useGetCategories = (page?: number, limit?: number, search?: string) =>
  useQuery<CategoryResponse>({
    queryKey: ['categories', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/categories', {
        params: {
          page,
          limit,
          search,
        },
      })
      return res.data
    },
  })

export const useGetCategoriesName = () =>
  useQuery<CategoriesNameResponse>({
    queryKey: ['categories-names'],
    queryFn: async () => {
      const res = await api.get('/categories/names')
      return res.data
    },
  })
