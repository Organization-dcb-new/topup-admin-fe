import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import { GameActiveFilter, type GameActiveFilterValue } from '@/components/Games/GameActiveFilter'
import { GamePickerSelect } from '@/components/Games/GamePickerSelect'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGetGameNamesWithType, useGetGames } from '@/hooks/useGame'
import { getGameColumns } from '@/tables/table-game'
import i18n from '@/i18n'
import { Gamepad2, Inbox, Loader2, RefreshCw, RotateCcw, SearchX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function GamePage() {
  const { t } = useTranslation('common')
  const [page, setPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState<GameActiveFilterValue>('all')
  const [gameId, setGameId] = useState('')

  const limit = 20

  const listParams = useMemo(() => {
    const is_active =
      activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined
    return {
      is_active,
      ...(gameId && { game_id: gameId }),
    }
  }, [activeFilter, gameId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sinkron pagination dengan filter
    setPage(1)
  }, [activeFilter, gameId])

  const {
    data,
    isLoading,
    isError,
    isSuccess,
    isFetchedAfterMount,
    refetch,
    isFetching,
  } = useGetGames(page, limit, listParams)

  const { data: gameNameOptions } = useGetGameNamesWithType()

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(t('gameToasts.loadSuccess'))
    }
    if (isError && isFetchedAfterMount) {
      toast.error(t('gameToasts.loadError'))
    }
  }, [isSuccess, isError, isFetchedAfterMount, t])

  const rows = data?.data ?? []

  const columns = useMemo(() => getGameColumns(t), [t])

  const totalRaw = data?.meta?.total_data ?? 0
  const totalFormatted = totalRaw.toLocaleString(
    i18n.language.startsWith('id') ? 'id-ID' : 'en-US',
  )

  const totalPage = data?.meta?.total_page ?? 1
  const rangeFrom = totalRaw === 0 ? 0 : (page - 1) * limit + 1
  const rangeTo = Math.min(page * limit, totalRaw)

  const selectedGameName = gameId ? gameNameOptions?.find((g) => g.id === gameId)?.name : undefined

  const statusLabel =
    activeFilter === 'all'
      ? t('gameFilters.all')
      : activeFilter === 'active'
        ? t('gameFilters.active')
        : t('gameFilters.inactive')

  const hasActiveFilters = activeFilter !== 'all' || Boolean(gameId)
  const isFilteredEmpty = isSuccess && rows.length === 0 && hasActiveFilters
  const isDatabaseEmpty = isSuccess && rows.length === 0 && !hasActiveFilters

  const clearFilters = () => {
    setActiveFilter('all')
    setGameId('')
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Gamepad2 className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t('gamePage.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('gamePage.subtitle')}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10">
          <div className="space-y-4 border-b border-border/80 px-4 py-4 sm:px-5">
            <div className="min-w-0 space-y-1">
              <h2 className="text-sm font-semibold text-foreground">{t('gamePage.listTitle')}</h2>
              <p className="text-xs text-muted-foreground">{t('gamePage.listHint', { limit })}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
                <GamePickerSelect value={gameId} onChange={setGameId} />
                <GameActiveFilter value={activeFilter} onChange={setActiveFilter} />
              </div>
              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 gap-1.5 rounded-lg px-3 text-xs font-medium"
                  onClick={clearFilters}
                  aria-label={t('gamePage.resetFiltersAria')}
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                  {t('gamePage.resetFilters')}
                </Button>
              ) : null}
            </div>

            {isSuccess && (
              <div
                className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1"
                role="status"
                aria-label={t('gamePage.filtersSummaryAria')}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('gamePage.filtersHeading')}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-normal">
                    {t('gamePage.filterStatusChip', { status: statusLabel })}
                  </Badge>
                  {gameId ? (
                    <Badge variant="outline" className="max-w-[min(100%,16rem)] truncate font-normal" title={selectedGameName}>
                      {selectedGameName ?? gameId}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">{t('gamePage.filterGameAll')}</span>
                  )}
                </div>
                <span className="sm:ml-auto tabular-nums text-xs text-muted-foreground">
                  {t('gamePage.totalGames', { count: totalFormatted })}
                </span>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4">
            {isLoading && (
              <div
                className="flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/80 bg-muted/20 py-12"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <Loader2 className="h-11 w-11 animate-spin text-primary" aria-hidden />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">{t('gamePage.tableLoadingTitle')}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t('gamePage.tableLoadingHint')}</p>
                </div>
              </div>
            )}

            {isError && (
              <div className="space-y-4 rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-6 sm:px-6">
                <ErrorComponent message={t('gamePage.loadErrorDetail')} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => void refetch()}
                  disabled={isFetching}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
                    aria-hidden
                  />
                  {t('gamePage.retryList')}
                </Button>
              </div>
            )}

            {isSuccess && rows.length > 0 && (
              <>
                <DataTable columns={columns} data={rows} stickyHeader />
                <div className="mt-4 space-y-3">
                  {(totalRaw > 0 || totalPage > 1) && (
                    <p className="text-center text-xs text-muted-foreground sm:text-sm">
                      <span className="tabular-nums">
                        {t('gamePage.showingRange', {
                          from: rangeFrom.toLocaleString(i18n.language.startsWith('id') ? 'id-ID' : 'en-US'),
                          to: rangeTo.toLocaleString(i18n.language.startsWith('id') ? 'id-ID' : 'en-US'),
                          total: totalFormatted,
                        })}
                      </span>
                      {totalPage > 1 && (
                        <>
                          <span className="mx-1.5 text-border">·</span>
                          <span className="tabular-nums">
                            {t('gamePage.pageOf', { page, totalPage })}
                          </span>
                        </>
                      )}
                    </p>
                  )}
                  <Pagination page={page} totalPage={totalPage} onChange={setPage} />
                </div>
              </>
            )}

            {isFilteredEmpty && (
              <div className="flex min-h-[14rem] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/80 bg-muted/15 px-4 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                  <SearchX className="h-6 w-6" aria-hidden />
                </div>
                <div className="max-w-sm space-y-1">
                  <p className="text-sm font-medium text-foreground">{t('gamePage.emptyFilteredTitle')}</p>
                  <p className="text-xs text-muted-foreground">{t('gamePage.emptyFilteredHint')}</p>
                </div>
                <Button type="button" variant="secondary" size="sm" className="rounded-lg" onClick={clearFilters}>
                  {t('gamePage.resetFilters')}
                </Button>
              </div>
            )}

            {isDatabaseEmpty && (
              <div className="flex min-h-[14rem] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/80 bg-muted/15 px-4 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                  <Inbox className="h-6 w-6" aria-hidden />
                </div>
                <div className="max-w-sm space-y-1">
                  <p className="text-sm font-medium text-foreground">{t('gamePage.emptyDatabaseTitle')}</p>
                  <p className="text-xs text-muted-foreground">{t('gamePage.emptyDatabaseHint')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
