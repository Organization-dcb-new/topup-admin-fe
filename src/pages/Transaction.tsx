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
import { useDebounce } from '@/hooks/useDebounce'
import { useGetTransactions } from '@/hooks/useTransaction'
import { paymentColumns } from '@/tables/table-transaction'
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
import toast from 'react-hot-toast'

const TX_LIST_TOAST_ID = 'transactions-list'

export default function TransactionPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [gameId, setGameId] = useState('')
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | Payment['status']>('')
  const [minAmountFilter, setMinAmountFilter] = useState('')
  const [maxAmountFilter, setMaxAmountFilter] = useState('')
  const [exactAmountFilter, setExactAmountFilter] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(true)

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
  )

  useEffect(() => {
    if (isPending) {
      toast.loading('Memuat transaksi…', { id: TX_LIST_TOAST_ID })
      return
    }

    if (!isFetchedAfterMount) return

    if (isError) {
      toast.error('Gagal memuat transaksi', { id: TX_LIST_TOAST_ID })
      return
    }

    if (isSuccess) {
      toast.success('Berhasil memuat transaksi', { id: TX_LIST_TOAST_ID })
    }
  }, [isPending, isFetchedAfterMount, isSuccess, isError])

  const rows = data?.data ?? []

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

  return (
    <DashboardLayout>
      <div className="mx-auto min-w-0 max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Receipt className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Transaksi</h1>
              <p className="text-sm text-muted-foreground">
                Cari dan saring pembayaran; paginasi {limit} baris per halaman.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 sm:text-right">
            {isLoading && (
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
                Memuat…
              </p>
            )}
            {isError && (
              <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                Gagal memuat
              </p>
            )}
            {isSuccess && (
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                <span className="tabular-nums text-foreground">
                  Total {(data?.meta?.total_data ?? 0).toLocaleString('id-ID')} transaksi
                </span>
              </p>
            )}
          </div>
        </div>

        <section
          className="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-gray-900/5"
          aria-label="Filter transaksi"
        >
          <div
            className={cn(
              'flex flex-col gap-2 bg-muted/25 p-2 sm:flex-row sm:items-center sm:gap-3 sm:p-2 sm:pl-3 sm:pr-4',
              filtersOpen && 'border-b border-gray-100',
            )}
          >
            <button
              type="button"
              id="tx-filters-toggle"
              className="flex min-h-10 min-w-0 flex-1 items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted/50 sm:px-4"
              aria-expanded={filtersOpen}
              aria-controls="tx-filters-panel"
              onClick={() => setFiltersOpen((o) => !o)}
            >
              <span className="flex min-w-0 items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="text-sm font-semibold text-gray-900">Filter</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {filtersOpen ? 'Klik untuk menutup' : 'Klik untuk membuka'}
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0 shadow-xs sm:self-center"
              disabled={!hasActiveFilters}
              onClick={resetFilters}
              aria-label="Reset semua filter"
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" aria-hidden />
              Reset filter
            </Button>
          </div>
          <div
            id="tx-filters-panel"
            role="region"
            aria-labelledby="tx-filters-toggle"
            hidden={!filtersOpen}
            className="min-w-0"
          >
            <div className="min-w-0 px-4 py-5 sm:px-6 sm:py-6">
              <div className="flex flex-col gap-8">
                <div className="space-y-2">
                  <Label
                    htmlFor="tx-filter-search"
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Pencarian
                  </Label>
                  <TransactionSearchInput
                    id="tx-filter-search"
                    value={search}
                    onChange={setSearch}
                  />
                </div>

                <div className="h-px bg-border/70" aria-hidden />

                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Waktu, game, metode & status
                  </p>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Rentang tanggal & waktu
                      </Label>
                      <TransactionDateFilter date={dateRange} onChange={setDateRange} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Game</Label>
                      <TransactionGameFilter value={gameId} onChange={setGameId} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Metode pembayaran
                      </Label>
                      <TransactionPaymentMethodFilter
                        value={paymentMethodId}
                        onChange={setPaymentMethodId}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                      <TransactionStatusFilter value={statusFilter} onChange={setStatusFilter} />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border/70" aria-hidden />

                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Nominal transaksi
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

        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
          <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
            <div className="min-w-0 space-y-0.5">
              <h2 className="text-sm font-semibold text-gray-900">Daftar transaksi</h2>
              <p className="text-xs text-muted-foreground">
                Filter nominal mendukung batas bawah (≥), batas atas (≤), dan nilai tepat (=).
              </p>
            </div>
          </div>

          <div className="min-w-0 p-3 sm:p-4">
            {isLoading && (
              <div
                className="flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/80 bg-muted/20 py-12"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <Loader2 className="h-11 w-11 animate-spin text-primary" aria-hidden />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Memuat transaksi…</p>
                  <p className="mt-1 text-xs text-muted-foreground">Mohon tunggu sebentar.</p>
                </div>
              </div>
            )}

            {isError && (
              <ErrorComponent message="Gagal memuat transaksi. Periksa koneksi atau coba muat ulang halaman." />
            )}

            {isSuccess && (
              <>
                <div className="max-h-[min(70vh,40rem)] min-w-0 w-full overflow-auto overscroll-contain">
                  <DataTable
                    columns={paymentColumns}
                    data={rows}
                    emptyMessage="Tidak ada transaksi pada halaman ini."
                  />
                </div>
                <div className="mt-4">
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
