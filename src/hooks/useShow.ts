import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import { api } from '@/api/axios'
import { apiErrorMessage } from '@/lib/api-error'
import type {
  CreateShowPayload,
  GetShowsParams,
  ShowDetailResponse,
  ShowListResponse,
  ShowMessageResponse,
  ShowReorderItem,
  UpdateShowPayload,
} from '@/types/show'

/**
 * Prefiks kunci cache modul Show. Kunci daftar selalu membawa parameter
 * paginasi, jadi invalidasi memakai prefiks ini supaya seluruh halaman ikut
 * disegarkan setelah mutasi — bukan hanya halaman yang sedang dilihat.
 */
const SHOWS_KEY = ['shows'] as const

export const showsQueryKey = ({ page, limit, search }: Required<GetShowsParams>) =>
  [...SHOWS_KEY, page, limit, search] as const

/**
 * Daftar show untuk admin. Pembacaan pasif tidak menerbitkan toast: halaman
 * sudah punya skeleton dan blok galatnya sendiri, dan toast sukses untuk aksi
 * yang tidak diminta pengguna hanya melatih admin mengabaikan toast.
 */
export function useGetShows(params: GetShowsParams = {}) {
  const { page = 1, limit = 25, search = '' } = params
  const trimmedSearch = search.trim()

  return useQuery<ShowListResponse>({
    queryKey: showsQueryKey({ page, limit, search: trimmedSearch }),
    queryFn: async ({ signal }) => {
      const res = await api.get('/shows/admin', {
        signal,
        params: {
          page,
          limit,
          ...(trimmedSearch !== '' && { search: trimmedSearch }),
        },
      })
      return res.data
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })
}

/** Detail satu show untuk kebutuhan admin (tidak disaring `is_show`). */
export function useGetShowById(id: string) {
  return useQuery<ShowDetailResponse>({
    queryKey: [...SHOWS_KEY, 'detail', id],
    queryFn: async ({ signal }) => {
      const res = await api.get(`/shows/admin/${id}`, { signal })
      return res.data
    },
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useCreateShow() {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateShowPayload): Promise<ShowDetailResponse> => {
      const res = await api.post('/shows', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOWS_KEY })
      toast.success(t('showToasts.createSuccess'))
    },
    onError: (err: unknown) => toast.error(apiErrorMessage(err, t('showToasts.createError'))),
  })
}

export function useUpdateShow(id: string) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateShowPayload): Promise<ShowDetailResponse> => {
      const res = await api.put(`/shows/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOWS_KEY })
      toast.success(t('showToasts.updateSuccess'))
    },
    onError: (err: unknown) => toast.error(apiErrorMessage(err, t('showToasts.updateError'))),
  })
}

/**
 * Id diterima saat `mutate`, bukan saat memanggil hook: tabel merender satu
 * baris per show, dan hook per baris berarti satu instance mutation per baris.
 */
export function useDeleteShow() {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<ShowMessageResponse> => {
      const res = await api.delete(`/shows/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOWS_KEY })
      toast.success(t('showToasts.deleteSuccess'))
    },
    onError: (err: unknown) => toast.error(apiErrorMessage(err, t('showToasts.deleteError'))),
  })
}

/**
 * PUT /shows/:id/games bersemantik ganti-semua: daftar yang dikirim menjadi
 * keanggotaan baru show, dan daftar kosong mengosongkan etalase.
 */
export function useSetShowGames(showId: string) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (gameIds: string[]): Promise<ShowDetailResponse> => {
      const res = await api.put(`/shows/${showId}/games`, { game_ids: gameIds })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOWS_KEY })
      toast.success(t('showToasts.addGamesSuccess'))
    },
    onError: (err: unknown) => toast.error(apiErrorMessage(err, t('showToasts.addGamesError'))),
  })
}

/** Melepas sebagian game dari show tanpa menyentuh anggota lainnya. */
export function useRemoveShowGames(showId: string) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (gameIds: string[]): Promise<ShowDetailResponse> => {
      const res = await api.delete(`/shows/${showId}/games`, {
        data: { game_ids: gameIds },
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOWS_KEY })
      toast.success(t('showToasts.removeGamesSuccess'))
    },
    onError: (err: unknown) => toast.error(apiErrorMessage(err, t('showToasts.removeGamesError'))),
  })
}

/** Menyimpan urutan tampil beberapa show sekaligus dalam satu transaksi. */
export function useReorderShows() {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (items: ShowReorderItem[]): Promise<ShowMessageResponse> => {
      const res = await api.put('/shows/reorder', { items })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOWS_KEY })
      toast.success(t('showToasts.reorderSuccess'))
    },
    onError: (err: unknown) => toast.error(apiErrorMessage(err, t('showToasts.reorderError'))),
  })
}
