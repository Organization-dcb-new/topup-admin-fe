import { DashboardLayout } from '@/components/dashboard-layout'
import { DataTable } from '@/components/table-data'
import { usePayments } from '@/hooks/useTransaction'
import { paymentColumns } from '@/tables/table-transaction'

export default function TransactionPage() {
  const { data, isLoading, isError } = usePayments()

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Failed to load payments</div>

  return (
    <DashboardLayout>
      <DataTable columns={paymentColumns} data={data?.data ?? []} />
    </DashboardLayout>
  )
}
