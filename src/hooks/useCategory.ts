import { api } from '@/api/axios'
import type { CategoriesNameResponse, CategoryPayload, CategoryResponse, FormValuesCategory } from '@/types/category'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import slugify from 'slugify'

// Get All Categories
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

// Create Category
export const useCreateCategory = (
  reset: () => void,
  setPreview: (url: string | null) => void,
  setOpen: (open: boolean) => void
) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (payload: CategoryPayload) => {
      const res = await api.post('/categories', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Category created successfully')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      reset()
      setPreview(null)
      setOpen(false)
    },
    onError: () => {
      toast.error('Failed to create category')
    },
  })

  return mutation
}

// Update Category
export function useUpdateCategory(categoryId: string, setOpen: (open: boolean) => void) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: FormValuesCategory) => {
      const payload = {
        ...values,
        slug: slugify(values.name),
      }

      const res = await api.put(`/categories/${categoryId}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Category updated')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setOpen(false)
    },
    onError: () => toast.error('Failed to update category'),
  })

  return mutation
}

export function useDeleteCategory(id: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = api.delete(`/categories/${id}`)
      return res
    },
    onSuccess: () => {
      toast.success('Category deleted')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: () => {
      toast.error('Failed to delete category')
    },
  })

  return mutation
}

export const useGetCategoriesName = () =>
  useQuery<CategoriesNameResponse>({
    queryKey: ['categories-names'],
    queryFn: async () => {
      const res = await api.get('/categories/names')
      return res.data
    },
  })
