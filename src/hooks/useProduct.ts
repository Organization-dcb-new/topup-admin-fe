import { api } from '@/api/axios'
import type { FormValuesProductImage } from '@/components/Product/Filter/ChangeImage'
import type { FormValuesChangeImageProductV2 } from '@/components/Product/Filter/UploadImage'
import type { Product, ProductResponse } from '@/types/product'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

/** Query list produk admin — selaraskan nama field dengan DTO backend bila perlu. */
export type GetProductsParams = {
  /** Pencarian nama produk (query `search`) */
  search: string;
  sku: string;
  game_name: string;
  /** `true` = aktif, `false` = nonaktif, `undefined` = semua */
  is_active?: boolean;
  /** Query `provider_status` — umumnya `available` / `empty` (BE: TrimSpace). */
  provider_status?: string;
  additional_fee_above?: string;
  additional_fee_below?: string;
  additional_percent_above?: string;
  additional_percent_below?: string;
  base_price_above?: string;
  base_price_below?: string;
  /** Harga dasar tepat (=) */
  base_price?: string;
  selling_price_above?: string;
  selling_price_below?: string;
  /** Harga jual tepat (=) */
  selling_price?: string;
  last_updated_by?: string;
};

function pickNonEmpty(params: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ''),
  )
}

export const useGetProducts = (
  page: number,
  limit: number,
  filters: GetProductsParams,
) => {
  const providerStatus = filters.provider_status?.trim() ?? ''

  const numeric = pickNonEmpty({
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
    queryKey: [
      'products',
      page,
      limit,
      filters.search,
      filters.sku,
      filters.game_name,
      filters.is_active,
      providerStatus,
      filters.last_updated_by,
      numeric,
    ],
    queryFn: async ({ signal }): Promise<ProductResponse> => {
      const res = await api.get('/products/admin', {
        signal,
        params: {
          page,
          limit,
          search: filters.search || undefined,
          sku: filters.sku || undefined,
          game_name: filters.game_name || undefined,
          ...(filters.is_active !== undefined && {
            is_active: filters.is_active,
          }),
          ...(providerStatus && { provider_status: providerStatus }),
          last_updated_by: filters.last_updated_by || undefined,
          ...numeric,
        },
      })
      return res.data
    },
  })
}

export function useUpdateImageProduct(setOpen: (open: boolean) => void) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: FormValuesProductImage) => {
      const payload = {
        ...values,
      }

      const res = await api.patch(`/products/by-game`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('productToasts.imageUpdateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setOpen(false)
    },
    onError: () => toast.error(t('productToasts.imageUpdateError')),
  })

  return mutation
}

export function useUpdateImageProductV2(onClose: () => void) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: FormValuesChangeImageProductV2) => {
      const payload = {
        ...values,
      }

      const res = await api.patch(`/products/by-game`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('productToasts.imageUpdateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['products'] })
      onClose()
    },
    onError: () => toast.error(t('productToasts.imageUpdateError')),
  })

  return mutation
}

/** Satu baris produk pada endpoint `/products/game/:id/available`. */
export type ProductName = {
  id: string
  name: string
  provider_status: string
  price: number
}

/**
 * Daftar produk yang tersedia untuk satu game.
 *
 * `enabled` wajib disebut pemanggil yang merender hook ini per baris tabel:
 * tanpa gerbang itu setiap baris menembak satu permintaan sebelum operator
 * menyentuh apa pun, dan endpointnya dibatasi 30 permintaan per menit.
 * `staleTime` + `refetchOnWindowFocus: false` menahan tembakan ulang saat
 * jendela kembali fokus. Pola yang sama dipakai `useProductsByGame`.
 */
export function useGetProductNames(id: string, enabled = true) {
  return useQuery({
    queryKey: ['product-names', id],
    queryFn: async (): Promise<ProductName[]> => {
      const res = await api.get(`/products/game/${id}/available`)
      const raw = res.data?.data
      return Array.isArray(raw) ? raw : []
    },
    enabled: Boolean(id) && enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}

/** Produk per game — dipakai saat payload game (list/detail) tidak menyertakan `product`. */
export function useProductsByGame(gameId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['products-by-game', gameId],
    queryFn: async (): Promise<Product[]> => {
      const res = await api.get(`/products/game/${gameId}`)
      const raw = res.data?.data
      return Array.isArray(raw) ? raw : []
    },
    enabled: Boolean(gameId && enabled),
    staleTime: 10_000,
  })
}

export function useGetProductAnomaly(page: number, limit: number) {
  return useQuery({
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
  })
}

export function useBulkUpdateAllProductPrice(onSuccessCallback?: () => void) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (additionalPercent: number) => {
      const res = await api.patch('/products/price/bulk-all', {
        additional_percent: additionalPercent,
      })
      return res.data
    },
    onSuccess: () => {
      toast.success(t('gameToasts.bulkAllPriceSuccess'))
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['products-by-game'] })
      onSuccessCallback?.()
    },
    onError: () => toast.error(t('gameToasts.bulkAllPriceError')),
  })
}

