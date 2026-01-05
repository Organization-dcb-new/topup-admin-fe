import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import TableSkeleton from '@/components/Layout/loading'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import ModalAddPaymentMethod from '@/components/PaymentMethod/CreatePaymentMethodModal'
import { useGetPaymentMethods } from '@/hooks/usePaymentMethod'
import { paymentMethodColumns } from '@/tables/table-payment-method'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function PaymentMethodPage() {
  const limit = 5
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetchedAfterMount, isSuccess } = useGetPaymentMethods(
    page,
    limit
  )

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(`Success Load Payment Method`)
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Failed Load Payment Method')
    }
  }, [isSuccess, isError])

  return (
    <DashboardLayout>
      <div className="flex mb-5 justify-end">
        <ModalAddPaymentMethod />
      </div>
      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load Payment Method" />}
      {isSuccess &&  (
        <>
         <DataTable columns={paymentMethodColumns} data={data?.data ?? []} />
         <Pagination page={page} totalPage={data?.meta?.total_page} onChange={setPage} />
        </>
      )}
    </DashboardLayout>
  )
}
