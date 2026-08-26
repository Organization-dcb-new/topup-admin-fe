import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'

import { DataTable } from '@/components/Layout/table-data'
import i18n from '@/i18n'
import { getShowColumns } from '@/tables/table-show'
import type { Show, ShowGame } from '@/types/show'

/**
 * Kolom aksi dipalsukan: isinya tiga dialog dengan izin dan mutasinya sendiri,
 * sedangkan yang diuji di sini adalah sel-sel data tabel.
 */
vi.mock('@/components/Show/ShowRowActions', () => ({
  ShowActionsHeader: () => <span>Actions</span>,
  ShowRowActions: () => <span data-testid='row-actions' />,
}))

const t = i18n.getFixedT('en', 'common')

const game = (id: string, name: string, isShow: boolean): ShowGame => ({
  id,
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  code: id.toUpperCase(),
  thumbnail_url: '',
  banner_url: '',
  popularity_score: 0,
  is_active: true,
  is_featured: false,
  is_show: isShow,
})

const shown: Show = {
  id: 'show-1',
  name: 'Etalase Utama',
  alias: 'etalase-utama',
  image: 'https://cdn.example.com/utama.png',
  is_hot: true,
  is_new: false,
  is_popular: true,
  is_show: true,
  sort_order: 3,
  visible_game_count: 1,
  games: [game('g-1', 'Free Fire', true), game('g-2', 'Mobile Legends', false)],
}

const hidden: Show = {
  id: 'show-2',
  name: 'Etalase Draft',
  alias: 'etalase-draft',
  image: '',
  is_hot: false,
  is_new: false,
  is_popular: false,
  is_show: false,
  sort_order: 12,
  visible_game_count: 0,
  games: [],
}

const renderTable = (rows: Show[] = [shown, hidden]) =>
  render(
    <DataTable
      columns={getShowColumns(t)}
      data={rows}
      getRowId={(row) => row.id}
      renderSubRow={(row) => <p>panel {row.name}</p>}
    />,
  )

/** Baris data ke-n (baris 0 adalah header). */
const dataRow = (index: number) => screen.getAllByRole('row')[index + 1]

describe('kolom penanda tabel Show', () => {
  it('membedakan show yang tayang dari yang disembunyikan', () => {
    renderTable()

    expect(within(dataRow(0)).getByText(t('showTable.flagShow'))).toBeInTheDocument()
    expect(within(dataRow(0)).queryByText(t('showTable.flagHidden'))).not.toBeInTheDocument()

    expect(within(dataRow(1)).getByText(t('showTable.flagHidden'))).toBeInTheDocument()
    expect(within(dataRow(1)).queryByText(t('showTable.flagShow'))).not.toBeInTheDocument()
  })

  // Hanya penanda yang menyala yang dirender, supaya baris polos tidak penuh
  // chip abu-abu yang tidak berarti apa-apa.
  it('hanya merender penanda yang menyala', () => {
    renderTable()
    const row = dataRow(0)

    expect(within(row).getByText(t('editShowModal.flagHotLabel'))).toBeInTheDocument()
    expect(within(row).getByText(t('editShowModal.flagPopularLabel'))).toBeInTheDocument()
    expect(within(row).queryByText(t('editShowModal.flagNewLabel'))).not.toBeInTheDocument()
  })

  it('baris tanpa penanda hanya menampilkan status tayang', () => {
    renderTable([hidden])
    const row = dataRow(0)

    expect(within(row).queryByText(t('editShowModal.flagHotLabel'))).not.toBeInTheDocument()
    expect(within(row).queryByText(t('editShowModal.flagPopularLabel'))).not.toBeInTheDocument()
  })
})

describe('kolom data lain tabel Show', () => {
  it('menampilkan nama, alias, dan urutan tampil', () => {
    renderTable()
    const row = dataRow(0)

    expect(within(row).getByText('Etalase Utama')).toBeInTheDocument()
    expect(within(row).getByText('etalase-utama')).toBeInTheDocument()
    expect(within(row).getByText('3')).toBeInTheDocument()
  })

  it('memberi alt gambar yang menyebut nama show', () => {
    renderTable([shown])
    expect(
      screen.getByAltText(t('showTable.imageAltName', { name: 'Etalase Utama' })),
    ).toBeInTheDocument()
  })

  it('menyebut jumlah game pada label tombol daftar game', () => {
    renderTable([shown])
    expect(
      screen.getByRole('button', {
        name: t('showTable.ariaGameCount', { name: 'Etalase Utama', total: 2 }),
      }),
    ).toBeInTheDocument()
  })

  it('show tanpa game tidak menawarkan daftar game', () => {
    renderTable([hidden])
    const row = dataRow(0)

    expect(within(row).getByText('0')).toBeInTheDocument()
    expect(within(row).queryByRole('button', { name: /open the list/i })).not.toBeInTheDocument()
  })

  // Game yang disembunyikan tetap anggota show tapi tidak tampil di storefront;
  // bedanya harus terlihat tanpa perlu membuka halaman game.
  it('membedakan game tersembunyi di dalam daftar game', () => {
    renderTable([shown])
    fireEvent.click(
      screen.getByRole('button', {
        name: t('showTable.ariaGameCount', { name: 'Etalase Utama', total: 2 }),
      }),
    )

    const panel = within(screen.getByRole('dialog'))
    expect(panel.getByText(t('showTable.connectedGames', { count: 2 }))).toBeInTheDocument()
    expect(panel.getByText('Free Fire')).toBeInTheDocument()
    expect(panel.getByText('Mobile Legends')).toBeInTheDocument()
    expect(panel.getAllByText(t('showTable.flagHidden'))).toHaveLength(1)
    expect(
      panel.getByText(t('showTable.visibleGamesHint', { visible: 1, total: 2 })),
    ).toBeInTheDocument()
  })
})

describe('baris yang bisa dibuka', () => {
  it('membuka panel daftar game dan menandai keadaannya', () => {
    renderTable([shown])
    const toggle = screen.getByRole('button', {
      name: t('showTable.ariaOpenGameListNamed', { name: 'Etalase Utama' }),
    })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('panel Etalase Utama')).not.toBeInTheDocument()

    fireEvent.click(toggle)
    expect(screen.getByText('panel Etalase Utama')).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: t('showTable.ariaCloseGameListNamed', { name: 'Etalase Utama' }),
      }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('show tanpa game tidak punya tombol buka', () => {
    renderTable([hidden])
    expect(
      screen.queryByRole('button', {
        name: t('showTable.ariaOpenGameListNamed', { name: 'Etalase Draft' }),
      }),
    ).not.toBeInTheDocument()
  })
})
