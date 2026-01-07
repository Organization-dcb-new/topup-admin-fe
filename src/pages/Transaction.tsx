import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import TableSkeleton from '@/components/Layout/loading'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import TransactionSearchInput from '@/components/Transaction/SearchTransaction'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetTransactions } from '@/hooks/useTransaction'
import { paymentColumns } from '@/tables/table-transaction'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function TransactionPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const limit = 20
  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetTransactions(
    page,
    limit,
    search
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
      <div className="mb-4 flex justify-between">
        <TransactionSearchInput value={search} onChange={setSearch} />
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
