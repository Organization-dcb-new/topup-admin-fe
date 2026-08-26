import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { EmptyState, TableSkeleton } from '@/components/Layout/table-states'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import TransactionAmountFilter from '@/components/Transaction/TransactionAmountFilter'
import TransactionDateFilter from '@/components/Transaction/TransactionDateFilter'
import { TransactionDetailDrawer } from '@/components/Transaction/TransactionDetailDrawer'
import TransactionGameFilter from '@/components/Transaction/TransactionGameFilter'
import TransactionPaymentMethodFilter from '@/components/Transaction/TransactionPaymentMethodFilter'
import TransactionSearchInput from '@/components/Transaction/SearchTransaction'
import TransactionStatusFilter from '@/components/Transaction/TransactionStatusFilter'
import TransactionExportModal from '@/components/Transaction/TransactionExportModal'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetGameNames } from '@/hooks/useGame'
import { useGetPaymentMethods } from '@/hooks/usePaymentMethod'
import { useGetTransactions } from '@/hooks/useTransaction'
import { formatCurrency, formatNumber } from '@/lib/format'
import { getPaymentColumns } from '@/tables/table-transaction'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  Receipt,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import type { PaymentStatus } from '@/types/transaction'
import type { DateRange } from 'react-day-picker'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'

const PAGE_LIMIT = 20
const DATETIME_PATTERN = 'yyyy-MM-dd HH:mm:ss'

interface ActiveFilterChip {
  key: string
  label: string
  onRemove: () => void
}

export default function TransactionPage() {
  const { t } = useTranslation('common')
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [gameId, setGameId] = useState('')
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | PaymentStatus>('')
  const [minAmountFilter, setMinAmountFilter] = useState('')
  const [maxAmountFilter, setMaxAmountFilter] = useState('')
  const [exactAmountFilter, setExactAmountFilter] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [pollingInterval, setPollingInterval] = useState<number | false>(10_000)

  const debouncedSearch = useDebounce(search, 500)
  const debouncedMinAmount = useDebounce(minAmountFilter, 400)
  const debouncedMaxAmount = useDebounce(maxAmountFilter, 400)
  const debouncedExactAmount = useDebounce(exactAmountFilter, 400)

  // Drawer detail dikendalikan search param `?tx=<id>` (bukan segmen path)
  // supaya buka/tutup tidak me-remount halaman dan seluruh state filter selamat.
  const selectedTxId = searchParams.get('tx')

  const closeDrawer = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('tx')
        return next
      },
      { replace: true },
    )
  }, [setSearchParams])

  const { startDate, endDate } = useMemo(() => {
    const from = dateRange?.from
    const to = dateRange?.to
    return {
      startDate: from ? format(from, DATETIME_PATTERN) : '',
      endDate: to ? format(to, DATETIME_PATTERN) : '',
    }
  }, [dateRange])

  // Reset halaman mengikuti nilai yang sudah di-debounce: nilai mentah akan
  // mereset lebih awal daripada query-nya sendiri.
  useEffect(() => {
    setPage(1)
  }, [
    debouncedSearch,
    startDate,
    endDate,
    gameId,
    paymentMethodId,
    statusFilter,
    debouncedMinAmount,
    debouncedMaxAmount,
    debouncedExactAmount,
  ])

  const {
    data,
    isPending,
    isError,
    isSuccess,
    isFetching,
    isPlaceholderData,
    dataUpdatedAt,
    refetch,
  } = useGetTransactions(
    {
      page,
      limit: PAGE_LIMIT,
      search: debouncedSearch,
      startDate,
      endDate,
      gameId: gameId || undefined,
      paymentMethodId: paymentMethodId || undefined,
      status: statusFilter || undefined,
      minAmount: debouncedMinAmount || undefined,
      maxAmount: debouncedMaxAmount || undefined,
      exactAmount: debouncedExactAmount || undefined,
    },
    pollingInterval,
  )

  const rows = useMemo(() => data?.data ?? [], [data?.data])

  /**
   * Stats agregat dari meta bila BE berhasil menghitungnya. Saat
   * `GetStatsFiltered` gagal, BE tidak mengirim kunci stats sama sekali —
   * ketiadaan kunci itulah (bukan nilai nol) yang menjatuhkan kartu ke
   * perhitungan per-halaman. Pembulatan success_rate terjadi satu kali di sini.
   */
  const stats = useMemo(() => {
    const meta = data?.meta
    if (meta && meta.total_volume !== undefined) {
      return {
        totalVolume: meta.total_volume,
        paidCount: meta.total_paid_count ?? 0,
        totalMargin: meta.total_margin ?? 0,
        successRate: Math.round(meta.success_rate ?? 0),
        isOverall: true,
      }
    }

    let totalVolume = 0
    let paidCount = 0
    let totalMargin = 0
    rows.forEach((row) => {
      if (row.status === 'PAID') {
        totalVolume += row.amount
        paidCount++
        totalMargin += row.margin ?? 0
      }
    })
    const successRate = rows.length > 0 ? Math.round((paidCount / rows.length) * 100) : 0

    return { totalVolume, paidCount, totalMargin, successRate, isOverall: false }
  }, [data?.meta, rows])

  // Nama game/metode hanya untuk label chip; query-nya sama persis dengan yang
  // dipakai komponen filter, jadi react-query men-share cache tanpa fetch ganda.
  const { data: gameNames } = useGetGameNames()
  const { data: paymentMethodsData } = useGetPaymentMethods(1, 400)

  const resetFilters = useCallback(() => {
    setSearch('')
    setDateRange(undefined)
    setGameId('')
    setPaymentMethodId('')
    setStatusFilter('')
    setMinAmountFilter('')
    setMaxAmountFilter('')
    setExactAmountFilter('')
    setPage(1)
  }, [])

  const activeChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = []

    if (search.trim() !== '') {
      chips.push({
        key: 'search',
        label: `${t('transactionPage.searchLabel')}: "${search.trim()}"`,
        onRemove: () => setSearch(''),
      })
    }

    if (dateRange?.from) {
      const from = format(dateRange.from, 'yyyy-MM-dd')
      const to = format(dateRange.to ?? dateRange.from, 'yyyy-MM-dd')
      chips.push({
        key: 'date',
        label: from === to ? from : `${from} – ${to}`,
        onRemove: () => setDateRange(undefined),
      })
    }

    if (gameId !== '') {
      const gameName = gameNames?.find((g) => g.id === gameId)?.name ?? gameId
      chips.push({
        key: 'game',
        label: `${t('transactionPage.game')}: ${gameName}`,
        onRemove: () => setGameId(''),
      })
    }

    if (paymentMethodId !== '') {
      const method = paymentMethodsData?.data?.find((m) => m.id === paymentMethodId)
      const methodName = method ? method.full_name || method.name : paymentMethodId
      chips.push({
        key: 'paymentMethod',
        label: `${t('transactionPage.paymentMethod')}: ${methodName}`,
        onRemove: () => setPaymentMethodId(''),
      })
    }

    if (statusFilter !== '') {
      chips.push({
        key: 'status',
        label: `${t('transactionPage.status')}: ${t(`paymentStatus.${statusFilter}`)}`,
        onRemove: () => setStatusFilter(''),
      })
    }

    if (minAmountFilter !== '') {
      chips.push({
        key: 'minAmount',
        label: `≥ ${formatNumber(Number(minAmountFilter))}`,
        onRemove: () => setMinAmountFilter(''),
      })
    }

    if (maxAmountFilter !== '') {
      chips.push({
        key: 'maxAmount',
        label: `≤ ${formatNumber(Number(maxAmountFilter))}`,
        onRemove: () => setMaxAmountFilter(''),
      })
    }

    if (exactAmountFilter !== '') {
      chips.push({
        key: 'exactAmount',
        label: `= ${formatNumber(Number(exactAmountFilter))}`,
        onRemove: () => setExactAmountFilter(''),
      })
    }

    return chips
  }, [
    t,
    search,
    dateRange,
    gameId,
    gameNames,
    paymentMethodId,
    paymentMethodsData,
    statusFilter,
    minAmountFilter,
    maxAmountFilter,
    exactAmountFilter,
  ])

  const activeFilterCount = activeChips.length
  const hasActiveFilters = activeFilterCount > 0

  const paymentColumns = useMemo(() => getPaymentColumns(t), [t])

  const totalData = data?.meta?.total_data ?? 0
  const totalPage = data?.meta?.total_page ?? 0
  const rangeFrom = totalData === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1
  const rangeTo = Math.min(page * PAGE_LIMIT, totalData)

  const statCards = [
    {
      key: 'totalVolume',
      label: t('transactionPage.stats.totalVolume'),
      value: (
        <span className='text-foreground'>{formatCurrency(stats.totalVolume)}</span>
      ),
    },
    {
      key: 'paidCount',
      label: t('transactionPage.stats.paidCount'),
      value: (
        <span className='text-foreground'>
          {formatNumber(stats.paidCount)}{' '}
          <span className='text-xs font-normal text-muted-foreground'>
            {t('transactionPage.stats.txUnit')}
          </span>
        </span>
      ),
    },
    {
      key: 'margin',
      label: t('transactionPage.stats.margin'),
      value: <span className='text-success'>{formatCurrency(stats.totalMargin)}</span>,
    },
    {
      key: 'successRate',
      label: t('transactionPage.stats.successRate'),
      value: <span className='text-foreground'>{stats.successRate}%</span>,
    },
  ]

  return (
    <DashboardLayout>
      <div className='w-full space-y-6'>
        {/* ── Header ── */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='flex gap-3'>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <Receipt className='h-5 w-5' aria-hidden />
            </div>
            <div className='min-w-0 space-y-1'>
              <h1 className='text-2xl font-semibold tracking-tight text-gray-900 dark:text-white'>
                {t('transactionPage.title')}
              </h1>
              <p className='text-sm text-muted-foreground'>
                {t('transactionPage.subtitle', { limit: PAGE_LIMIT })}
              </p>
            </div>
          </div>

          {/* Indikator polling: waktu pembaruan terakhir + titik berdenyut
              halus selama refetch berjalan. */}
          {dataUpdatedAt > 0 && (
            <p className='flex items-center gap-2 text-xs text-muted-foreground sm:pt-1'>
              <span className='relative flex h-2 w-2' aria-hidden>
                {isFetching && (
                  <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 motion-reduce:animate-none' />
                )}
                <span
                  className={cn(
                    'relative inline-flex h-2 w-2 rounded-full transition-colors motion-reduce:transition-none',
                    isFetching ? 'bg-primary' : 'bg-muted-foreground/40',
                  )}
                />
              </span>
              <span className='tabular-nums'>
                {t('transactionPage.updatedAt', {
                  time: format(new Date(dataUpdatedAt), 'HH:mm:ss'),
                })}
              </span>
              {isFetching && <span className='sr-only'>{t('transactionPage.refreshingAria')}</span>}
            </p>
          )}
        </div>

        {/* ── Kartu stats ── */}
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          {isPending
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className='rounded-xl bg-card p-4 shadow-xs ring-1 ring-border'
                  aria-hidden
                >
                  <Skeleton className='h-3.5 w-24 rounded' />
                  <Skeleton className='mt-2.5 h-6 w-32 rounded' />
                </div>
              ))
            : statCards.map((card) => (
                <div
                  key={card.key}
                  className='rounded-xl bg-card p-4 shadow-xs ring-1 ring-border transition-shadow duration-200 hover:shadow-sm motion-reduce:transition-none'
                >
                  <p className='text-xs font-medium text-muted-foreground'>
                    {card.label}
                    {!stats.isOverall && (
                      <span className='ml-1 text-muted-foreground/70'>
                        {t('transactionPage.stats.pageScope')}
                      </span>
                    )}
                  </p>
                  <p className='mt-1 truncate text-lg font-semibold tabular-nums'>{card.value}</p>
                </div>
              ))}
        </div>

        {/* ── Panel filter ── */}
        <section
          className='overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-border'
          aria-label={t('transactionPage.filtersRegionAria')}
        >
          <div
            className={cn(
              'flex flex-col gap-2 bg-muted/25 p-2 sm:flex-row sm:items-center sm:gap-3 sm:pl-3 sm:pr-4',
              filtersOpen && 'border-b border-border/70',
            )}
          >
            <button
              type='button'
              id='tx-filters-toggle'
              className='flex min-h-10 min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted/50 motion-reduce:transition-none sm:px-4'
              aria-expanded={filtersOpen}
              aria-controls='tx-filters-panel'
              onClick={() => setFiltersOpen((o) => !o)}
            >
              <span className='flex min-w-0 items-center gap-2'>
                <SlidersHorizontal className='h-4 w-4 shrink-0 text-muted-foreground' aria-hidden />
                <span className='text-sm font-semibold text-foreground'>
                  {t('transactionPage.filterHeading')}
                </span>
                {activeFilterCount > 0 && (
                  <span
                    className='inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold tabular-nums text-primary-foreground'
                    aria-label={t('transactionPage.activeFiltersAria', {
                      count: activeFilterCount,
                    })}
                  >
                    {activeFilterCount}
                  </span>
                )}
                <span className='hidden text-xs text-muted-foreground sm:inline'>
                  {filtersOpen
                    ? t('transactionPage.filtersClickClose')
                    : t('transactionPage.filtersClickOpen')}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none',
                  filtersOpen && 'rotate-180',
                )}
                aria-hidden
              />
            </button>

            <div className='flex items-center gap-2 sm:self-center'>
              <div className='flex items-center gap-2'>
                <span className='text-xs font-medium text-muted-foreground'>
                  {t('transactionPage.autoRefresh.label')}
                </span>
                <Select
                  value={pollingInterval === false ? 'off' : String(pollingInterval)}
                  onValueChange={(v) => setPollingInterval(v === 'off' ? false : Number(v))}
                >
                  <SelectTrigger
                    className='h-9 w-[5.5rem] rounded-lg text-xs font-semibold shadow-xs'
                    aria-label={t('transactionPage.autoRefresh.aria')}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='off'>{t('transactionPage.autoRefresh.off')}</SelectItem>
                    <SelectItem value='10000'>{t('transactionPage.autoRefresh.s10')}</SelectItem>
                    <SelectItem value='30000'>{t('transactionPage.autoRefresh.s30')}</SelectItem>
                    <SelectItem value='60000'>{t('transactionPage.autoRefresh.m1')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Can perm={PERM.TRANSACTION_EXPORT}>
                <TransactionExportModal />
              </Can>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-9 shrink-0 rounded-lg shadow-xs'
                disabled={!hasActiveFilters}
                onClick={resetFilters}
                aria-label={t('transactionPage.resetFiltersAria')}
              >
                <RotateCcw className='mr-2 h-3.5 w-3.5' aria-hidden />
                {t('transactionPage.resetFilters')}
              </Button>
            </div>
          </div>

          {/* Chip filter aktif saat panel tertutup: tiap chip bisa dihapus
              satu-satu tanpa membuka panel. */}
          {!filtersOpen && hasActiveFilters && (
            <div className='flex flex-wrap items-center gap-2 border-t border-border/70 px-4 py-3'>
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className='inline-flex min-w-0 max-w-full items-center gap-1 rounded-full bg-muted py-1 pl-3 pr-1 text-xs font-medium text-foreground ring-1 ring-border'
                >
                  <span className='truncate tabular-nums'>{chip.label}</span>
                  <button
                    type='button'
                    className='flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground motion-reduce:transition-none'
                    onClick={chip.onRemove}
                    aria-label={t('transactionPage.removeFilterAria', { label: chip.label })}
                  >
                    <X className='h-3 w-3' aria-hidden />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Transisi buka/tutup via grid-rows; konten tetap ter-mount supaya
              state internal filter tidak hilang, tapi `inert` mencegah fokus
              masuk saat tertutup. */}
          <div
            className={cn(
              'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
              filtersOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            )}
          >
            <div
              id='tx-filters-panel'
              role='region'
              aria-labelledby='tx-filters-toggle'
              aria-hidden={!filtersOpen}
              inert={!filtersOpen}
              className='min-h-0 min-w-0 overflow-hidden'
            >
              <div className='min-w-0 px-4 py-5 sm:px-6 sm:py-6'>
                <div className='flex flex-col gap-8'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='tx-filter-search'
                      className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'
                    >
                      {t('transactionPage.searchLabel')}
                    </Label>
                    <TransactionSearchInput id='tx-filter-search' value={search} onChange={setSearch} />
                  </div>

                  <div className='h-px bg-border/70' aria-hidden />

                  <div className='space-y-4'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                      {t('transactionPage.sectionTimeGameStatus')}
                    </p>
                    <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-5'>
                      <div className='space-y-2'>
                        <Label className='text-xs font-medium text-muted-foreground'>
                          {t('transactionPage.dateTimeRange')}
                        </Label>
                        <TransactionDateFilter date={dateRange} onChange={setDateRange} />
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-medium text-muted-foreground'>
                          {t('transactionPage.game')}
                        </Label>
                        <TransactionGameFilter value={gameId} onChange={setGameId} />
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-medium text-muted-foreground'>
                          {t('transactionPage.paymentMethod')}
                        </Label>
                        <TransactionPaymentMethodFilter
                          value={paymentMethodId}
                          onChange={setPaymentMethodId}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-medium text-muted-foreground'>
                          {t('transactionPage.status')}
                        </Label>
                        <TransactionStatusFilter value={statusFilter} onChange={setStatusFilter} />
                      </div>
                    </div>
                  </div>

                  <div className='h-px bg-border/70' aria-hidden />

                  <div className='space-y-4'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                      {t('transactionPage.amountSection')}
                    </p>
                    <TransactionAmountFilter
                      minValue={minAmountFilter}
                      maxValue={maxAmountFilter}
                      exactValue={exactAmountFilter}
                      onMinChange={setMinAmountFilter}
                      onMaxChange={setMaxAmountFilter}
                      onExactChange={setExactAmountFilter}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tabel ── */}
        <section className='overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-border'>
          <div className='border-b border-border/70 px-4 py-3 sm:px-5'>
            <div className='min-w-0 space-y-0.5'>
              <h2 className='text-sm font-semibold text-foreground'>
                {t('transactionPage.listTitle')}
              </h2>
              <p className='text-xs text-muted-foreground'>{t('transactionPage.listHint')}</p>
            </div>
          </div>

          <div className='min-w-0 p-3 sm:p-4'>
            {isPending && !isError && (
              <div aria-busy='true'>
                <TableSkeleton />
              </div>
            )}

            {isError && (
              <div className='flex flex-col items-center gap-3 py-6'>
                <ErrorComponent message={t('transactionPage.loadErrorDetail')} />
                <Button type='button' variant='outline' onClick={() => void refetch()}>
                  <RefreshCw className='mr-2 h-4 w-4' aria-hidden />
                  {t('transactionPage.retry')}
                </Button>
              </div>
            )}

            {isSuccess && (
              <>
                {/* Baris halaman sebelumnya dipertahankan selama halaman baru
                    dimuat; peredupan inilah penanda datanya belum terbaru. */}
                <div
                  aria-busy={isPlaceholderData}
                  inert={isPlaceholderData}
                  className={cn(
                    'transition-opacity duration-200 motion-reduce:transition-none',
                    isPlaceholderData && 'opacity-60',
                  )}
                >
                  <div className='max-h-[min(70vh,40rem)] min-w-0 w-full overflow-auto overscroll-contain'>
                    <DataTable
                      columns={paymentColumns}
                      data={rows}
                      getRowId={(row) => row.id}
                      stickyHeader
                      caption={t('transactionPage.tableCaption', { page, totalPage })}
                      emptyMessage={
                        <EmptyState
                          message={t('transactionPage.emptyPage')}
                          action={
                            hasActiveFilters ? (
                              <Button type='button' variant='outline' size='sm' onClick={resetFilters}>
                                {t('transactionPage.resetFilters')}
                              </Button>
                            ) : undefined
                          }
                        />
                      }
                    />
                  </div>
                </div>

                <div className='mt-4 flex flex-col items-center gap-2'>
                  {totalData > 0 && (
                    <p className='text-xs tabular-nums text-muted-foreground'>
                      {t('transactionPage.showingRange', {
                        from: formatNumber(rangeFrom),
                        to: formatNumber(rangeTo),
                        total: formatNumber(totalData),
                      })}
                    </p>
                  )}
                  <Pagination page={page} totalPage={totalPage} onChange={setPage} />
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <TransactionDetailDrawer paymentId={selectedTxId} onClose={closeDrawer} />
    </DashboardLayout>
  )
}
