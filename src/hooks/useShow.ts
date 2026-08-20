import { api } from '@/api/axios'
import type { ShowPayload } from '@/components/Show/CreateShowModal'
import type { ShowResponse } from '@/types/show'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

const SHOWS_QUERY_KEY = ['shows']

type UpdateShowPayload = {
  name: string
  alias: string
  image: string
  is_hot: boolean
  is_new: boolean
  is_popular: boolean
  is_show: boolean
}

/**
 * Sengaja tanpa toast apa pun. Versi sebelumnya memunculkan toast "memuat"
 * lalu "berhasil dimuat" pada SETIAP kunjungan halaman — dua notifikasi untuk
 * kejadian yang sudah terlihat jelas dari status di header dan tabelnya.
 */
export const useGetShows = () =>
  useQuery<ShowResponse>({
    queryKey: SHOWS_QUERY_KEY,
    queryFn: async () => {
      const res = await api.get('/shows/admin')
      return res.data
    },
  })

export const useCreateShow = (onDone?: () => void) => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ShowPayload) => {
      const res = await api.post('/shows', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('showToasts.createSuccess'))
      queryClient.invalidateQueries({ queryKey: SHOWS_QUERY_KEY })
      onDone?.()
    },
    onError: () => {
      toast.error(t('showToasts.createError'))
    },
  })
}

export function useDeleteShow(id: string, onDone?: () => void) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    /** `await` sebelumnya hilang, jadi kegagalan hapus bisa lolos tanpa terdeteksi. */
    mutationFn: async () => {
      const res = await api.delete(`/shows/${id}`)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('showToasts.deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: SHOWS_QUERY_KEY })
      onDone?.()
    },
    onError: () => {
      toast.error(t('showToasts.deleteError'))
    },
  })
}

export function useAddGamesToShow(showId: string, onDone?: () => void) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (gameIds: string[]) => {
      const res = await api.put(`/shows/${showId}/games`, { game_ids: gameIds })
      return res.data
    },
    onSuccess: () => {
      toast.success(t('showToasts.addGamesSuccess'))
      queryClient.invalidateQueries({ queryKey: SHOWS_QUERY_KEY })
      onDone?.()
    },
    onError: () => {
      toast.error(t('showToasts.addGamesError'))
    },
  })
}

interface UpdateShowProps {
  id: string
  setOpen?: (val: boolean) => void
}

export function useUpdateShow({ id, setOpen }: UpdateShowProps) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateShowPayload) => {
      const res = await api.put(`/shows/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('showToasts.updateSuccess'))
      queryClient.invalidateQueries({ queryKey: SHOWS_QUERY_KEY })
      setOpen?.(false)
    },
    onError: () => {
      toast.error(t('showToasts.updateError'))
    },
  })
}
