import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { Label } from '@/components/ui/label'
import TransactionAmountFilter from '@/components/Transaction/TransactionAmountFilter'
import TransactionDateFilter from '@/components/Transaction/TransactionDateFilter'
import TransactionGameFilter from '@/components/Transaction/TransactionGameFilter'
import TransactionPaymentMethodFilter from '@/components/Transaction/TransactionPaymentMethodFilter'
import TransactionSearchInput from '@/components/Transaction/SearchTransaction'
import TransactionStatusFilter from '@/components/Transaction/TransactionStatusFilter'
import TransactionExportModal from '@/components/Transaction/TransactionExportModal'
import { txLabel, txSectionTitle } from '@/components/Transaction/styles'
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

const TX_LIST_TOAST_ID = 'transactions-list'

function formatIdr(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Label status di sisi kanan judul halaman. */
function StatusTag({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <p
      className={cn(
        'nb-frame nb-frame-thin nb-sd-sm inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-black uppercase tracking-[0.12em]',
        accent,
      )}
    >
      {children}
    </p>
  )
}

/** Kartu angka ringkas di bawah judul. */
function StatTile({
  label,
  value,
  accent,
  suffix,
}: {
  label: string
  value: string
  /** Sorotan di belakang angka — pembeda antar kartu saat dilihat sekilas. */
  accent: string
  suffix?: string
}) {
  return (
    <div className='nb-frame nb-frame-thick nb-sd bg-white p-3'>
      <p className='truncate text-[10px] font-black uppercase tracking-[0.14em] text-[#111]/60'>
        {label}
      </p>
      <p className='mt-1.5 text-lg font-black leading-tight tabular-nums'>
        <span className={cn('inline-block px-1', accent)}>{value}</span>
        {suffix && <span className='ml-1 text-xs font-bold text-[#111]/60'>{suffix}</span>}
      </p>
    </div>
  )
}

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
      <div className='w-full min-w-0 space-y-5'>
        <div className='nb-frame nb-frame-thick nb-sd flex flex-col gap-4 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5'>
          <div className='flex gap-3'>
            <span className='nb-frame nb-frame-thin nb-sd-sm flex h-12 w-12 shrink-0 items-center justify-center bg-[#ff9d3d]'>
              <Receipt className='h-5 w-5' strokeWidth={2.5} aria-hidden />
            </span>
            <div className='min-w-0 space-y-1.5'>
              <h1 className='text-2xl font-black uppercase leading-none tracking-tight'>
                {t('transactionPage.title')}
              </h1>
              <p className='inline-block bg-[#ffd84d] px-1.5 py-0.5 text-xs font-bold'>
                {t('transactionPage.subtitle', { limit })}
              </p>
            </div>
          </div>

          <div className='flex shrink-0 sm:justify-end'>
            {isLoading && (
              <StatusTag accent='bg-[#6fe3f5]'>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                {t('transactionPage.loadingShort')}
              </StatusTag>
            )}
            {isError && (
              <StatusTag accent='bg-[#ff4d3d]'>
                <AlertCircle className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                {t('transactionPage.loadFailedShort')}
              </StatusTag>
            )}
            {isSuccess && (
              <StatusTag accent='bg-[#c9f24d]'>
                <CheckCircle2 className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                <span className='tabular-nums'>
                  {t('transactionPage.totalCount', {
                    count: (data?.meta?.total_data ?? 0).toLocaleString('id-ID'),
                  })}
                </span>
              </StatusTag>
            )}
          </div>
        </div>

        {/* Ringkasan singkat */}
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          <StatTile
            label={stats.isOverall ? 'Total Volume' : 'Total Volume (Page)'}
            value={formatIdr(stats.totalVolume)}
            accent='bg-[#6fe3f5]'
          />
          <StatTile
            label='Total Paid Count'
            value={stats.paidCount.toLocaleString('id-ID')}
            accent='bg-[#ffd84d]'
            suffix='txs'
          />
          <StatTile
            label={stats.isOverall ? 'Est. Margin' : 'Est. Margin (Page)'}
            value={formatIdr(stats.totalMargin)}
            accent={stats.totalMargin < 0 ? 'bg-[#ff4d3d]' : 'bg-[#c9f24d]'}
          />
          <StatTile
            label='Success Rate'
            value={`${stats.successRate}%`}
            accent='bg-[#ff9ed2]'
          />
        </div>

        <section
          className='nb-frame nb-frame-thick nb-sd bg-white'
          aria-label={t('transactionPage.filtersRegionAria')}
        >
          <div
            className={cn(
              'flex flex-col gap-2 bg-[#f5f1e8] p-2 sm:flex-row sm:items-center sm:gap-3 sm:p-2 sm:pl-3 sm:pr-3',
              filtersOpen && 'border-b-4 border-[#111]',
            )}
          >
            <button
              type='button'
              id='tx-filters-toggle'
              className='nb-focus flex min-h-10 min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 px-1 py-2 text-left sm:px-2'
              aria-expanded={filtersOpen}
              aria-controls='tx-filters-panel'
              onClick={() => setFiltersOpen((o) => !o)}
            >
              <span className='flex min-w-0 items-center gap-2'>
                <SlidersHorizontal className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                <span className='text-sm font-black uppercase tracking-tight'>
                  {t('transactionPage.filterHeading')}
                </span>
                <span className='hidden text-[11px] font-bold text-[#111]/60 sm:inline'>
                  {filtersOpen
                    ? t('transactionPage.filtersClickClose')
                    : t('transactionPage.filtersClickOpen')}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform duration-200',
                  filtersOpen && 'rotate-180',
                )}
                strokeWidth={3}
                aria-hidden
              />
            </button>

            <div className='flex flex-wrap items-center gap-2 sm:self-center'>
              {/* Auto Refresh dropdown selector */}
              <label className='nb-frame nb-frame-thin nb-sd-sm flex h-9 items-center gap-1.5 bg-white px-2.5 text-[11px] font-black uppercase tracking-[0.08em]'>
                <span>Auto Refresh:</span>
                <select
                  value={pollingInterval === false ? 'off' : pollingInterval}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === 'off') setPollingInterval(false)
                    else setPollingInterval(Number(val))
                  }}
                  className='nb-focus cursor-pointer border-none bg-transparent font-black text-[#111] focus:outline-hidden'
                >
                  <option value='off'>Off</option>
                  <option value='10000'>10s</option>
                  <option value='30000'>30s</option>
                  <option value='60000'>1m</option>
                </select>
              </label>

              <TransactionExportModal />

              <button
                type='button'
                className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-9 shrink-0 cursor-pointer items-center gap-2 bg-[#ff9ed2] px-3 text-xs font-black uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:bg-white disabled:opacity-55'
                disabled={!hasActiveFilters}
                onClick={resetFilters}
                aria-label={t('transactionPage.resetFiltersAria')}
              >
                <RotateCcw className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
                {t('transactionPage.resetFilters')}
              </button>
            </div>
          </div>

          <div
            id='tx-filters-panel'
            role='region'
            aria-labelledby='tx-filters-toggle'
            hidden={!filtersOpen}
            className='min-w-0'
          >
            <div className='min-w-0 px-4 py-5 sm:px-5 sm:py-6'>
              <div className='flex flex-col gap-7'>
                <div className='space-y-2'>
                  <Label htmlFor='tx-filter-search' className={txSectionTitle}>
                    {t('transactionPage.searchLabel')}
                  </Label>
                  <TransactionSearchInput
                    id='tx-filter-search'
                    value={search}
                    onChange={setSearch}
                  />
                </div>

                <div className='h-1 bg-[#111]/15' aria-hidden />

                <div className='space-y-4'>
                  <p className={txSectionTitle}>{t('transactionPage.sectionTimeGameStatus')}</p>
                  <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-5'>
                    <div className='space-y-2'>
                      <Label className={txLabel}>{t('transactionPage.dateTimeRange')}</Label>
                      <TransactionDateFilter date={dateRange} onChange={setDateRange} />
                    </div>
                    <div className='space-y-2'>
                      <Label className={txLabel}>{t('transactionPage.game')}</Label>
                      <TransactionGameFilter value={gameId} onChange={setGameId} />
                    </div>
                    <div className='space-y-2'>
                      <Label className={txLabel}>{t('transactionPage.paymentMethod')}</Label>
                      <TransactionPaymentMethodFilter
                        value={paymentMethodId}
                        onChange={setPaymentMethodId}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className={txLabel}>{t('transactionPage.status')}</Label>
                      <TransactionStatusFilter value={statusFilter} onChange={setStatusFilter} />
                    </div>
                  </div>
                </div>

                <div className='h-1 bg-[#111]/15' aria-hidden />

                <div className='space-y-4'>
                  <p className={txSectionTitle}>{t('transactionPage.amountSection')}</p>
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

        <div className='nb-frame nb-frame-thick nb-sd bg-white p-3 sm:p-4'>
          <h2 className='text-sm font-black uppercase tracking-tight'>
            {t('transactionPage.listTitle')}
          </h2>
          <p className='mt-0.5 text-xs font-bold text-[#111]/70'>
            {t('transactionPage.listHint')}
          </p>
        </div>

        {isLoading && (
          <div
            className='nb-frame nb-frame-thick nb-sd flex min-h-[16rem] flex-col items-center justify-center gap-4 bg-white py-12'
            role='status'
            aria-live='polite'
            aria-busy='true'
          >
            <span className='nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center bg-[#6fe3f5]'>
              <Loader2 className='h-7 w-7 animate-spin' strokeWidth={3} aria-hidden />
            </span>
            <div className='text-center'>
              <p className='text-sm font-black uppercase tracking-tight'>
                {t('transactionPage.tableLoadingTitle')}
              </p>
              <p className='mt-1 text-xs font-bold text-[#111]/70'>
                {t('transactionPage.tableLoadingHint')}
              </p>
            </div>
          </div>
        )}

        {isError && (
          <div className='nb-frame nb-frame-thick nb-sd bg-white'>
            <ErrorComponent message={t('transactionPage.loadErrorDetail')} />
          </div>
        )}

        {isSuccess && (
          <>
            <DataTable
              className='nb nb-table nb-sd'
              columns={paymentColumns}
              data={rows}
              emptyMessage={t('transactionPage.emptyPage')}
            />
            <Pagination
              className='nb nb-pagination'
              page={page}
              totalPage={data?.meta?.total_page}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
