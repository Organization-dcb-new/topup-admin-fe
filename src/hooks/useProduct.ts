import { api } from '@/api/axios'
import i18n from '@/i18n'
import type {
  ChangeProductImageByGamePayload,
  ProductListing,
  ProductResponse,
  UpdateProductPricePayload,
} from '@/types/product'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

/** Filters of GET /products/admin; empty strings are left out of the request. */
export type GetProductsParams = {
  /** Matches the product name or its game's name. */
  search: string
  /** Exact SKU. */
  sku: string
  /** Substring of the game name. */
  game_name: string
  /** `true` = active, `false` = inactive, `undefined` = both. */
  is_active?: boolean
  /** Provider stock status, usually `available` or `empty`. */
  provider_status?: string
  additional_fee_above?: string
  additional_fee_below?: string
  additional_percent_above?: string
  additional_percent_below?: string
  base_price_above?: string
  base_price_below?: string
  base_price?: string
  selling_price_above?: string
  selling_price_below?: string
  selling_price?: string
  /** Substring of `last_updated_by`, e.g. `admin`, `process` or `system`. */
  last_updated_by?: string
}

export const productsQueryKey = ['products'] as const

function pickNonEmpty(params: Record<string, string | boolean | undefined>) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
}

export const useGetProducts = (page: number, limit: number, filters: GetProductsParams, enabled = true) => {
  const params = pickNonEmpty({
    search: filters.search.trim(),
    sku: filters.sku.trim(),
    game_name: filters.game_name,
    is_active: filters.is_active,
    provider_status: filters.provider_status?.trim(),
    last_updated_by: filters.last_updated_by,
    additional_fee_above: filters.additional_fee_above,
    additional_fee_below: filters.additional_fee_below,
    additional_percent_above: filters.additional_percent_above,
    additional_percent_below: filters.additional_percent_below,
    base_price_above: filters.base_price_above,
    base_price_below: filters.base_price_below,
    base_price: filters.base_price,
    selling_price_above: filters.selling_price_above,
    selling_price_below: filters.selling_price_below,
    selling_price: filters.selling_price,
  })

  return useQuery({
    queryKey: [...productsQueryKey, page, limit, params],
    queryFn: async (): Promise<ProductResponse> => {
      const res = await api.get('/products/admin', { params: { page, limit, ...params } })
      return res.data
    },
    // Keep the current page on screen while a new filter loads.
    placeholderData: keepPreviousData,
    enabled,
  })
}

/** Price and image changes show up on the product list, the per-game lists and the anomaly page. */
function invalidateProductViews(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: productsQueryKey })
  void queryClient.invalidateQueries({ queryKey: ['products-by-game'] })
  void queryClient.invalidateQueries({ queryKey: ['product-anomaly'] })
}

export function useUpdateProductPrice(onDone?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateProductPricePayload) => api.patch('/products/price', payload),
    onSuccess: () => {
      toast.success(i18n.t('productsPage.toasts.priceSaved'))
      invalidateProductViews(queryClient)
      onDone?.()
    },
    onError: () => toast.error(i18n.t('productsPage.toasts.priceError')),
  })
}

/** Sets the image of every product of a game; the backend has no per-product image endpoint. */
export function useChangeProductImageByGame(onDone?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ChangeProductImageByGamePayload) => api.patch('/products/by-game', payload),
    onSuccess: () => {
      toast.success(i18n.t('productsPage.toasts.imageSaved'))
      invalidateProductViews(queryClient)
      onDone?.()
    },
    onError: () => toast.error(i18n.t('productsPage.toasts.imageError')),
  })
}

export function useGetProductNames(id: string) {
  return useQuery({
    queryKey: ['product-names', id],
    queryFn: async () => {
      const res = await api.get(`/products/game/${id}/available`)
      return res.data.data
    },
  })
}

/** Products of one game — for when a game payload (list/detail) doesn't include `product`. */
export function useProductsByGame(gameId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['products-by-game', gameId],
    queryFn: async (): Promise<ProductListing[]> => {
      const res = await api.get(`/products/game/${gameId}`)
      const raw = res.data?.data
      return Array.isArray(raw) ? raw : []
    },
    enabled: Boolean(gameId && enabled),
    staleTime: 10_000,
  })
}

/** Products sold below their base price (selling_price < base_price). */
export function useGetProductAnomaly(page: number, limit: number) {
  return useQuery<ProductResponse>({
    queryKey: ['product-anomaly', page, limit],
    queryFn: async () => {
      const res = await api.get('/products/anomaly', {
        params: {
          page,
          limit,
        },
      })
      return res.data
    },
    placeholderData: keepPreviousData,
  })
}

export function useBulkUpdateAllProductPrice(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (additionalPercent: number) => {
      const res = await api.patch('/products/price/bulk-all', {
        additional_percent: additionalPercent,
      })
      return res.data
    },
    onSuccess: () => {
      toast.success(i18n.t('productsPage.toasts.bulkAllSaved'))
      invalidateProductViews(queryClient)
      void queryClient.invalidateQueries({ queryKey: ['games'] })
      onSuccessCallback?.()
    },
    onError: () => toast.error(i18n.t('productsPage.toasts.bulkAllError')),
  })
}
