import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertCircle,
  CheckCircle2,
  Clapperboard,
  EyeOff,
  Gamepad2,
  Loader2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'

import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { EmptyState, TableSkeleton } from '@/components/Layout/table-states'
import { CreateShowModal } from '@/components/Show/CreateShowModal'
import { Can } from '@/components/Auth/Can'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog'
import { Input } from '@/components/ui/input'
import { PERM } from '@/constants/permissions'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetShows, useRemoveShowGames } from '@/hooks/useShow'
import { cn } from '@/lib/utils'
import { getShowColumns } from '@/tables/table-show'
import type { Show } from '@/types/show'

const PAGE_SIZE = 25

/**
 * Panel daftar game milik satu show.
 *
 * DataTable memasang sub-row secara kondisional, jadi panel ini selalu masuk
 * dalam keadaan baru. Transisi grid-rows 0fr→1fr dinyalakan satu frame setelah
 * mount supaya baris di bawahnya terdorong turun secara bertahap, bukan dalam
 * satu lompatan. Arah tutup tidak bisa dianimasikan dari sini karena penghapusan
 * node terjadi di table-data.tsx (dipakai banyak halaman).
 */
function ShowGamesPanel({ show }: { show: Show }) {
  const { t } = useTranslation('common')
  const [entered, setEntered] = useState(false)
  const removeGames = useRemoveShowGames(show.id)
  const games = show.games ?? []

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
        entered ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      )}
    >
      <div className='overflow-hidden'>
        {/* Lebarnya dibatasi supaya isi panel tidak ikut menentukan lebar
            max-content tabel (table-data.tsx merender <table class="min-w-max">),
            yang dulu membuat kolom bergeser tiap kali baris dibuka. */}
        <div className='w-[min(100%,72rem)] max-w-full rounded-xl border border-border bg-transparent px-5 py-4'>
          <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
            <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              {t('showPage.subRowGamesTitle')}
            </p>
            {games.length > 0 && (
              <p className='text-xs tabular-nums text-muted-foreground'>
                {t('showPage.subRowVisibleCount', {
                  visible: show.visible_game_count,
                  total: games.length,
                })}
              </p>
            )}
          </div>

          {games.length ? (
            <div className='grid gap-3 grid-cols-[repeat(auto-fill,minmax(12rem,16rem))] *:min-w-0'>
              {games.map((game) => (
                <div
                  key={game.id}
                  className='flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2 transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 motion-reduce:transition-none'
                >
                  <span
                    className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'
                    aria-hidden
                  >
                    <Gamepad2 className='h-4 w-4' />
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-xs font-semibold text-foreground'>{game.name}</p>
                    {game.slug && (
                      <p className='truncate text-xs text-muted-foreground'>/{game.slug}</p>
                    )}
                    {!game.is_show && (
                      <Badge variant='secondary' className='mt-1 gap-1'>
                        <EyeOff aria-hidden />
                        {t('showPage.subRowGameHidden')}
                      </Badge>
                    )}
                  </div>
                  <Can perm={PERM.SHOW_UPDATE}>
                    <ConfirmDeleteDialog
                      name={game.name}
                      title={t('showPage.removeGameTitle')}
                      description={t('showPage.removeGameDescription', { show: show.name })}
                      triggerAriaLabel={t('showPage.removeGameAria', { name: game.name })}
                      isPending={removeGames.isPending && removeGames.variables?.[0] === game.id}
                      onConfirm={(done) => removeGames.mutate([game.id], { onSuccess: done })}
                    />
                  </Can>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-xs italic text-muted-foreground'>{t('showPage.subRowNoGames')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ShowPage() {
  const { t } = useTranslation('common')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, isError, isSuccess, isFetching, isPlaceholderData, refetch } =
    useGetShows({ page, limit: PAGE_SIZE, search: debouncedSearch })

  const rows = data?.data ?? []
  const total = data?.meta?.total ?? rows.length
  const totalPage = data?.meta?.total_pages ?? 1
  const showColumns = useMemo(() => getShowColumns(t), [t])

  // Kata kunci baru selalu dibaca dari halaman pertama; tanpa ini pencarian
  // yang dijalankan dari halaman 3 membalas daftar kosong padahal ada hasil.
  const [lastSearch, setLastSearch] = useState(debouncedSearch)
  if (debouncedSearch !== lastSearch) {
    setLastSearch(debouncedSearch)
    setPage(1)
  }

  // Menghapus baris terakhir sebuah halaman membuat `page` menunjuk halaman
  // yang sudah tidak ada. Dijepit saat render, bukan lewat useEffect, supaya
  // tidak ada render antara dengan nomor halaman yang sudah usang.
  const [lastTotalPage, setLastTotalPage] = useState(totalPage)
  if (isSuccess && totalPage !== lastTotalPage) {
    setLastTotalPage(totalPage)
    if (page > totalPage) setPage(totalPage)
  }

  const emptyMessage = debouncedSearch.trim() ? (
    <EmptyState
      message={t('showPage.searchNoMatch')}
      action={
        <Button type='button' variant='outline' size='sm' onClick={() => setSearch('')}>
          {t('showPage.searchClear')}
        </Button>
      }
    />
  ) : (
    <EmptyState
      message={t('showPage.emptyPage')}
      action={
        <Can perm={PERM.SHOW_CREATE}>
          <CreateShowModal />
        </Can>
      }
    />
  )

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex gap-3'>
            <span
              className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'
              aria-hidden
            >
              <Clapperboard className='h-5 w-5' />
            </span>
            <div className='min-w-0 space-y-1'>
              <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
                {t('showPage.title')}
              </h1>
              <p className='text-sm text-muted-foreground'>{t('showPage.subtitle')}</p>
            </div>
          </div>
          <div className='flex flex-col items-end gap-1 sm:text-right'>
            {isLoading && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Loader2
                  className='h-4 w-4 shrink-0 animate-spin text-primary motion-reduce:animate-none'
                  aria-hidden
                />
                {t('showPage.loadingShort')}
              </p>
            )}
            {isError && (
              <p className='flex items-center gap-2 text-sm font-medium text-destructive'>
                <AlertCircle className='h-4 w-4 shrink-0' aria-hidden />
                {t('showPage.loadFailedShort')}
              </p>
            )}
            {isSuccess && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <CheckCircle2 className='h-4 w-4 shrink-0 text-emerald-600' aria-hidden />
                <span className='tabular-nums text-foreground'>
                  {t('showPage.totalShows', { count: total })}
                </span>
              </p>
            )}
          </div>
        </header>

        <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          <div className='flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
            <div className='min-w-0 space-y-0.5'>
              <h2 className='text-sm font-semibold text-foreground'>{t('showPage.listTitle')}</h2>
              <p className='text-xs text-muted-foreground'>{t('showPage.listHint')}</p>
            </div>
            <Can perm={PERM.SHOW_CREATE}>
              <CreateShowModal />
            </Can>
          </div>

          <div className='p-3 sm:p-4'>
            <div className='relative mb-3 w-full sm:max-w-xs'>
              <Search
                className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground'
                aria-hidden
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('showPage.searchPlaceholder')}
                aria-label={t('showPage.searchAria')}
                className='pl-9 pr-9'
              />
              {search && (
                <button
                  type='button'
                  onClick={() => setSearch('')}
                  aria-label={t('showPage.searchClear')}
                  className='absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none'
                >
                  <X className='h-4 w-4' aria-hidden />
                </button>
              )}
            </div>

            {isLoading && (
              <div role='status' aria-busy='true' aria-live='polite'>
                <span className='sr-only'>{t('showPage.tableLoadingTitle')}</span>
                <TableSkeleton />
              </div>
            )}

            {isError && (
              <div
                role='alert'
                className='flex flex-col items-center gap-3 px-4 py-12 text-center'
              >
                <p className='text-sm text-destructive'>{t('showPage.loadErrorDetail')}</p>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='gap-2'
                  onClick={() => void refetch()}
                  disabled={isFetching}
                >
                  <RefreshCw className='h-3.5 w-3.5' aria-hidden />
                  {t('common.refresh')}
                </Button>
              </div>
            )}

            {isSuccess && (
              <>
                {/* Baris halaman sebelumnya sengaja dipertahankan selama halaman
                    baru dimuat; peredupan inilah satu-satunya penanda bahwa
                    datanya belum yang terbaru. */}
                <div
                  aria-busy={isPlaceholderData}
                  inert={isPlaceholderData}
                  className={cn(
                    'transition-opacity duration-200 motion-reduce:transition-none',
                    isPlaceholderData && 'opacity-60',
                  )}
                >
                  <DataTable
                    columns={showColumns}
                    data={rows}
                    getRowId={(row) => row.id}
                    stickyHeader
                    caption={t('showPage.tableCaption', { count: rows.length })}
                    emptyMessage={emptyMessage}
                    renderSubRow={(row) => <ShowGamesPanel show={row} />}
                  />
                </div>

                <Pagination page={page} totalPage={totalPage} onChange={setPage} />
              </>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
