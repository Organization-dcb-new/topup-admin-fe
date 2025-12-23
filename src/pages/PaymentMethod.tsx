import { DashboardLayout } from '@/components/dashboard-layout'
import { DataTable } from '@/components/table-data'
import { usePaymentMethods } from '@/hooks/usePaymentMethod'
import { paymentMethodColumns } from '@/tables/table-payment-method'

export default function PaymentMethodPage() {
  const { data, isLoading, isError } = usePaymentMethods()

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Failed to load payment methods</div>

  return (
    <DashboardLayout>
      <DataTable columns={paymentMethodColumns} data={data?.data ?? []} />
    </DashboardLayout>
  )
}
