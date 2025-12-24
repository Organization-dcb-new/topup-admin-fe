import { DashboardLayout } from '@/components/dashboard-layout'
import ErrorComponent from '@/components/error'
import GameSearchInput from '@/components/Games/GameInput'
import GameImageModal from '@/components/Games/GameModal'
import Pagination from '@/components/Games/Pagination'
import TableSkeleton from '@/components/loading'
import { DataTable } from '@/components/table-data'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetGames } from '@/hooks/useGame'
import { gameColumns } from '@/tables/table-game'
import type { Game } from '@/types/game'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function GamePage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20
  const debouncedSearch = useDebounce(search, 500)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  const openModal = (game: Game) => {
    setSelectedGame(game)
  }

  const closeModal = () => {
    setSelectedGame(null)
  }

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const { data, isLoading, isError, isSuccess, isFetchedAfterMount, refetch } = useGetGames(
    debouncedSearch,
    page,
    limit
  )

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(`Berhasil memuat Game`)
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Gagal memuat Game')
    }
  }, [isSuccess, isError])

  return (
    <DashboardLayout>
      <div className="mb-4 flex justify-between">
        <GameSearchInput value={search} onChange={setSearch} />
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load categories" />}
      {isSuccess && (
        <>
          <DataTable columns={gameColumns(openModal)} data={data?.data ?? []} />
          <Pagination page={page} totalPage={data?.meta?.total_page} onChange={setPage} />
        </>
      )}
      <GameImageModal game={selectedGame} onClose={closeModal} onSuccess={() => refetch()} />
    </DashboardLayout>
  )
}
