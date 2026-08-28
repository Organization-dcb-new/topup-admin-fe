import { api } from '@/api/axios'
import { apiErrorMessage } from '@/lib/api-error'
import type { PaginationMeta } from '@/types/game'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

/**
 * Sengaja seluruhnya opsional: dialog ubah hanya mengirim kolom yang benar-benar
 * disunting admin. Bentuk ini benar terhadap backend lama (yang cuma membaca
 * `name`) maupun backend baru yang menerima slug, ikon, deskripsi, dan status.
 */
export type updateCategoryProductPayload = {
  name?: string
  slug?: string
  icon_url?: string
  description?: string
  is_active?: boolean
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
  is_active: boolean
  product: ProductResponseOnly[]
}

export interface CategoryProductResponse {
  data: CategoryProduct[]
  message: string
  meta: PaginationMeta
  status: string
}
/**
 * Daftar kategori produk untuk admin.
 *
 * `signal` diteruskan ke axios supaya permintaan halaman lama ikut dibatalkan
 * saat admin menekan next beberapa kali beruntun. `placeholderData` menahan
 * baris halaman sebelumnya selama halaman baru dimuat sehingga tabel dan
 * paginasi tidak berkedip kosong di tiap langkah halaman.
 */
export const useGetCategoryProduct = (page: number, limit: number) =>
  useQuery<CategoryProductResponse>({
    queryKey: ['categories-product', page, limit],
    queryFn: async ({ signal }) => {
      const res = await api.get('/category-product', {
        signal,
        params: {
          page,
          limit,
        },
      })
      return res.data
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
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
    // Galat axios jangan dibuang: batas laju dan penolakan backend punya pesan
    // sendiri yang perlu dilihat operator, bukan kalimat umum "gagal menghapus".
    onError: (err) => {
      toast.error(apiErrorMessage(err, t('categoryProductToasts.deleteError')))
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
