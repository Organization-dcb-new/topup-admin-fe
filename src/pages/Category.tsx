import CategoriesSearchInput from '@/components/Category/components/Search'
import { CreateCategoryModal } from '@/components/Category/ModalAddCategory'
import { DashboardLayout } from '@/components/dashboard-layout'
import ErrorComponent from '@/components/error'
import TableSkeleton from '@/components/loading'
import Pagination from '@/components/Pagination'
import { DataTable } from '@/components/table-data'
import { useGetCategories } from '@/hooks/useCategory'
import { useDebounce } from '@/hooks/useDebounce'
import { categoryColumns } from '@/tables/table-category'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function CategoryPage() {
  const limit = 6
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetCategories(
    page,
    limit,
    debouncedSearch
  )

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

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
      <div className="flex justify-between mb-4">
        <CategoriesSearchInput value={search} onChange={setSearch} />

        <CreateCategoryModal />
      </div>
      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load categories" />}
      {isSuccess && (
        <>
          <DataTable columns={categoryColumns} data={data?.data ?? []} />{' '}
          <Pagination page={page} totalPage={data?.meta?.total_page} onChange={setPage} />
        </>
      )}
    </DashboardLayout>
  )
}
