import { DashboardLayout } from '@/components/dashboard-layout'
import ErrorComponent from '@/components/error'
import TableSkeleton from '@/components/loading'
import { DataTable } from '@/components/table-data'
import { useGetProducts } from '@/hooks/useProduct'
import { productColumns } from '@/tables/table-product'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetProducts()

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(`Berhasil memuat Products`)
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Gagal memuat Products')
    }
  }, [isSuccess, isError])
  return (
    <DashboardLayout>
      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load Products" />}
      {isSuccess && <DataTable columns={productColumns} data={data?.data ?? []} />}
    </DashboardLayout>
  )
}
