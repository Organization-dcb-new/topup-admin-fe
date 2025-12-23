import { DashboardLayout } from '@/components/dashboard-layout'
import { DataTable } from '@/components/table-data'
import { useCategories } from '@/hooks/useCategory'
import { categoryColumns } from '@/tables/table-category'

export default function CategoryPage() {
  const { data, isLoading, isError } = useCategories()

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Failed to load categories</div>

  return (
    <DashboardLayout>
      <DataTable columns={categoryColumns} data={data?.data ?? []} />
    </DashboardLayout>
  )
}
