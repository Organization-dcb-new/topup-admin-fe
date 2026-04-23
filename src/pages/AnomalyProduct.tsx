import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { useGetProductAnomaly } from '@/hooks/useProduct'
import { getAnomalyProductColumns } from '@/tables/table-anomaly-product'
import i18n from '@/i18n'
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function AnomalyProduct() {
  const { t } = useTranslation('common')
  const [page, setPage] = useState(1)
  const limit = 25
  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetProductAnomaly(
    page,
    limit,
  )

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(t('anomalyProductPage.toastSuccess'))
    }
    if (isError && isFetchedAfterMount) {
      toast.error(t('anomalyProductPage.toastError'))
    }
  }, [isSuccess, isError, isFetchedAfterMount, t])

  const rows = data?.data ?? []
  const anomalyProductTable = useMemo(() => getAnomalyProductColumns(t), [t])

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex gap-3'>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-500'>
              <AlertTriangle className='h-5 w-5' aria-hidden />
            </div>
            <div className='min-w-0 space-y-1'>
              <h1 className='text-2xl font-semibold tracking-tight text-gray-900'>{t('anomalyProductPage.title')}</h1>
              <p className='text-sm text-muted-foreground'>{t('anomalyProductPage.subtitle')}</p>
            </div>
          </div>
          <div className='flex flex-col items-end gap-1 sm:text-right'>
            {isLoading && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin text-primary' aria-hidden />
                {t('anomalyProductPage.loadingShort')}
              </p>
            )}
            {isError && (
              <p className='flex items-center gap-2 text-sm font-medium text-destructive'>
                <AlertCircle className='h-4 w-4 shrink-0' aria-hidden />
                {t('anomalyProductPage.loadFailedShort')}
              </p>
            )}
            {isSuccess && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <CheckCircle2 className='h-4 w-4 shrink-0 text-emerald-600' aria-hidden />
                <span className='tabular-nums text-foreground'>
                  {t('anomalyProductPage.totalEntries', {
                    count: (data?.meta?.total_data ?? 0).toLocaleString(
                      i18n.language.startsWith('id') ? 'id-ID' : 'en-US',
                    ),
                  })}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className='overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5'>
          <div className='flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
            <div className='min-w-0 space-y-0.5'>
              <h2 className='text-sm font-semibold text-gray-900'>{t('anomalyProductPage.listTitle')}</h2>
              <p className='text-xs text-muted-foreground'>
                {t('anomalyProductPage.listHint', { limit })}
              </p>
            </div>
          </div>

          <div className='p-3 sm:p-4'>
            {isLoading && (
              <div
                className='flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/80 bg-muted/20 py-12'
                role='status'
                aria-live='polite'
                aria-busy='true'
              >
                <Loader2 className='h-11 w-11 animate-spin text-primary' aria-hidden />
                <div className='text-center'>
                  <p className='text-sm font-medium text-foreground'>{t('anomalyProductPage.tableLoadingTitle')}</p>
                  <p className='mt-1 text-xs text-muted-foreground'>{t('anomalyProductPage.tableLoadingHint')}</p>
                </div>
              </div>
            )}

            {isError && (
              <ErrorComponent message={t('anomalyProductPage.loadErrorDetail')} />
            )}

            {isSuccess && (
              <>
                <div className='max-h-[min(70vh,40rem)] overflow-y-auto overflow-x-auto overscroll-contain'>
                  <DataTable
                    columns={anomalyProductTable}
                    data={rows}
                    emptyMessage={t('anomalyProductPage.emptyPage')}
                  />
                </div>
                <div className='mt-4'>
                  <Pagination
                    page={page}
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
