import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import { DataTable } from '@/components/Layout/table-data'
import { CreateProviderModal } from '@/components/Provider/CreateProviderModal'
import { useGetProvider } from '@/hooks/useProvider'
import { getProviderColumns } from '@/tables/table-provider'
import i18n from '@/i18n'
import { AlertCircle, Building2, CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function ProviderPages() {
  const { t } = useTranslation('common')
  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetProvider()

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(t('providerPage.toastSuccess'))
    }
    if (isError && isFetchedAfterMount) {
      toast.error(t('providerPage.toastError'))
    }
  }, [isSuccess, isError, isFetchedAfterMount, t])

  const rows = data?.data ?? []
  const providerColumns = useMemo(() => getProviderColumns(t), [t])

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex gap-3'>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <Building2 className='h-5 w-5' aria-hidden />
            </div>
            <div className='min-w-0 space-y-1'>
              <h1 className='text-2xl font-semibold tracking-tight text-gray-900'>{t('providerPage.title')}</h1>
              <p className='text-sm text-muted-foreground'>{t('providerPage.subtitle')}</p>
            </div>
          </div>
          <div className='flex flex-col items-end gap-1 sm:text-right'>
            {isLoading && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin text-primary' aria-hidden />
                {t('providerPage.loadingShort')}
              </p>
            )}
            {isError && (
              <p className='flex items-center gap-2 text-sm font-medium text-destructive'>
                <AlertCircle className='h-4 w-4 shrink-0' aria-hidden />
                {t('providerPage.loadFailedShort')}
              </p>
            )}
            {isSuccess && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <CheckCircle2 className='h-4 w-4 shrink-0 text-emerald-600' aria-hidden />
                <span className='tabular-nums text-foreground'>
                  {t('providerPage.totalProviders', {
                    count: rows.length.toLocaleString(i18n.language.startsWith('id') ? 'id-ID' : 'en-US'),
                  })}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className='overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5'>
          <div className='flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
            <div className='min-w-0 space-y-0.5'>
              <h2 className='text-sm font-semibold text-gray-900'>{t('providerPage.listTitle')}</h2>
              <p className='text-xs text-muted-foreground'>
                {t('providerPage.listHint')}
              </p>
            </div>
            <CreateProviderModal />
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
                  <p className='text-sm font-medium text-foreground'>{t('providerPage.tableLoadingTitle')}</p>
                  <p className='mt-1 text-xs text-muted-foreground'>{t('providerPage.tableLoadingHint')}</p>
                </div>
              </div>
            )}

            {isError && (
              <ErrorComponent message={t('providerPage.loadErrorDetail')} />
            )}

            {isSuccess && (
              <div className='max-h-[min(70vh,40rem)] overflow-y-auto overflow-x-auto overscroll-contain'>
                <DataTable
                  columns={providerColumns}
                  data={rows}
                  emptyMessage={t('providerPage.emptyPage')}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
