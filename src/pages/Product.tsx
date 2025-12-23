import { DashboardLayout } from '@/components/dashboard-layout'
import { DataTable } from '@/components/table-data'
import { useProducts } from '@/hooks/useProduct'
import { productColumns } from '@/tables/table-product'

export default function ProductPage() {
  const { data, isLoading, isError } = useProducts()

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Failed to load products</div>

  return (
    <DashboardLayout>
      <DataTable columns={productColumns} data={data?.data ?? []} />
    </DashboardLayout>
  )
}
