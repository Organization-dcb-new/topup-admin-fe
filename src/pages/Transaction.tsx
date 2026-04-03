import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import TransactionDateFilter from '@/components/Transaction/TransactionDateFilter'
import TransactionSearchInput from '@/components/Transaction/SearchTransaction'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetTransactions } from '@/hooks/useTransaction'
import { paymentColumns } from '@/tables/table-transaction'
import { format } from 'date-fns'
import { AlertCircle, CheckCircle2, Loader2, Receipt } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

export default function TransactionPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const limit = 20
  const debouncedSearch = useDebounce(search, 500)

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
  }, [debouncedSearch, startDate, endDate])

  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetTransactions(
    page,
    limit,
    search,
    startDate,
    endDate,
  )

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success('Berhasil memuat transaksi')
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Gagal memuat transaksi')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- same deps as original (toast timing)
  }, [isSuccess, isError])

  const rows = data?.data ?? []

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
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

        <div className="flex flex-wrap items-center gap-3">
          <TransactionSearchInput value={search} onChange={setSearch} />
          <TransactionDateFilter date={dateRange} onChange={setDateRange} />
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
          <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
            <div className="min-w-0 space-y-0.5">
              <h2 className="text-sm font-semibold text-gray-900">Daftar transaksi</h2>
              <p className="text-xs text-muted-foreground">
                Filter tanggal mengirim rentang ke API; gunakan paginasi di bawah.
              </p>
            </div>
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
                <div className="max-h-[min(70vh,40rem)] overflow-auto overscroll-contain">
                  <DataTable
                    columns={paymentColumns}
                    data={rows}
                    emptyMessage="Tidak ada transaksi pada halaman ini."
                    stickyHeader
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
