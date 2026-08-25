import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Plus, ShieldCheck } from 'lucide-react'

import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { DataTable } from '@/components/Layout/table-data'
import { Button } from '@/components/ui/button'
import { RoleForm } from '@/components/Role/RoleForm'
import { getRoleColumns } from '@/tables/table-role'
import { useRoles } from '@/hooks/useRoles'
import { usePermission } from '@/hooks/usePermission'
import { PERM } from '@/constants/permissions'
import type { Role } from '@/types/permission'

export default function RoleManagementPage() {
  const { t } = useTranslation('common')
  const { can } = usePermission()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)

  const { data: roles = [], isLoading } = useRoles()

  const canCreate = can(PERM.ROLE_CREATE)
  const canUpdate = can(PERM.ROLE_UPDATE)
  const canDelete = can(PERM.ROLE_DELETE)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (role: Role) => {
    setEditing(role)
    setFormOpen(true)
  }

  const columns = useMemo(
    () => getRoleColumns(t, openEdit, canUpdate, canDelete),
    [t, canUpdate, canDelete],
  )

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex gap-3'>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <ShieldCheck className='h-5 w-5' aria-hidden />
            </div>
            <div className='min-w-0 space-y-1'>
              <h1 className='text-2xl font-semibold tracking-tight text-gray-900'>
                {t('rolePage.title')}
              </h1>
              <p className='text-sm text-muted-foreground'>{t('rolePage.subtitle')}</p>
            </div>
          </div>
          <p className='text-sm font-medium tabular-nums text-muted-foreground sm:text-right'>
            {t('rolePage.total', { total: roles.length })}
          </p>
        </div>

        <div className='overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5'>
          <div className='flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
            <div className='min-w-0 space-y-0.5'>
              <h2 className='text-sm font-semibold text-gray-900'>{t('rolePage.listTitle')}</h2>
              <p className='text-xs text-muted-foreground'>{t('rolePage.listHint')}</p>
            </div>
            {canCreate && (
              <Button
                onClick={openCreate}
                className='w-full gap-2 rounded-xl font-semibold shadow-sm sm:w-auto'
              >
                <Plus className='h-4 w-4 shrink-0' aria-hidden />
                {t('rolePage.create')}
              </Button>
            )}
          </div>

          <div className='p-3 sm:p-4'>
            {isLoading ? (
              <div
                className='flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/80 bg-muted/20 py-12'
                role='status'
                aria-live='polite'
                aria-busy='true'
              >
                <Loader2 className='h-11 w-11 animate-spin text-primary' aria-hidden />
                <div className='text-center'>
                  <p className='text-sm font-medium text-foreground'>
                    {t('rolePage.loadingBody')}
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    {t('rolePage.pleaseWait')}
                  </p>
                </div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={roles}
                emptyMessage={t('rolePage.emptyMessage')}
              />
            )}
          </div>
        </div>
      </div>

      <RoleForm open={formOpen} onOpenChange={setFormOpen} role={editing} />
    </DashboardLayout>
  )
}
