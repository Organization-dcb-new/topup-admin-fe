import { api } from '@/api/axios'
import i18n from '@/i18n'
import type {
  AvailableGameProduct,
  CategoryProduct,
  CategoryProductCreatePayload,
  CategoryProductListResponse,
} from '@/types/category-product'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export const categoryProductsQueryKey = ['categories-product'] as const

export const useGetCategoryProduct = (page: number, limit: number) =>
  useQuery<CategoryProductListResponse>({
    queryKey: [...categoryProductsQueryKey, page, limit],
    queryFn: async () => {
      const res = await api.get('/category-product', { params: { page, limit } })
      return res.data
    },
    // Keep the current page on screen while the next one loads.
    placeholderData: keepPreviousData,
  })

/** Products of one game that the provider has in stock — the only ones worth putting in a category. */
export const useAvailableProductsByGame = (gameId: string, enabled: boolean) =>
  useQuery<AvailableGameProduct[]>({
    queryKey: ['category-product-available', gameId],
    queryFn: async () => {
      const res = await api.get(`/products/game/${gameId}/available`)
      const raw = res.data?.data
      return Array.isArray(raw) ? raw : []
    },
    enabled: Boolean(gameId && enabled),
    staleTime: 10_000,
  })

/** This endpoint family answers errors as `{ error }`, other routes as `{ message }`. */
export function categoryProductErrorMessage(err: unknown) {
  const data = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
  return data?.error ?? data?.message ?? ''
}

/** Slugs are unique across every game; a clash comes back as a raw database error. */
export function isDuplicateSlugError(err: unknown) {
  return /duplicate|unique/i.test(categoryProductErrorMessage(err))
}

/** Errors are left to the form, which can point a slug clash at the slug field. */
export function useCreateCategoryProduct(onDone?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CategoryProductCreatePayload) => {
      const res = await api.post('/category-product', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(i18n.t('categoryProductPage.toasts.created'))
      void queryClient.invalidateQueries({ queryKey: categoryProductsQueryKey })
      onDone?.()
    },
  })
}

/** The backend only lets the name change after creation. */
export function useRenameCategoryProduct(onDone?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await api.patch(`/category-product/${id}`, { name })
      return res.data
    },
    onSuccess: () => {
      toast.success(i18n.t('categoryProductPage.toasts.renamed'))
      void queryClient.invalidateQueries({ queryKey: categoryProductsQueryKey })
      onDone?.()
    },
    onError: () => toast.error(i18n.t('categoryProductPage.toasts.renameError')),
  })
}

const assignProducts = (categoryId: string, productIds: string[]) =>
  api.patch(`/category-product/add-product/${categoryId}`, { product_ids: productIds })

/** Replaces the category's whole product list; an empty list empties it. */
export function useSetCategoryProducts(onDone?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, productIds }: { categoryId: string; productIds: string[] }) =>
      assignProducts(categoryId, productIds),
    onSuccess: () => {
      toast.success(i18n.t('categoryProductPage.toasts.productsSaved'))
      void queryClient.invalidateQueries({ queryKey: categoryProductsQueryKey })
      onDone?.()
    },
    onError: () => toast.error(i18n.t('categoryProductPage.toasts.productsError')),
  })
}

/**
 * Deleting only removes the category row, so its products would keep pointing at a category
 * that no longer exists. When allowed, empty it first so they come out clean.
 */
export function useDeleteCategoryProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ category, release }: { category: CategoryProduct; release: boolean }) => {
      if (release && category.product?.length) await assignProducts(category.id, [])
      await api.delete(`/category-product/${category.id}`)
    },
    onSuccess: () => {
      toast.success(i18n.t('categoryProductPage.toasts.deleted'))
    },
    onError: () => toast.error(i18n.t('categoryProductPage.toasts.deleteError')),
    // Emptying may have succeeded even if the delete itself failed.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: categoryProductsQueryKey })
    },
  })
}
