import { AdminBriefSelect } from '@/components/Admin/AdminBriefSelect'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import { GameActiveFilter, type GameActiveFilterValue } from '@/components/Games/GameActiveFilter'
import { GamePickerSelect } from '@/components/Games/GamePickerSelect'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGetAdminBrief } from '@/hooks/useAdmin'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetGameNamesWithType, useGetGames, type GetGamesParams } from '@/hooks/useGame'
import { getGameColumns } from '@/tables/table-game'
import i18n from '@/i18n'
import { Gamepad2, Inbox, Loader2, RefreshCw, RotateCcw, Search, SearchX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

function datetimeLocalToIso(value: string): string | undefined {
  if (!value.trim()) return undefined
  const ms = new Date(value).getTime()
  if (Number.isNaN(ms)) return undefined
  return new Date(ms).toISOString()
}

type TriBool = 'all' | 'yes' | 'no'

function triToOptionalBool(v: TriBool): boolean | undefined {
  if (v === 'all') return undefined
  return v === 'yes'
}

export default function GamePage() {
  const { t } = useTranslation('common')
  const [page, setPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState<GameActiveFilterValue>('all')
  const [gameId, setGameId] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 500)
  const [imageFilter, setImageFilter] = useState<'all' | 'no_image'>('all')
  const [showFilter, setShowFilter] = useState<TriBool>('all')
  const [checkIdFilter, setCheckIdFilter] = useState<TriBool>('all')
  const [updatedByUserId, setUpdatedByUserId] = useState('')
  const [updatedFromLocal, setUpdatedFromLocal] = useState('')
  const [updatedToLocal, setUpdatedToLocal] = useState('')
  const [sortField, setSortField] = useState<'' | 'name' | 'updated_at'>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const limit = 20

  const listParams = useMemo((): GetGamesParams => {
    const is_active =
      activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined
    const is_show = triToOptionalBool(showFilter)
    const is_check_id = triToOptionalBool(checkIdFilter)
    const updated_by = updatedByUserId.trim() ? updatedByUserId.trim() : undefined
    const updated_from = datetimeLocalToIso(updatedFromLocal)
    const updated_to = datetimeLocalToIso(updatedToLocal)

    return {
      search: debouncedSearch.trim(),
      image: imageFilter,
      ...(is_active !== undefined && { is_active }),
      ...(gameId && { game_id: gameId }),
      ...(is_show !== undefined && { is_show }),
      ...(is_check_id !== undefined && { is_check_id }),
      ...(updated_by && { updated_by }),
      ...(updated_from && { updated_from }),
      ...(updated_to && { updated_to }),
      ...(sortField && { sort: sortField, order: sortOrder }),
    }
  }, [
    activeFilter,
    gameId,
    debouncedSearch,
    imageFilter,
    showFilter,
    checkIdFilter,
    updatedByUserId,
    updatedFromLocal,
    updatedToLocal,
    sortField,
    sortOrder,
  ])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sinkron pagination dengan filter
    setPage(1)
  }, [
    activeFilter,
    gameId,
    debouncedSearch,
    imageFilter,
    showFilter,
    checkIdFilter,
    updatedByUserId,
    updatedFromLocal,
    updatedToLocal,
    sortField,
    sortOrder,
  ])

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
  const { data: adminBriefList } = useGetAdminBrief()

  const selectedUpdatedByName = updatedByUserId.trim()
    ? (adminBriefList?.find((a) => a.id === updatedByUserId.trim())?.name ?? updatedByUserId.trim())
    : undefined

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

  const hasActiveFilters =
    activeFilter !== 'all' ||
    Boolean(gameId) ||
    debouncedSearch.trim() !== '' ||
    imageFilter !== 'all' ||
    showFilter !== 'all' ||
    checkIdFilter !== 'all' ||
    Boolean(updatedByUserId.trim()) ||
    Boolean(datetimeLocalToIso(updatedFromLocal)) ||
    Boolean(datetimeLocalToIso(updatedToLocal)) ||
    sortField !== ''

  const isFilteredEmpty = isSuccess && rows.length === 0 && hasActiveFilters
  const isDatabaseEmpty = isSuccess && rows.length === 0 && !hasActiveFilters

  const clearFilters = () => {
    setActiveFilter('all')
    setGameId('')
    setSearchInput('')
    setImageFilter('all')
    setShowFilter('all')
    setCheckIdFilter('all')
    setUpdatedByUserId('')
    setUpdatedFromLocal('')
    setUpdatedToLocal('')
    setSortField('')
    setSortOrder('asc')
  }

  const showLabelSummary =
    showFilter === 'all'
      ? t('gameFilters.all')
      : showFilter === 'yes'
        ? t('gameDetailPage.showYes')
        : t('gameDetailPage.showNo')

  const checkIdLabelSummary =
    checkIdFilter === 'all'
      ? t('gameFilters.all')
      : checkIdFilter === 'yes'
        ? t('gameDetailPage.checkIdYes')
        : t('gameDetailPage.checkIdNo')

  const sortOrderSummary =
    sortOrder === 'asc' ? t('gameFilters.orderAsc') : t('gameFilters.orderDesc')

  const sortFieldSummary =
    sortField === 'name'
      ? t('gameFilters.sortName')
      : sortField === 'updated_at'
        ? t('gameFilters.sortUpdatedAt')
        : ''

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

            <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/20 shadow-inner ring-1 ring-black/[0.03] dark:ring-white/[0.04]">
              <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span className="text-xs font-medium text-muted-foreground">{t('gamePage.filtersHeading')}</span>
                {hasActiveFilters ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-full shrink-0 gap-1.5 rounded-lg px-3 text-xs font-medium sm:w-auto"
                    onClick={clearFilters}
                    aria-label={t('gamePage.resetFiltersAria')}
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                    {t('gamePage.resetFilters')}
                  </Button>
                ) : (
                  <span className="hidden text-[11px] text-muted-foreground/80 sm:inline">
                    {t('gamePage.filtersToolbarHint')}
                  </span>
                )}
              </div>

              <div className="space-y-5 p-4 sm:p-5">
                <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
                  <div className="min-w-0 lg:col-span-5">
                    <Label htmlFor="game-list-search" className="text-xs text-muted-foreground">
                      {t('gameFilters.searchLabel')}
                    </Label>
                    <div className="relative mt-1.5">
                      <Search
                        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                      <Input
                        id="game-list-search"
                        type="search"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder={t('gameFilters.searchPlaceholder')}
                        className="h-9 bg-background pl-9 shadow-sm"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="min-w-0 lg:col-span-3">
                    <Label htmlFor="game-list-image" className="text-xs text-muted-foreground">
                      {t('gameFilters.imageLabel')}
                    </Label>
                    <Select
                      value={imageFilter}
                      onValueChange={(v) => setImageFilter(v as 'all' | 'no_image')}
                    >
                      <SelectTrigger id="game-list-image" className="mt-1.5 w-full min-w-0 bg-background shadow-sm" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start">
                        <SelectItem value="all">{t('gameFilters.imageAll')}</SelectItem>
                        <SelectItem value="no_image">{t('gameFilters.imageNoImage')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="min-w-0 lg:col-span-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <Label htmlFor="game-list-sort" className="text-xs text-muted-foreground">
                          {t('gameFilters.sortLabel')}
                        </Label>
                        <Select
                          value={sortField === '' ? 'default' : sortField}
                          onValueChange={(v) => {
                            if (v === 'default') {
                              setSortField('')
                              return
                            }
                            const field = v as 'name' | 'updated_at'
                            setSortField(field)
                            setSortOrder(field === 'name' ? 'asc' : 'desc')
                          }}
                        >
                          <SelectTrigger id="game-list-sort" className="w-full min-w-0 bg-background shadow-sm" size="sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent position="popper" align="start">
                            <SelectItem value="default">{t('gameFilters.sortDefault')}</SelectItem>
                            <SelectItem value="name">{t('gameFilters.sortName')}</SelectItem>
                            <SelectItem value="updated_at">{t('gameFilters.sortUpdatedAt')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {sortField ? (
                        <div className="min-w-0 flex-1 space-y-1.5 sm:max-w-[11rem]">
                          <Label htmlFor="game-list-order" className="text-xs text-muted-foreground">
                            {t('gameFilters.orderLabel')}
                          </Label>
                          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
                            <SelectTrigger id="game-list-order" className="w-full min-w-0 bg-background shadow-sm" size="sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent position="popper" align="start">
                              <SelectItem value="asc">{t('gameFilters.orderAsc')}</SelectItem>
                              <SelectItem value="desc">{t('gameFilters.orderDesc')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-border/70" aria-hidden />

                <div className="grid gap-4 md:grid-cols-2">
                  <GamePickerSelect value={gameId} onChange={setGameId} />
                  <GameActiveFilter value={activeFilter} onChange={setActiveFilter} />
                </div>

                <div className="h-px w-full bg-border/70" aria-hidden />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6 xl:items-end">
                  <div className="min-w-0 space-y-1.5 xl:col-span-1">
                    <Label htmlFor="game-list-show" className="text-xs text-muted-foreground">
                      {t('gameFilters.showLabel')}
                    </Label>
                    <Select value={showFilter} onValueChange={(v) => setShowFilter(v as TriBool)}>
                      <SelectTrigger id="game-list-show" className="w-full min-w-0 bg-background shadow-sm" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start">
                        <SelectItem value="all">{t('gameFilters.all')}</SelectItem>
                        <SelectItem value="yes">{t('gameDetailPage.yes')}</SelectItem>
                        <SelectItem value="no">{t('gameDetailPage.no')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="min-w-0 space-y-1.5 xl:col-span-1">
                    <Label htmlFor="game-list-check-id" className="text-xs text-muted-foreground">
                      {t('gameFilters.checkIdLabel')}
                    </Label>
                    <Select value={checkIdFilter} onValueChange={(v) => setCheckIdFilter(v as TriBool)}>
                      <SelectTrigger id="game-list-check-id" className="w-full min-w-0 bg-background shadow-sm" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start">
                        <SelectItem value="all">{t('gameFilters.all')}</SelectItem>
                        <SelectItem value="yes">{t('gameDetailPage.yes')}</SelectItem>
                        <SelectItem value="no">{t('gameDetailPage.no')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="min-w-0 sm:col-span-2 xl:col-span-2">
                    <AdminBriefSelect value={updatedByUserId} onChange={setUpdatedByUserId} />
                  </div>
                  <div className="min-w-0 space-y-1.5 xl:col-span-1">
                    <Label htmlFor="game-list-updated-from" className="text-xs text-muted-foreground">
                      {t('gameFilters.updatedFromLabel')}
                    </Label>
                    <Input
                      id="game-list-updated-from"
                      type="datetime-local"
                      value={updatedFromLocal}
                      onChange={(e) => setUpdatedFromLocal(e.target.value)}
                      className="h-9 bg-background shadow-sm"
                    />
                  </div>
                  <div className="min-w-0 space-y-1.5 xl:col-span-1">
                    <Label htmlFor="game-list-updated-to" className="text-xs text-muted-foreground">
                      {t('gameFilters.updatedToLabel')}
                    </Label>
                    <Input
                      id="game-list-updated-to"
                      type="datetime-local"
                      value={updatedToLocal}
                      onChange={(e) => setUpdatedToLocal(e.target.value)}
                      className="h-9 bg-background shadow-sm"
                    />
                  </div>
                </div>
              </div>
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
                  {debouncedSearch.trim() ? (
                    <Badge variant="outline" className="max-w-[min(100%,20rem)] truncate font-normal" title={debouncedSearch.trim()}>
                      {t('gamePage.filterSearchChip', { q: debouncedSearch.trim() })}
                    </Badge>
                  ) : null}
                  {imageFilter !== 'all' ? (
                    <Badge variant="outline" className="font-normal">
                      {t('gamePage.filterImageChip', {
                        label:
                          imageFilter === 'no_image'
                            ? t('gameFilters.imageNoImage')
                            : t('gameFilters.imageAll'),
                      })}
                    </Badge>
                  ) : null}
                  {showFilter !== 'all' ? (
                    <Badge variant="outline" className="font-normal">
                      {t('gamePage.filterShowChip', { value: showLabelSummary })}
                    </Badge>
                  ) : null}
                  {checkIdFilter !== 'all' ? (
                    <Badge variant="outline" className="font-normal">
                      {t('gamePage.filterCheckIdChip', { value: checkIdLabelSummary })}
                    </Badge>
                  ) : null}
                  {updatedByUserId.trim() ? (
                    <Badge
                      variant="outline"
                      className="max-w-[min(100%,16rem)] truncate font-normal"
                      title={selectedUpdatedByName}
                    >
                      {t('gamePage.filterUpdatedByChip', { name: selectedUpdatedByName })}
                    </Badge>
                  ) : null}
                  {datetimeLocalToIso(updatedFromLocal) ? (
                    <Badge variant="outline" className="font-normal">
                      {t('gamePage.filterUpdatedFromChip', { value: updatedFromLocal })}
                    </Badge>
                  ) : null}
                  {datetimeLocalToIso(updatedToLocal) ? (
                    <Badge variant="outline" className="font-normal">
                      {t('gamePage.filterUpdatedToChip', { value: updatedToLocal })}
                    </Badge>
                  ) : null}
                  {sortField ? (
                    <Badge variant="outline" className="font-normal">
                      {t('gamePage.filterSortChip', { field: sortFieldSummary, order: sortOrderSummary })}
                    </Badge>
                  ) : null}
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
