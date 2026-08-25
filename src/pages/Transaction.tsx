import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import TransactionAmountFilter from '@/components/Transaction/TransactionAmountFilter'
import TransactionDateFilter from '@/components/Transaction/TransactionDateFilter'
import TransactionGameFilter from '@/components/Transaction/TransactionGameFilter'
import TransactionPaymentMethodFilter from '@/components/Transaction/TransactionPaymentMethodFilter'
import TransactionSearchInput from '@/components/Transaction/SearchTransaction'
import TransactionStatusFilter from '@/components/Transaction/TransactionStatusFilter'
import TransactionExportModal from '@/components/Transaction/TransactionExportModal'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetTransactions } from '@/hooks/useTransaction'
import { getPaymentColumns } from '@/tables/table-transaction'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Receipt,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react'
import type { Payment } from '@/types/transaction'
import type { DateRange } from 'react-day-picker'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'

const TX_LIST_TOAST_ID = 'transactions-list'

export default function TransactionPage() {
  const { t } = useTranslation('common')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [gameId, setGameId] = useState('')
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | Payment['status']>('')
  const [minAmountFilter, setMinAmountFilter] = useState('')
  const [maxAmountFilter, setMaxAmountFilter] = useState('')
  const [exactAmountFilter, setExactAmountFilter] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Polling state (no drawer)
  const [pollingInterval, setPollingInterval] = useState<number | false>(10_000)

  const limit = 20
  const debouncedSearch = useDebounce(search, 500)
  const debouncedMinAmount = useDebounce(minAmountFilter, 400)
  const debouncedMaxAmount = useDebounce(maxAmountFilter, 400)
  const debouncedExactAmount = useDebounce(exactAmountFilter, 400)

  const datetimePattern = 'yyyy-MM-dd HH:mm:ss'

  const { startDate, endDate } = useMemo(() => {
    const from = dateRange?.from
    const to = dateRange?.to
    const start = from ? format(from, datetimePattern) : ''
    const end = to ? format(to, datetimePattern) : ''
    return { startDate: start, endDate: end }
  }, [dateRange])

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

  const { data, isLoading, isError, isSuccess, isFetchedAfterMount, isPending } = useGetTransactions(
    page,
    limit,
    search,
    startDate,
    endDate,
    gameId || undefined,
    paymentMethodId || undefined,
    statusFilter || undefined,
    debouncedMinAmount || undefined,
    debouncedMaxAmount || undefined,
    debouncedExactAmount || undefined,
    pollingInterval
  )

  useEffect(() => {
    if (isPending) {
      toast.loading(t('transactionPage.toastLoading'), { id: TX_LIST_TOAST_ID })
      return
    }

    if (!isFetchedAfterMount) return

    if (isError) {
      toast.error(t('transactionPage.toastError'), { id: TX_LIST_TOAST_ID })
      return
    }

    if (isSuccess) {
      toast.success(t('transactionPage.toastSuccess'), { id: TX_LIST_TOAST_ID })
    }
  }, [isPending, isFetchedAfterMount, isSuccess, isError, t])

  useEffect(() => {
    return () => {
      toast.dismiss(TX_LIST_TOAST_ID)
    }
  }, [])

  const rows = useMemo(() => data?.data ?? [], [data?.data])

  // Stats calculation
  const stats = useMemo(() => {
    if (data?.meta && data.meta.total_volume !== undefined) {
      return {
        totalVolume: data.meta.total_volume ?? 0,
        paidCount: data.meta.total_paid_count ?? 0,
        totalMargin: data.meta.total_margin ?? 0,
        successRate: Math.round(data.meta.success_rate ?? 0),
        isOverall: true,
      }
    }

    let totalVolume = 0
    let paidCount = 0
    let totalMargin = 0
    const totalCount = rows.length

    rows.forEach((row) => {
      if (row.status === 'PAID') {
        totalVolume += row.amount
        paidCount++
        totalMargin += row.margin
      }
    })

    const successRate = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0

    return { totalVolume, paidCount, totalMargin, successRate, isOverall: false }
  }, [data, rows])

  const hasActiveFilters = useMemo(
    () =>
      search.trim() !== '' ||
      dateRange?.from != null ||
      gameId !== '' ||
      paymentMethodId !== '' ||
      statusFilter !== '' ||
      minAmountFilter !== '' ||
      maxAmountFilter !== '' ||
      exactAmountFilter !== '',
    [
      search,
      dateRange,
      gameId,
      paymentMethodId,
      statusFilter,
      minAmountFilter,
      maxAmountFilter,
      exactAmountFilter,
    ],
  )

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

  const paymentColumns = useMemo(() => getPaymentColumns(t), [t])

  return (
    <DashboardLayout>
      <div className='w-full space-y-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex gap-3'>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <Receipt className='h-5 w-5' aria-hidden />
            </div>
            <div className='min-w-0 space-y-1'>
              <h1 className='text-2xl font-semibold tracking-tight text-gray-900 dark:text-white'>
                {t('transactionPage.title')}
              </h1>
              <p className='text-sm text-muted-foreground'>
                {t('transactionPage.subtitle', { limit })}
              </p>
            </div>
          </div>
          <div className='flex flex-col items-end gap-1 sm:text-right'>
            {isLoading && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin text-primary' aria-hidden />
                {t('transactionPage.loadingShort')}
              </p>
            )}
            {isError && (
              <p className='flex items-center gap-2 text-sm font-medium text-destructive'>
                <AlertCircle className='h-4 w-4 shrink-0' aria-hidden />
                {t('transactionPage.loadFailedShort')}
              </p>
            )}
            {isSuccess && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <CheckCircle2 className='h-4 w-4 shrink-0 text-emerald-600' aria-hidden />
                <span className='tabular-nums text-foreground dark:text-slate-350'>
                  {t('transactionPage.totalCount', {
                    count: (data?.meta?.total_data ?? 0).toLocaleString('id-ID'),
                  })}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          {/* Card 1: Total Volume */}
          <div className='rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-2xs hover:shadow-xs transition-shadow duration-200'>
            <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'>
              {stats.isOverall ? 'Total Volume' : 'Total Volume (Page)'}
            </p>
            <p className='mt-1 text-lg font-extrabold text-slate-900 dark:text-white tabular-nums'>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.totalVolume)}</p>
          </div>
          {/* Card 2: Total Paid */}
          <div className='rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-2xs hover:shadow-xs transition-shadow duration-200'>
            <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'>Total Paid Count</p>
            <p className='mt-1 text-lg font-extrabold text-slate-900 dark:text-white tabular-nums'>{stats.paidCount} <span className='text-xs font-normal text-slate-400'>txs</span></p>
          </div>
          {/* Card 3: Estimated Margin */}
          <div className='rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-2xs hover:shadow-xs transition-shadow duration-200'>
            <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'>
              {stats.isOverall ? 'Est. Margin' : 'Est. Margin (Page)'}
            </p>
            <p className='mt-1 text-lg font-extrabold text-emerald-600 dark:text-emerald-450 tabular-nums'>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.totalMargin)}</p>
          </div>
          {/* Card 4: Success Rate */}
          <div className='rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-2xs hover:shadow-xs transition-shadow duration-200'>
            <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'>Success Rate</p>
            <p className='mt-1 text-lg font-extrabold text-slate-900 dark:text-white tabular-nums'>{stats.successRate}%</p>
          </div>
        </div>

        <section
          className='overflow-hidden rounded-xl border border-gray-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-955 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10'
          aria-label={t('transactionPage.filtersRegionAria')}
        >
          <div
            className={cn(
              'flex flex-col gap-2 bg-muted/25 dark:bg-zinc-900/10 p-2 sm:flex-row sm:items-center sm:gap-3 sm:p-2 sm:pl-3 sm:pr-4',
              filtersOpen && 'border-b border-gray-100 dark:border-zinc-900',
            )}
          >
            <button
              type='button'
              id='tx-filters-toggle'
              className='flex min-h-10 min-w-0 flex-1 items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted/50 dark:hover:bg-zinc-900/50 sm:px-4 cursor-pointer'
              aria-expanded={filtersOpen}
              aria-controls='tx-filters-panel'
              onClick={() => setFiltersOpen((o) => !o)}
            >
              <span className='flex min-w-0 items-center gap-2'>
                <SlidersHorizontal className='h-4 w-4 shrink-0 text-muted-foreground' aria-hidden />
                <span className='text-sm font-semibold text-gray-900 dark:text-white'>
                  {t('transactionPage.filterHeading')}
                </span>
                <span className='hidden text-xs text-muted-foreground sm:inline'>
                  {filtersOpen
                    ? t('transactionPage.filtersClickClose')
                    : t('transactionPage.filtersClickOpen')}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                  filtersOpen && 'rotate-180',
                )}
                aria-hidden
              />
            </button>
            <div className='flex gap-2 sm:self-center items-center'>
              {/* Auto Refresh dropdown selector */}
              <div className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400'>
                <span>Auto Refresh:</span>
                <select
                  value={pollingInterval === false ? 'off' : pollingInterval}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === 'off') setPollingInterval(false)
                    else setPollingInterval(Number(val))
                  }}
                  className='bg-transparent border-none focus:outline-hidden font-bold text-primary cursor-pointer'
                >
                  <option value='off'>Off</option>
                  <option value='10000'>10s</option>
                  <option value='30000'>30s</option>
                  <option value='60000'>1m</option>
                </select>
              </div>

              <Can perm={PERM.TRANSACTION_EXPORT}>
                <TransactionExportModal />
              </Can>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-9 shrink-0 shadow-xs border-slate-200 dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-lg'
                disabled={!hasActiveFilters}
                onClick={resetFilters}
                aria-label={t('transactionPage.resetFiltersAria')}
              >
                <RotateCcw className='mr-2 h-3.5 w-3.5' aria-hidden />
                {t('transactionPage.resetFilters')}
              </Button>
            </div>
          </div>
          <div
            id='tx-filters-panel'
            role='region'
            aria-labelledby='tx-filters-toggle'
            hidden={!filtersOpen}
            className='min-w-0'
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
                  <TransactionSearchInput
                    id='tx-filter-search'
                    value={search}
                    onChange={setSearch}
                  />
                </div>

                <div className='h-px bg-border/70 dark:bg-zinc-900' aria-hidden />

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

                <div className='h-px bg-border/70 dark:bg-zinc-900' aria-hidden />

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
        </section>

        <div className='overflow-hidden rounded-xl bg-white dark:bg-zinc-955 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-800'>
          <div className='border-b border-gray-100 dark:border-zinc-900 px-4 py-3 sm:px-5'>
            <div className='min-w-0 space-y-0.5'>
              <h2 className='text-sm font-semibold text-gray-900 dark:text-white'>{t('transactionPage.listTitle')}</h2>
              <p className='text-xs text-muted-foreground'>{t('transactionPage.listHint')}</p>
            </div>
          </div>

          <div className='min-w-0 p-3 sm:p-4'>
            {isLoading && (
              <div
                className='flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/80 bg-muted/20 py-12'
                role='status'
                aria-live='polite'
                aria-busy='true'
              >
                <Loader2 className='h-11 w-11 animate-spin text-primary' aria-hidden />
                <div className='text-center'>
                  <p className='text-sm font-medium text-foreground'>
                    {t('transactionPage.tableLoadingTitle')}
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    {t('transactionPage.tableLoadingHint')}
                  </p>
                </div>
              </div>
            )}

            {isError && (
              <ErrorComponent message={t('transactionPage.loadErrorDetail')} />
            )}

            {isSuccess && (
              <>
                <div className='max-h-[min(70vh,40rem)] min-w-0 w-full overflow-auto overscroll-contain'>
                  <DataTable
                    columns={paymentColumns}
                    data={rows}
                    emptyMessage={t('transactionPage.emptyPage')}
                  />
                </div>
                <div className='mt-4'>
                  <Pagination page={page} totalPage={data?.meta?.total_page} onChange={setPage} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
