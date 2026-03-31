import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import TableSkeleton from '@/components/Layout/loading'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import TransactionDateFilter from '@/components/Transaction/TransactionDateFilter'
import TransactionSearchInput from '@/components/Transaction/SearchTransaction'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetTransactions } from '@/hooks/useTransaction'
import { paymentColumns } from '@/tables/table-transaction'
import type { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
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
    endDate
  )

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(`Success Load Transactions`)
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Failed Load Transactions')
    }
  }, [isSuccess, isError])
  return (
    <DashboardLayout>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <TransactionSearchInput value={search} onChange={setSearch} />
          <TransactionDateFilter date={dateRange} onChange={setDateRange} />
        </div>
      </div>
      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load Transactions" />}
      {isSuccess && (
        <>
          <DataTable columns={paymentColumns} data={data?.data ?? []} />
          <Pagination page={page} totalPage={data?.meta?.total_page} onChange={setPage} />
        </>
      )}
    </DashboardLayout>
  )
}
