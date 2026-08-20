import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import { DataTable } from '@/components/Layout/table-data'
import { CreateMaintenanceModal } from '@/components/Maintenance/CreateMaintenanceModal'
import { useGetMaintenances } from '@/hooks/useMaintenance'
import { getMaintenanceColumns } from '@/tables/table-maintenance'
import {
  nbAccent,
  nbHint,
  nbPageIcon,
  nbPageSubtitle,
  nbPageTitle,
  nbPanel,
  nbSectionTitle,
  nbTable,
  nbTag,
} from '@/lib/nb'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Construction, Loader2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

/** Label status di sisi kanan judul halaman. */
function StatusTag({ accent, children }: { accent: string; children: React.ReactNode }) {
  return <p className={cn(nbTag, accent)}>{children}</p>
}

export default function MaintenancePage() {
  const { t, i18n } = useTranslation('common')
  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetMaintenances()
  const rows = data?.data ?? []
  const maintenanceColumns = useMemo(() => getMaintenanceColumns(t), [t])

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(t('maintenanceToasts.loadSuccess'))
    }
    if (isError && isFetchedAfterMount) {
      toast.error(t('maintenanceToasts.loadError'))
    }
  }, [isSuccess, isError, isFetchedAfterMount, t])

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
            <span className={cn(nbPageIcon, nbAccent.orange)}>
              <Construction className='h-5 w-5' strokeWidth={2.5} aria-hidden />
            </span>
            <div className='min-w-0 space-y-1.5'>
              <h1 className={nbPageTitle}>{t('maintenancePage.title')}</h1>
              <p className={nbPageSubtitle}>{t('maintenancePage.subtitle')}</p>
            </div>
          </div>

          <div className='flex shrink-0 sm:justify-end'>
            {isLoading && (
              <StatusTag accent={nbAccent.cyan}>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                {t('maintenancePage.loadingShort')}
              </StatusTag>
            )}
            {isError && (
              <StatusTag accent={nbAccent.red}>
                <AlertCircle className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                {t('maintenancePage.errorShort')}
              </StatusTag>
            )}
            {isSuccess && (
              <StatusTag accent={nbAccent.lime}>
                <CheckCircle2 className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                <span className='tabular-nums'>
                  {t('maintenancePage.total', {
                    total: rows.length.toLocaleString(
                      i18n.language.startsWith('id') ? 'id-ID' : 'en-US',
                    ),
                  })}
                </span>
              </StatusTag>
            )}
          </div>
        </div>

        <div
          className={cn(
            nbPanel,
            'flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4',
          )}
        >
          <div className='min-w-0'>
            <h2 className={nbSectionTitle}>{t('maintenancePage.listTitle')}</h2>
            <p className={cn('mt-0.5', nbHint)}>{t('maintenancePage.listHint')}</p>
          </div>
          <CreateMaintenanceModal />
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
              <p className={nbSectionTitle}>{t('maintenancePage.loadingBody')}</p>
              <p className={cn('mt-1', nbHint)}>{t('maintenancePage.pleaseWait')}</p>
            </div>
          </div>
        )}

        {isError && (
          <div className={nbPanel}>
            <ErrorComponent message={t('maintenancePage.errorMessage')} />
          </div>
        )}

        {isSuccess && (
          <DataTable
            className={nbTable}
            getRowId={(row) => row.id}
            columns={maintenanceColumns}
            data={rows}
            emptyMessage={t('maintenancePage.emptyMessage')}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
