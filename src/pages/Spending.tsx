import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import TableSkeleton from '@/components/Layout/loading'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import SummaryCard from '@/components/Spending/Summary'
import { useGetSpending } from '@/hooks/useSpending'
import { spendingColumns } from '@/tables/table-spending'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function SpendingPages() {
  const [page, setPage] = useState(1)
  const limit = 10
  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetSpending(page, limit)

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(`Success Load Spending`)
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Failed Load Spending')
    }
  }, [isSuccess, isError])

  return (
    <DashboardLayout>
      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load Spending" />}
      {isSuccess && (
        <div className='flex flex-col gap-3'>
          <div className='w-full'>
            <SummaryCard summary={data.data} />
          </div>

          <DataTable columns={spendingColumns} data={data?.data?.spending_data ?? []} />
          <Pagination page={page} totalPage={data?.meta?.total_page} onChange={setPage} />
        </div>
      )}
    </DashboardLayout>
  )
}
