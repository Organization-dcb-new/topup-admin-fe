import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import { api } from '@/api/axios'
import { apiErrorMessage } from '@/lib/api-error'
import type {
  Banner,
  BannerFormValues,
  BannerListResponse,
  BannerReorderItem,
} from '@/types/banner'

const LIST_KEY = ['banners'] as const

/** Kolom jadwal kosong berarti "tanpa batas". Backend menyimpannya sebagai
 *  NULL, jadi string kosong tidak boleh dikirim apa adanya. */
const toPayload = (values: BannerFormValues) => ({
  title: values.title,
  image: values.image,
  alt_text: values.alt_text,
  redirect_link: values.redirect_link,
  is_active: values.is_active,
  start_at: values.start_at === '' ? null : values.start_at,
  end_at: values.end_at === '' ? null : values.end_at,
})

/**
 * Daftar banner untuk admin — semua baris, termasuk yang nonaktif.
 * Sengaja tanpa toast: setiap mutasi memicu invalidate, dan versi lama
 * menampilkan toast memuat plus toast sukses di tiap pemuatan ulang. Status
 * pemuatan dan galat ditampilkan inline oleh halaman.
 */
export const useGetBanners = () =>
  useQuery({
    queryKey: LIST_KEY,
    queryFn: async ({ signal }): Promise<BannerListResponse> => {
      const res = await api.get('/banners/admin', { signal })
      return res.data
    },
  })

export const useCreateBanner = () => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: BannerFormValues) => {
      const res = await api.post('/banners', toPayload(values))
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY })
      toast.success(t('bannerToasts.createSuccess'))
    },
    onError: (err: unknown) =>
      toast.error(apiErrorMessage(err, t('bannerToasts.createError'))),
  })
}

export const useUpdateBanner = (id: string) => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: BannerFormValues) => {
      const res = await api.patch(`/banners/${id}`, toPayload(values))
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY })
      toast.success(t('bannerToasts.updateSuccess'))
    },
    onError: (err: unknown) =>
      toast.error(apiErrorMessage(err, t('bannerToasts.updateError'))),
  })
}

export function useDeleteBanner(id: string) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/banners/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY })
      toast.success(t('bannerToasts.deleteSuccess'))
    },
    onError: (err: unknown) =>
      toast.error(apiErrorMessage(err, t('bannerToasts.deleteError'))),
  })
}

export function useToggleBannerStatus(id: string) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (isActive: boolean) => {
      const res = await api.patch(`/banners/${id}/status`, { is_active: isActive })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY })
      toast.success(t('bannerToasts.statusSuccess'))
    },
    onError: (err: unknown) =>
      toast.error(apiErrorMessage(err, t('bannerToasts.statusError'))),
  })
}

export function useReorderBanners() {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (items: BannerReorderItem[]) => {
      const res = await api.post('/banners/reorder', { items })
      return res.data
    },
    // Tombol naik/turun harus terasa instan: cache disusun ulang lebih dulu,
    // lalu dikembalikan ke snapshot kalau server menolak.
    onMutate: async (items: BannerReorderItem[]) => {
      await queryClient.cancelQueries({ queryKey: LIST_KEY })
      const snapshot = queryClient.getQueryData<BannerListResponse>(LIST_KEY)

      if (snapshot) {
        const order = new Map(items.map((item) => [item.id, item.sort_order]))
        const data: Banner[] = snapshot.data
          .map((banner) => {
            const sortOrder = order.get(banner.id)
            return sortOrder === undefined ? banner : { ...banner, sort_order: sortOrder }
          })
          .sort((a, b) => a.sort_order - b.sort_order)

        queryClient.setQueryData<BannerListResponse>(LIST_KEY, { ...snapshot, data })
      }

      return { snapshot }
    },
    onSuccess: () => {
      toast.success(t('bannerToasts.reorderSuccess'))
    },
    onError: (err: unknown, _items, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData<BannerListResponse>(LIST_KEY, context.snapshot)
      }
      toast.error(apiErrorMessage(err, t('bannerToasts.reorderError')))
    },
    // Urutan final tetap milik server (sort_order bisa dinormalkan di sana).
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY })
    },
  })
}
