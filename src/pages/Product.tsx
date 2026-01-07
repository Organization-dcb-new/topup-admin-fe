import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import TableSkeleton from '@/components/Layout/loading'
import { DataTable } from '@/components/Layout/table-data'
import { useGetProducts } from '@/hooks/useProduct'
import { productColumns } from '@/tables/table-product'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ProductsSearchInput from '@/components/Product/SearchProduct'
import { useDebounce } from '@/hooks/useDebounce'

export default function ProductPage() {
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  const [page, setPage] = useState(1)
  const limit = 25
  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetProducts(
    page,
    limit,
    search,
    isActive
  )

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(`Success Load  Products`)
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Failed Load  Products')
    }
  }, [isSuccess, isError])
  return (
    <DashboardLayout>
      <div className="mb-4 flex justify-between">
        <ProductsSearchInput
          search={search}
          isActive={isActive}
          onSearchChange={setSearch}
          onActiveChange={setIsActive}
        />
      </div>
      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load Products" />}
      {isSuccess && (
        <>
          <DataTable columns={productColumns} data={data?.data ?? []} />

          {/* Pagination */}
          <Pagination page={page} totalPage={data?.meta?.total_page} onChange={setPage} />
        </>
      )}{' '}
    </DashboardLayout>
  )
}
