import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { DataTable } from '@/components/Layout/table-data'
import { CreateShowModal } from '@/components/Show/CreateShowModal'
import { useGetShows } from '@/hooks/useShow'
import { showColumns } from '@/tables/table-show'

export default function ShowPage() {
  const { data } = useGetShows()
  return (
    <DashboardLayout>
      <div className='flex justify-end mb-5'>
        <CreateShowModal />
      </div>
      <DataTable
        renderSubRow={(row) => (
          <div className="pl-6">
            <p className="font-semibold mb-2">Games</p>
            <ul className="list-disc pl-4 space-y-1">
              {row.Games?.map((g) => (
                <li key={g.ID}>{g.Name}</li>
              ))}
            </ul>
          </div>
        )}
        columns={showColumns}
        data={data?.data ?? []}
      />{' '}
    </DashboardLayout>
  )
}
