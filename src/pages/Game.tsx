import { DashboardLayout } from '@/components/dashboard-layout'
import { DataTable } from '@/components/table-data'
import { useGames } from '@/hooks/useGame'
import { gameColumns } from '@/tables/table-game'

export default function GamePage() {
  const { data, isLoading } = useGames()

  if (isLoading) return <div>Loading...</div>

  return (
    <DashboardLayout>
      <DataTable columns={gameColumns} data={data?.data ?? []} />
    </DashboardLayout>
  )
}
