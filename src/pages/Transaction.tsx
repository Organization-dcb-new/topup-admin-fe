import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import TableSkeleton from '@/components/Layout/loading'
import { DataTable } from '@/components/Layout/table-data'
import { useGetTransactions } from '@/hooks/useTransaction'
import { paymentColumns } from '@/tables/table-transaction'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function TransactionPage() {
  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetTransactions()

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
      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load Transactions" />}
      {isSuccess && <DataTable columns={paymentColumns} data={data?.data ?? []} />}
    </DashboardLayout>
  )
}
