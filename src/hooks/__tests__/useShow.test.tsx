import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { api } from '@/api/axios'
import i18n from '@/i18n'
import {
  showsQueryKey,
  useCreateShow,
  useDeleteShow,
  useGetShowById,
  useGetShows,
  useRemoveShowGames,
  useReorderShows,
  useSetShowGames,
  useUpdateShow,
} from '@/hooks/useShow'
import type { Show, ShowDetailResponse, ShowListResponse } from '@/types/show'

vi.mock('@/api/axios', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

const mockApi = vi.mocked(api)
const mockToast = vi.mocked(toast)

const show: Show = {
  id: 'show-1',
  name: 'Free Fire',
  alias: 'free-fire',
  image: 'https://cdn.example.com/ff.png',
  is_hot: true,
  is_new: false,
  is_popular: false,
  is_show: true,
  sort_order: 0,
  visible_game_count: 1,
  games: [],
}

const listResponse: ShowListResponse = {
  status: 'success',
  message: 'success',
  data: [show],
  meta: { page: 1, limit: 25, total: 1, total_pages: 1 },
}

const detailResponse: ShowDetailResponse = {
  status: 'success',
  message: 'success',
  data: show,
}

/** Klien baru per uji supaya cache satu uji tidak menjawab uji berikutnya. */
const makeClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

const withClient = (client: QueryClient) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return Wrapper
}

/** Galat axios sebagaimana dilihat `apiErrorMessage`. */
const axiosError = (data: { status?: number; message?: string }) => ({
  response: { status: data.status ?? 400, data: { message: data.message } },
})

describe('showsQueryKey', () => {
  it('membawa parameter paginasi di bawah prefiks "shows"', () => {
    expect(showsQueryKey({ page: 2, limit: 25, search: 'free' })).toEqual([
      'shows',
      2,
      25,
      'free',
    ])
  })
})

describe('useGetShows', () => {
  beforeEach(() => vi.clearAllMocks())

  it('memakai halaman 1 dan limit 25 serta tidak mengirim search kosong', async () => {
    mockApi.get.mockResolvedValue({ data: listResponse })
    const { result } = renderHook(() => useGetShows(), { wrapper: withClient(makeClient()) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const [url, config] = mockApi.get.mock.calls[0]
    expect(url).toBe('/shows/admin')
    expect(config?.params).toEqual({ page: 1, limit: 25 })
    // Permintaan yang ditinggalkan harus bisa dibatalkan react-query.
    expect(config?.signal).toBeInstanceOf(AbortSignal)
    expect(result.current.data?.data).toHaveLength(1)
    expect(result.current.data?.meta.total_pages).toBe(1)
  })

  it('men-trim kata kunci sebelum dikirim dan memakainya sebagai kunci cache', async () => {
    mockApi.get.mockResolvedValue({ data: listResponse })
    const { result } = renderHook(() => useGetShows({ page: 3, limit: 10, search: '  free  ' }), {
      wrapper: withClient(makeClient()),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get.mock.calls[0][1]?.params).toEqual({
      page: 3,
      limit: 10,
      search: 'free',
    })
  })

  it('kata kunci berisi spasi saja diperlakukan sebagai tanpa pencarian', async () => {
    mockApi.get.mockResolvedValue({ data: listResponse })
    const { result } = renderHook(() => useGetShows({ search: '   ' }), {
      wrapper: withClient(makeClient()),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get.mock.calls[0][1]?.params).toEqual({ page: 1, limit: 25 })
  })

  // Pembacaan pasif tidak boleh menerbitkan toast: halaman punya blok galatnya sendiri.
  it('tidak menerbitkan toast apa pun, baik saat sukses maupun gagal', async () => {
    mockApi.get.mockRejectedValue(axiosError({ status: 500, message: 'boom' }))
    const { result } = renderHook(() => useGetShows(), { wrapper: withClient(makeClient()) })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockToast.error).not.toHaveBeenCalled()
    expect(mockToast.success).not.toHaveBeenCalled()
  })
})

describe('useGetShowById', () => {
  beforeEach(() => vi.clearAllMocks())

  it('membaca rute admin yang tidak menyaring is_show', async () => {
    mockApi.get.mockResolvedValue({ data: detailResponse })
    const { result } = renderHook(() => useGetShowById('show-1'), {
      wrapper: withClient(makeClient()),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get.mock.calls[0][0]).toBe('/shows/admin/show-1')
  })

  it('tidak memanggil apa pun selama id belum ada', () => {
    renderHook(() => useGetShowById(''), { wrapper: withClient(makeClient()) })
    expect(mockApi.get).not.toHaveBeenCalled()
  })
})

describe('mutasi Show', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useCreateShow mengirim payload dan mengembalikan promise berisi data respons', async () => {
    mockApi.post.mockResolvedValue({ data: detailResponse })
    const { result } = renderHook(() => useCreateShow(), { wrapper: withClient(makeClient()) })

    const payload = { name: 'Free Fire', alias: 'free-fire', image: 'https://cdn.example.com/ff.png' }
    await expect(result.current.mutateAsync(payload)).resolves.toEqual(detailResponse)
    expect(mockApi.post).toHaveBeenCalledWith('/shows', payload)
    expect(mockToast.success).toHaveBeenCalledTimes(1)
  })

  it('useUpdateShow mengirim hanya field yang diberikan', async () => {
    mockApi.put.mockResolvedValue({ data: detailResponse })
    const { result } = renderHook(() => useUpdateShow('show-1'), {
      wrapper: withClient(makeClient()),
    })

    await result.current.mutateAsync({ is_show: false })
    expect(mockApi.put).toHaveBeenCalledWith('/shows/show-1', { is_show: false })
  })

  // Id datang lewat mutate, bukan lewat pemanggilan hook: tabel merender satu
  // baris per show dan tidak boleh membuat satu mutation per baris.
  it('useDeleteShow menerima id saat mutate', async () => {
    mockApi.delete.mockResolvedValue({ data: { status: 'success', message: 'deleted' } })
    const { result } = renderHook(() => useDeleteShow(), { wrapper: withClient(makeClient()) })

    await result.current.mutateAsync('show-9')
    expect(mockApi.delete).toHaveBeenCalledWith('/shows/show-9')

    await result.current.mutateAsync('show-10')
    expect(mockApi.delete).toHaveBeenLastCalledWith('/shows/show-10')
  })

  it('useSetShowGames mengirim seluruh daftar, termasuk daftar kosong', async () => {
    mockApi.put.mockResolvedValue({ data: detailResponse })
    const { result } = renderHook(() => useSetShowGames('show-1'), {
      wrapper: withClient(makeClient()),
    })

    await expect(result.current.mutateAsync(['g-1', 'g-2'])).resolves.toEqual(detailResponse)
    expect(mockApi.put).toHaveBeenCalledWith('/shows/show-1/games', {
      game_ids: ['g-1', 'g-2'],
    })

    // Mengosongkan etalase adalah aksi sah pada endpoint ganti-semua.
    await result.current.mutateAsync([])
    expect(mockApi.put).toHaveBeenLastCalledWith('/shows/show-1/games', { game_ids: [] })
  })

  it('useRemoveShowGames menaruh daftar di body DELETE', async () => {
    mockApi.delete.mockResolvedValue({ data: detailResponse })
    const { result } = renderHook(() => useRemoveShowGames('show-1'), {
      wrapper: withClient(makeClient()),
    })

    await result.current.mutateAsync(['g-1'])
    expect(mockApi.delete).toHaveBeenCalledWith('/shows/show-1/games', {
      data: { game_ids: ['g-1'] },
    })
  })

  it('useReorderShows mengirim seluruh urutan dalam satu permintaan', async () => {
    mockApi.put.mockResolvedValue({ data: { status: 'success', message: 'ok' } })
    const { result } = renderHook(() => useReorderShows(), { wrapper: withClient(makeClient()) })

    const items = [
      { id: 'show-1', sort_order: 0 },
      { id: 'show-2', sort_order: 1 },
    ]
    await result.current.mutateAsync(items)
    expect(mockApi.put).toHaveBeenCalledWith('/shows/reorder', { items })
  })

  it('menyegarkan seluruh halaman daftar lewat prefiks kunci "shows"', async () => {
    const client = makeClient()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    mockApi.put.mockResolvedValue({ data: detailResponse })

    const { result } = renderHook(() => useUpdateShow('show-1'), { wrapper: withClient(client) })
    await result.current.mutateAsync({ name: 'Free Fire' })

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['shows'] })
  })
})

describe('galat mutasi Show', () => {
  beforeEach(() => vi.clearAllMocks())

  // apiErrorMessage: pesan server yang ada selalu menang atas teks fallback.
  it('menampilkan pesan dari server apa adanya', async () => {
    mockApi.post.mockRejectedValue(axiosError({ message: 'Alias already used' }))
    const { result } = renderHook(() => useCreateShow(), { wrapper: withClient(makeClient()) })

    await expect(result.current.mutateAsync({ name: 'a', alias: 'a', image: 'a' })).rejects.toBeTruthy()
    expect(mockToast.error).toHaveBeenCalledWith('Alias already used')
  })

  it('menerjemahkan rate limit, bukan menampilkan status mentah', async () => {
    mockApi.delete.mockRejectedValue({ response: { status: 429, data: {} } })
    const { result } = renderHook(() => useDeleteShow(), { wrapper: withClient(makeClient()) })

    await expect(result.current.mutateAsync('show-1')).rejects.toBeTruthy()
    expect(mockToast.error).toHaveBeenCalledWith(i18n.t('apiErrors.tooManyRequests'))
  })

  it('memakai pesan cadangan modul saat server tidak mengirim pesan', async () => {
    mockApi.put.mockRejectedValue({ response: { status: 500, data: {} } })
    const { result } = renderHook(() => useSetShowGames('show-1'), {
      wrapper: withClient(makeClient()),
    })

    await expect(result.current.mutateAsync(['g-1'])).rejects.toBeTruthy()
    expect(mockToast.error).toHaveBeenCalledWith(i18n.t('showToasts.addGamesError'))
  })

  it('gagal tidak menerbitkan toast sukses', async () => {
    mockApi.put.mockRejectedValue({ response: { status: 500, data: {} } })
    const { result } = renderHook(() => useReorderShows(), { wrapper: withClient(makeClient()) })

    await expect(result.current.mutateAsync([{ id: 'show-1', sort_order: 0 }])).rejects.toBeTruthy()
    expect(mockToast.success).not.toHaveBeenCalled()
  })
})
