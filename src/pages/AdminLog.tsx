import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { useGetAdminLogs } from '@/hooks/useAdminLog'
import { getAdminLogColumns } from '@/tables/table-admin-log'
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
import { ClipboardList, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function AdminLogPage() {
  const { t, i18n } = useTranslation('common')
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, isError, isSuccess } = useGetAdminLogs(page, limit)
  const columns = useMemo(() => getAdminLogColumns(t), [t])

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
            <span className={cn(nbPageIcon, nbAccent.cyan)}>
              <ClipboardList className='h-5 w-5' strokeWidth={2.5} aria-hidden />
            </span>
            <div className='min-w-0 space-y-1.5'>
              <h1 className={nbPageTitle}>{t('adminLogPage.title')}</h1>
              <p className={nbPageSubtitle}>{t('adminLogPage.subtitle')}</p>
            </div>
          </div>
          <p className={cn(nbTag, nbAccent.lime, 'shrink-0')}>
            <span className='tabular-nums'>
              {t('adminLogPage.total', {
                total: (data?.meta?.total_data ?? 0).toLocaleString(
                  i18n.language.startsWith('id') ? 'id-ID' : 'en-US',
                ),
              })}
            </span>
          </p>
        </div>

        <div className={cn(nbPanel, 'p-3 sm:p-4')}>
          <h2 className={nbSectionTitle}>{t('adminLogPage.listTitle')}</h2>
          <p className={cn('mt-0.5', nbHint)}>{t('adminLogPage.listHint')}</p>
        </div>

        {isLoading && (
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
              <p className={nbSectionTitle}>{t('adminLogPage.loadingBody')}</p>
              <p className={cn('mt-1', nbHint)}>{t('adminLogPage.pleaseWait')}</p>
            </div>
          </div>
        )}

        {isError && (
          <div className={nbPanel}>
            <ErrorComponent message={t('adminLogPage.loadError')} />
          </div>
        )}

        {isSuccess && (
          <>
            <DataTable
              className={nbTable}
              getRowId={(row) => String(row.ID)}
              columns={columns}
              data={data?.data ?? []}
              emptyMessage={t('adminLogPage.emptyMessage')}
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
