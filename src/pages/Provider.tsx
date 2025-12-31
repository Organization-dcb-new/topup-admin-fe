import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import TableSkeleton from '@/components/Layout/loading'
import { ProviderModal } from '@/components/Provider/ProviderModal'
import { DataTable } from '@/components/Layout/table-data'
import { Button } from '@/components/ui/button'
import { useCreateProvider, useGetProvider, useUpdateProvider } from '@/hooks/useProvider'
import { providerColumns } from '@/tables/table-provider'
import type { Provider } from '@/types/provider'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function ProviderPages() {
  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetProvider()
  const createMutation = useCreateProvider()
  const updateMutation = useUpdateProvider()

  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selected, setSelected] = useState<Provider | null>(null)

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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Provider</h1>
          <Button onClick={() => setOpenCreate(true)}>+ Add Provider</Button>
        </div>

        {isLoading && <TableSkeleton />}
        {isError && <ErrorComponent message="Failed to load providers" />}
        {isSuccess && (
          <DataTable
            columns={providerColumns({
              onEdit: (provider: any) => {
                setSelected(provider)
                setOpenEdit(true)
              },
            })}
            data={data?.data ?? []}
          />
        )}
      </div>

      {/* CREATE */}
      <ProviderModal
        open={openCreate}
        title="Create Provider"
        onClose={() => setOpenCreate(false)}
        onSubmit={(payload) => createMutation.mutateAsync(payload)}
      />

      {/* EDIT */}
      <ProviderModal
        open={openEdit}
        title="Edit Provider"
        onClose={() => {
          setOpenEdit(false)
          setSelected(null)
        }}
        defaultValues={
          selected
            ? {
                name: selected.name,
                code: selected.code,
                api_url: selected.api_url,
                api_key_encrypted: '',
                priority: selected.priority,
                config: JSON.stringify(selected.config),
              }
            : undefined
        }
        onSubmit={(payload) =>
          updateMutation.mutateAsync({
            id: selected!.id,
            payload,
          })
        }
      />
    </DashboardLayout>
  )
}
