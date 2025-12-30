import { CreateCategoryModal } from '@/components/Category/ModalAddCategory'
import { DashboardLayout } from '@/components/dashboard-layout'
import ErrorComponent from '@/components/error'
import TableSkeleton from '@/components/loading'
import { DataTable } from '@/components/table-data'
import { useGetCategories } from '@/hooks/useCategory'
import { categoryColumns } from '@/tables/table-category'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function CategoryPage() {
  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetCategories()

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(`Berhasil memuat kategori`)
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Gagal memuat kategori')
    }
  }, [isSuccess, isError])

  return (
    <DashboardLayout>
      <div className="flex justify-end mb-4">
        <CreateCategoryModal />
      </div>
      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load categories" />}
      {isSuccess && <DataTable columns={categoryColumns} data={data?.data ?? []} />}
    </DashboardLayout>
  )
}
