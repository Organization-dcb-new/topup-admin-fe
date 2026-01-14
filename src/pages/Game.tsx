import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import GameSearchInput from '@/components/Games/SearchGame'
import Pagination from '@/components/Layout/Pagination'
import TableSkeleton from '@/components/Layout/loading'
import { DataTable } from '@/components/Layout/table-data'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetGames } from '@/hooks/useGame'
import { gameColumns } from '@/tables/table-game'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function GamePage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const limit = 20
  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetGames(
    debouncedSearch,
    page,
    limit
  )

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(`Success Load Game`)
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Failed Load Game')
    }
  }, [isSuccess, isError])

  return (
    <DashboardLayout>
      <div className="mb-4 flex justify-between">
        <GameSearchInput value={search} onChange={setSearch} />
        {/* <CreateGameModal /> */}
      </div>
      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load Games" />}
      {isSuccess && (
        <>
          <DataTable columns={gameColumns()} data={data?.data ?? []} />
          <Pagination page={page} totalPage={data?.meta?.total_page} onChange={setPage} />
        </>
      )}
    </DashboardLayout>
  )
}
