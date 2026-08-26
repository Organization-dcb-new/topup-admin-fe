import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import type { ReactNode } from 'react'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AddGamesToShowButton } from '@/components/Show/AddGameToShowModal'
import { api } from '@/api/axios'
import i18n from '@/i18n'
import type { ShowGame } from '@/types/show'

vi.mock('@/api/axios', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

const mockApi = vi.mocked(api)

/**
 * Sebagian teks dialog ini belum punya padanan di berkas locale (langkah
 * rekonsiliasi i18n dikerjakan terpisah). Teks uji dipasang di sini supaya
 * asersi menguji parameter yang dikirim komponen — bukan menunggu kata-kata
 * final, dan tetap hijau setelah locale diisi.
 */
beforeAll(() => {
  i18n.addResourceBundle(
    'en',
    'common',
    {
      addGamesModal: {
        descriptionReplace: 'The list you save replaces the current members.',
        summaryAdd: '{{total}} added',
        summaryRemove: '{{total}} removed',
        moveWarning: 'Games may also belong to other shows.',
        clearWarning: 'This empties the show.',
        clearConfirmPrompt: 'Save an empty show?',
        clearConfirm: 'Yes, empty it',
        currentMember: 'Member',
        loadError: 'Failed to load games',
        retry: 'Retry',
      },
    },
    true,
    true,
  )
})

const t = i18n.getFixedT('en', 'common')

const gameNames = [
  { id: 'g-1', name: 'Free Fire' },
  { id: 'g-2', name: 'Mobile Legends' },
  { id: 'g-3', name: 'Genshin Impact' },
]

const member = (id: string, name: string): ShowGame => ({
  id,
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  code: id.toUpperCase(),
  thumbnail_url: '',
  banner_url: '',
  popularity_score: 0,
  is_active: true,
  is_featured: false,
  is_show: true,
})

const existing = [member('g-1', 'Free Fire'), member('g-2', 'Mobile Legends')]

const detailResponse = {
  status: 'success',
  message: 'show games updated',
  data: {
    id: 'show-1',
    name: 'Etalase Utama',
    alias: 'etalase-utama',
    image: 'https://cdn.example.com/show.png',
    is_hot: false,
    is_new: false,
    is_popular: false,
    is_show: true,
    sort_order: 0,
    visible_game_count: 1,
    games: [],
  },
}

const renderButton = (games: ShowGame[] | undefined = existing) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return render(<AddGamesToShowButton showId='show-1' existingGames={games} />, {
    wrapper: Wrapper,
  })
}

const openDialog = async () => {
  fireEvent.click(screen.getByRole('button', { name: t('addGamesModal.triggerAria') }))
  return screen.findByRole('alertdialog')
}

const gameCheckbox = (name: string) =>
  screen.getByRole('checkbox', { name: t('addGamesModal.selectGameAria', { name }) })

describe('AddGamesToShowButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.get.mockResolvedValue({ data: { data: gameNames } })
    mockApi.put.mockResolvedValue({ data: detailResponse })
  })

  // Komponen ini dirender satu kali per baris tabel; menarik katalog game
  // secara eager berarti membuka halaman Show ikut menarik seluruh katalog.
  it('tidak menarik daftar game sebelum dialog dibuka', async () => {
    renderButton()
    expect(mockApi.get).not.toHaveBeenCalled()

    await openDialog()
    await waitFor(() => expect(mockApi.get).toHaveBeenCalledWith('/games/names', expect.anything()))
  })

  it('mencentang anggota show berdasarkan data server dan menahan simpan tanpa perubahan', async () => {
    renderButton()
    await openDialog()
    await screen.findAllByRole('checkbox')

    expect(gameCheckbox('Free Fire')).toBeChecked()
    expect(gameCheckbox('Mobile Legends')).toBeChecked()
    expect(gameCheckbox('Genshin Impact')).not.toBeChecked()
    expect(screen.getByRole('button', { name: t('addGamesModal.save') })).toBeDisabled()
  })

  it('menandai game yang sudah jadi anggota', async () => {
    renderButton()
    const dialog = await openDialog()
    await screen.findAllByRole('checkbox')

    expect(within(dialog).getAllByText(t('addGamesModal.currentMember'))).toHaveLength(2)
  })

  // Endpoint bersemantik ganti-semua, jadi melepas centang sama dengan mencabut
  // game dari etalase. Ringkasannya harus menghitung dua arah dengan benar.
  it('meringkas berapa game ditambahkan dan berapa dilepas', async () => {
    renderButton()
    await openDialog()
    await screen.findAllByRole('checkbox')

    fireEvent.click(gameCheckbox('Genshin Impact'))
    expect(screen.getByText('1 added')).toBeInTheDocument()
    expect(screen.queryByText(/removed$/)).not.toBeInTheDocument()

    fireEvent.click(gameCheckbox('Free Fire'))
    expect(screen.getByText('1 added')).toBeInTheDocument()
    expect(screen.getByText('1 removed')).toBeInTheDocument()

    fireEvent.click(gameCheckbox('Mobile Legends'))
    expect(screen.getByText('2 removed')).toBeInTheDocument()
  })

  it('mengirim seluruh daftar terpilih, bukan hanya yang baru ditambahkan', async () => {
    renderButton()
    await openDialog()
    await screen.findAllByRole('checkbox')

    fireEvent.click(gameCheckbox('Genshin Impact'))
    fireEvent.click(screen.getByRole('button', { name: t('addGamesModal.save') }))

    await waitFor(() => expect(mockApi.put).toHaveBeenCalledTimes(1))
    expect(mockApi.put).toHaveBeenCalledWith('/shows/show-1/games', {
      game_ids: ['g-1', 'g-2', 'g-3'],
    })
  })

  it('menyaring daftar tanpa mengubah pilihan', async () => {
    renderButton()
    await openDialog()
    await screen.findAllByRole('checkbox')

    fireEvent.click(gameCheckbox('Genshin Impact'))
    fireEvent.change(screen.getByRole('searchbox', { name: t('addGamesModal.searchAria') }), {
      target: { value: 'free' },
    })

    expect(screen.getAllByRole('checkbox')).toHaveLength(1)
    expect(gameCheckbox('Free Fire')).toBeChecked()
    // Pilihan yang tersembunyi oleh filter tetap ikut tersimpan.
    expect(screen.getByText('1 added')).toBeInTheDocument()
  })

  it('menampilkan pesan saat tidak ada yang cocok', async () => {
    renderButton()
    await openDialog()
    await screen.findAllByRole('checkbox')

    fireEvent.change(screen.getByRole('searchbox', { name: t('addGamesModal.searchAria') }), {
      target: { value: 'tidak ada' },
    })
    expect(screen.getByText(t('addGamesModal.noMatch'))).toBeInTheDocument()
  })

  it('menawarkan muat ulang saat daftar game gagal dibaca', async () => {
    mockApi.get.mockRejectedValue({ response: { status: 500, data: {} } })
    renderButton()
    await openDialog()

    expect(await screen.findByRole('alert')).toHaveTextContent(t('addGamesModal.loadError'))

    mockApi.get.mockResolvedValue({ data: { data: gameNames } })
    fireEvent.click(screen.getByRole('button', { name: t('addGamesModal.retry') }))
    expect(await screen.findByRole('checkbox', { name: /Free Fire/ })).toBeInTheDocument()
  })

  /**
   * Inti temuan lama: dialog menutup sebelum PUT selesai, sehingga admin mengira
   * perubahan tersimpan padahal permintaannya masih di jalan (atau gagal).
   */
  it('tidak menutup dialog selama mutasi masih berjalan', async () => {
    let resolvePut: ((value: { data: typeof detailResponse }) => void) | undefined
    mockApi.put.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePut = resolve
        }),
    )

    renderButton()
    await openDialog()
    await screen.findAllByRole('checkbox')

    fireEvent.click(gameCheckbox('Genshin Impact'))
    fireEvent.click(screen.getByRole('button', { name: t('addGamesModal.save') }))

    const saving = await screen.findByRole('button', { name: t('addGamesModal.saving') })
    expect(saving).toBeDisabled()
    expect(screen.getByRole('button', { name: t('addGamesModal.cancel') })).toBeDisabled()

    // Esc pun tidak boleh membatalkan dialog selagi permintaan berjalan.
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()

    await act(async () => {
      resolvePut?.({ data: detailResponse })
    })
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  })

  it('dialog tetap terbuka bila mutasi gagal', async () => {
    mockApi.put.mockRejectedValue({ response: { status: 500, data: {} } })
    renderButton()
    await openDialog()
    await screen.findAllByRole('checkbox')

    fireEvent.click(gameCheckbox('Genshin Impact'))
    fireEvent.click(screen.getByRole('button', { name: t('addGamesModal.save') }))

    await waitFor(() => expect(mockApi.put).toHaveBeenCalled())
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
  })

  it('mengembalikan pilihan ke data server setelah dialog ditutup', async () => {
    renderButton()
    await openDialog()
    await screen.findAllByRole('checkbox')

    fireEvent.click(gameCheckbox('Genshin Impact'))
    fireEvent.click(screen.getByRole('button', { name: t('addGamesModal.cancel') }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())

    await openDialog()
    await screen.findAllByRole('checkbox')
    expect(gameCheckbox('Genshin Impact')).not.toBeChecked()
    expect(screen.getByRole('button', { name: t('addGamesModal.save') })).toBeDisabled()
  })

  // Mengosongkan etalase sah, tapi tidak boleh terjadi hanya karena satu klik.
  it('meminta konfirmasi kedua sebelum mengosongkan etalase', async () => {
    renderButton()
    await openDialog()
    await screen.findAllByRole('checkbox')

    fireEvent.click(gameCheckbox('Free Fire'))
    fireEvent.click(gameCheckbox('Mobile Legends'))
    expect(screen.getByRole('alert')).toHaveTextContent(t('addGamesModal.clearWarning'))

    fireEvent.click(screen.getByRole('button', { name: t('addGamesModal.save') }))
    expect(mockApi.put).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(t('addGamesModal.clearConfirmPrompt'))

    fireEvent.click(screen.getByRole('button', { name: t('addGamesModal.clearConfirm') }))
    await waitFor(() => expect(mockApi.put).toHaveBeenCalledTimes(1))
    expect(mockApi.put).toHaveBeenCalledWith('/shows/show-1/games', { game_ids: [] })
  })

  it('show tanpa anggota mulai dari daftar kosong dan tidak menuntut konfirmasi kedua', async () => {
    renderButton([])
    await openDialog()
    await screen.findAllByRole('checkbox')

    expect(screen.queryByText(t('addGamesModal.clearWarning'))).not.toBeInTheDocument()

    fireEvent.click(gameCheckbox('Free Fire'))
    fireEvent.click(screen.getByRole('button', { name: t('addGamesModal.save') }))

    await waitFor(() => expect(mockApi.put).toHaveBeenCalledTimes(1))
    expect(mockApi.put).toHaveBeenCalledWith('/shows/show-1/games', { game_ids: ['g-1'] })
  })
})
