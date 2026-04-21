import { useState } from 'react'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { DataTable } from '@/components/Layout/table-data'
import Pagination from '@/components/Layout/Pagination'
import { getAdminColumns } from '@/tables/table-admin'
import { UserCog, Loader2 } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminData } from '@/hooks/useAdmin'
import { CreateAdminModal } from '@/components/Admin/Create'

export default function AdminManagementPage() {
  const { t, i18n } = useTranslation('common')
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useAdminData(page, limit)
  const adminColumns = useMemo(() => getAdminColumns(t), [t])

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex gap-3'>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <UserCog className='h-5 w-5' aria-hidden />
            </div>
            <div className='min-w-0 space-y-1'>
              <h1 className='text-2xl font-semibold tracking-tight text-gray-900'>{t('adminPage.title')}</h1>
              <p className='text-sm text-muted-foreground'>
                {t('adminPage.subtitle')}
              </p>
            </div>
          </div>
          <p className='text-sm font-medium tabular-nums text-muted-foreground sm:text-right'>
            {t('adminPage.total', {
              total: (data?.meta?.total_data ?? 0).toLocaleString(
                i18n.language.startsWith('id') ? 'id-ID' : 'en-US',
              ),
            })}
          </p>
        </div>

        <div className='overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5'>
          <div className='flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
            <div className='min-w-0 space-y-0.5'>
              <h2 className='text-sm font-semibold text-gray-900'>{t('adminPage.listTitle')}</h2>
              <p className='text-xs text-muted-foreground'>
                {t('adminPage.listHint')}
              </p>
            </div>
            <CreateAdminModal />
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
                  <p className='text-sm font-medium text-foreground'>{t('adminPage.loadingBody')}</p>
                  <p className='mt-1 text-xs text-muted-foreground'>{t('adminPage.pleaseWait')}</p>
                </div>
              </div>
            ) : (
              <>
                <DataTable
                  columns={adminColumns}
                  data={data?.data ?? []}
                  emptyMessage={t('adminPage.emptyMessage')}
                />
                <div className='mt-4'>
                  <Pagination
                    page={data?.meta?.page ?? 1}
                    totalPage={data?.meta?.total_page ?? 1}
                    onChange={setPage}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
