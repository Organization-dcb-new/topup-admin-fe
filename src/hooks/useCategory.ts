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

export const uploadFile = async (file: File, onProgress?: (progress: number) => void) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await api.post('/upload/new', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (!e.total) return
      const percent = Math.round((e.loaded * 100) / e.total)
      onProgress?.(percent)
    },
  })

  return res.data
}

export const createCategory = async (payload: {
  name: string
  icon_url: string
  description: string
}) => {
  const res = await api.post('/categories', payload)
  return res.data
}

export const deleteCategory = (id: string) => {
  return api.delete(`/categories/${id}`)
}

export const updateCategory = async (
  id: string,
  payload: {
    name: string
    slug: string
    icon_url: string
    description?: string
  }
) => {
  const res = await api.put(`/categories/${id}`, payload)

  return res.data
}
