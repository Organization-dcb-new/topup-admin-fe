import { DashboardLayout } from '@/components/dashboard-layout'
import ErrorComponent from '@/components/error'
import TableSkeleton from '@/components/loading'
import { DataTable } from '@/components/table-data'
import { useGetGames } from '@/hooks/useGame'
import { gameColumns } from '@/tables/table-game'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function GamePage() {
  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetGames()

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
      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load categories" />}
      {isSuccess && <DataTable columns={gameColumns} data={data?.data ?? []} />}
    </DashboardLayout>
  )
}
