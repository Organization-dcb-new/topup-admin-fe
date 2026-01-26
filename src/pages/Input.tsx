import GameInputSearchInput from '@/components/Inputs/SearchInput'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import TableSkeleton from '@/components/Layout/loading'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetGameInputs } from '@/hooks/useGameInput'
import { inputCollumn } from '@/tables/table-input'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function InputPages() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const { data, isSuccess, isFetchedAfterMount, isError, isLoading } = useGetGameInputs(
    search,
    page,
    limit,
    'all'
  )

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(`Success Load Game Input`)
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Failed Load Game Input')
    }
  }, [isSuccess, isError])

  return (
    <DashboardLayout>
      <div className="mb-4 flex justify-between">
        <GameInputSearchInput onChange={setSearch} value={search} />
      </div>
      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load Games Input" />}
      {isSuccess && (
        <>
          <DataTable columns={inputCollumn} data={data?.data ?? []} />
          <Pagination page={page} totalPage={data?.meta?.total_page ?? 1} onChange={setPage} />
        </>
      )}
    </DashboardLayout>
  )
}
