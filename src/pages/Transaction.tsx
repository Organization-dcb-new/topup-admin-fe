import { DashboardLayout } from '@/components/dashboard-layout'
import ErrorComponent from '@/components/error'
import TableSkeleton from '@/components/loading'
import { DataTable } from '@/components/table-data'
import { useGetTransactions } from '@/hooks/useTransaction'
import { paymentColumns } from '@/tables/table-transaction'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function TransactionPage() {
  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetTransactions()

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(`Berhasil memuat Transactions`)
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Gagal memuat Transactions')
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
