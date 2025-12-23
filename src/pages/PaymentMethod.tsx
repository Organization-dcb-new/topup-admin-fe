import { DashboardLayout } from '@/components/dashboard-layout'
import ErrorComponent from '@/components/error'
import TableSkeleton from '@/components/loading'
import { DataTable } from '@/components/table-data'
import { useGetPaymentMethods } from '@/hooks/usePaymentMethod'
import { paymentMethodColumns } from '@/tables/table-payment-method'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function PaymentMethodPage() {
  const { data, isLoading, isError, isFetchedAfterMount, isSuccess } = useGetPaymentMethods()

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(`Berhasil memuat Payment Method`)
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Gagal memuat Payment Method')
    }
  }, [isSuccess, isError])

  return (
    <DashboardLayout>
      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load Payment Method" />}
      {isSuccess && <DataTable columns={paymentMethodColumns} data={data?.data ?? []} />}
    </DashboardLayout>
  )
}
