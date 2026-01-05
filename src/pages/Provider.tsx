import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import TableSkeleton from '@/components/Layout/loading'
import { DataTable } from '@/components/Layout/table-data'
import { CreateProviderModal } from '@/components/Provider/ProviderModalAdd'
import { useGetProvider } from '@/hooks/useProvider'
import { providerColumns } from '@/tables/table-provider'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function ProviderPages() {
  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetProvider()

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success('Success Load Provider')
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Failed Load Provider')
    }
  }, [isSuccess, isError, isFetchedAfterMount])

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <CreateProviderModal />
        </div>

        {isLoading && <TableSkeleton />}
        {isError && <ErrorComponent message="Failed to load providers" />}
        {isSuccess && <DataTable columns={providerColumns()} data={data?.data ?? []} />}
      </div>
    </DashboardLayout>
  )
}
