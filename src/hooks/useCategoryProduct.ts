import { api } from '@/api/axios'
import type { PaginationMeta } from '@/types/game'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export type categoryProductPayload = {
  name: string
  game_id: string
  slug: string
  icon_url: string
  description: string
  is_active: boolean
}

export type updateCategoryProductPayload = {
  name: string
}
export type ProductResponseOnly = {
  id: string
  game_id: string
  name: string
  sku: string
  image: string
  description: string
  product_type: string
  selling_price: number
  stock_quantity: number
  is_unlimited_stock: boolean
  is_active: boolean
  meta_data: Record<string, unknown>
  sort_order: number
  created_at: string
  updated_at: string
}

export type CategoryProduct = {
  id: string
  name: string
  game_id: string
  game_name: string
  slug: string
  icon_url: string
  description: string
  is_active: boolean | null
  product: ProductResponseOnly[]
}

export interface CategoryProductResponse {
  data: CategoryProduct[]
  message: string
  meta: PaginationMeta
  status: string
}
export const useGetCategoryProduct = (page: number, limit: number) =>
  useQuery<CategoryProductResponse>({
    queryKey: ['categories-product', page, limit],
    queryFn: async () => {
      const res = await api.get('/category-product', {
        params: {
          page,
          limit,
        },
      })
      return res.data
    },
  })

export const useCreateCategoryProduct = (
  reset: () => void,
  setPreview: (url: string | null) => void,
  setOpen: (open: boolean) => void
) => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (payload: categoryProductPayload) => {
      const res = await api.post('/category-product', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('categoryProductToasts.createSuccess'))
      queryClient.invalidateQueries({ queryKey: ['categories-product'] })
      reset()
      setPreview(null)
      setOpen(false)
    },
    onError: () => {
      toast.error(t('categoryProductToasts.createError'))
    },
  })

  return mutation
}

export const useUpdateCategoryProduct = (
  id: string,
  reset: () => void,
  setOpen: (open: boolean) => void
) => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (payload: updateCategoryProductPayload) => {
      const res = await api.patch(`/category-product/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('categoryProductToasts.updateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['categories-product'] })
      reset()
      setOpen(false)
    },
    onError: () => {
      toast.error(t('categoryProductToasts.updateError'))
    },
  })

  return mutation
}

export function useDeleteCategoryProduct(id: string) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = api.delete(`/category-product/${id}`)
      return res
    },
    onSuccess: () => {
      toast.success(t('categoryProductToasts.deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['categories-product'] })
    },
    onError: () => {
      toast.error(t('categoryProductToasts.deleteError'))
    },
  })

  return mutation
}

export function useAddProductToCategoryProduct(categoryProduct: string) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (product_ids: string[]) =>
      api.patch(`/category-product/add-product/${categoryProduct}`, {
        product_ids: product_ids,
      }),
    onSuccess: () => {
      toast.success(t('categoryProductToasts.addProductsSuccess'))
      queryClient.invalidateQueries({ queryKey: ['categories-product'] })
    },
    onError: () => {
      toast.error(t('categoryProductToasts.addProductsError'))
    },
  })
}
