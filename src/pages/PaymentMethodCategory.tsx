import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import TableSkeleton from '@/components/Layout/loading'
import { DataTable } from '@/components/Layout/table-data'
import { CreatePaymentCategoryModal } from '@/components/PaymentMethodCategory/Create'
import { useGetPaymentMethodCategory } from '@/hooks/usePaymentMethodCategory'
import { paymentMethodCategoriesColumns } from '@/tables/table-payment-category'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function PaymentMethodCategoryPage() {
  const { data, isLoading, isError, isFetchedAfterMount, isSuccess } = useGetPaymentMethodCategory()

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(`Success Load Payment Method Category`)
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Failed Load Payment Method Category')
    }
  }, [isSuccess, isError])

  return (
    <DashboardLayout>
      <div className="flex mb-5 justify-end">
        <CreatePaymentCategoryModal />
      </div>
      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load Payment Method Category" />}
      {isSuccess && (
        <>
          <DataTable columns={paymentMethodCategoriesColumns} data={data?.data ?? []} />
        </>
      )}
    </DashboardLayout>
  )
}
