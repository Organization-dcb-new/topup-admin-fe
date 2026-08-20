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
import {
  nbAccent,
  nbHint,
  nbPageIcon,
  nbPageSubtitle,
  nbPageTitle,
  nbPagination,
  nbPanel,
  nbSectionTitle,
  nbTable,
  nbTag,
} from '@/lib/nb'
import { cn } from '@/lib/utils'

export default function AdminManagementPage() {
  const { t, i18n } = useTranslation('common')
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useAdminData(page, limit)
  const adminColumns = useMemo(() => getAdminColumns(t), [t])

  return (
    <DashboardLayout>
      <div className='mx-auto min-w-0 max-w-7xl space-y-5'>
        <div
          className={cn(
            nbPanel,
            'flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5',
          )}
        >
          <div className='flex gap-3'>
            <span className={cn(nbPageIcon, nbAccent.pink)}>
              <UserCog className='h-5 w-5' strokeWidth={2.5} aria-hidden />
            </span>
            <div className='min-w-0 space-y-1.5'>
              <h1 className={nbPageTitle}>{t('adminPage.title')}</h1>
              <p className={nbPageSubtitle}>{t('adminPage.subtitle')}</p>
            </div>
          </div>
          <p className={cn(nbTag, nbAccent.lime, 'shrink-0')}>
            <span className='tabular-nums'>
              {t('adminPage.total', {
                total: (data?.meta?.total_data ?? 0).toLocaleString(
                  i18n.language.startsWith('id') ? 'id-ID' : 'en-US',
                ),
              })}
            </span>
          </p>
        </div>

        <div
          className={cn(
            nbPanel,
            'flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4',
          )}
        >
          <div className='min-w-0'>
            <h2 className={nbSectionTitle}>{t('adminPage.listTitle')}</h2>
            <p className={cn('mt-0.5', nbHint)}>{t('adminPage.listHint')}</p>
          </div>
          <CreateAdminModal />
        </div>

        {isLoading ? (
          <div
            className={cn(
              nbPanel,
              'flex min-h-[16rem] flex-col items-center justify-center gap-4 py-12',
            )}
            role='status'
            aria-live='polite'
            aria-busy='true'
          >
            <span
              className={cn(
                'nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center',
                nbAccent.cyan,
              )}
            >
              <Loader2 className='h-7 w-7 animate-spin' strokeWidth={3} aria-hidden />
            </span>
            <div className='text-center'>
              <p className={nbSectionTitle}>{t('adminPage.loadingBody')}</p>
              <p className={cn('mt-1', nbHint)}>{t('adminPage.pleaseWait')}</p>
            </div>
          </div>
        ) : (
          <>
            <DataTable
              className={nbTable}
              getRowId={(row) => row.id}
              columns={adminColumns}
              data={data?.data ?? []}
              emptyMessage={t('adminPage.emptyMessage')}
            />
            <Pagination
              className={nbPagination}
              page={data?.meta?.page ?? 1}
              totalPage={data?.meta?.total_page ?? 1}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
