import { CreateCategoryProductModal } from '@/components/CategoryProduct/CreateCategoryProduct'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import TableSkeleton from '@/components/Layout/loading'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { useGetCategoryProduct } from '@/hooks/useCategoryProduct'
import { categoryProductColumn } from '@/tables/table-category-product'
import { useState } from 'react'

export default function CategoryProduct() {
  const limit = 10
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isSuccess } = useGetCategoryProduct(page, limit)
  return (
    <DashboardLayout>
      <div className="flex justify-end mb-4">
        <CreateCategoryProductModal />
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load categories Product" />}
      {isSuccess && (
        <>
          <DataTable
            renderSubRow={(row) => (
              <div className="pl-6">
                <p className="font-semibold mb-2">Games</p>
                <ul className="list-disc pl-4 space-y-1">
                  {row.product?.map((p) => (
                    <li key={p.id}>{p.name}</li>
                  ))}
                </ul>
              </div>
            )}
            columns={categoryProductColumn}
            data={data?.data ?? []}
          />{' '}
          <Pagination page={page} totalPage={data?.meta?.total_page} onChange={setPage} />
        </>
      )}
    </DashboardLayout>
  )
}
