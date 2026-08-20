import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import { DataTable } from '@/components/Layout/table-data'
import { CreatePaymentCategoryModal } from '@/components/PaymentMethodCategory/Create'
import {
  pmCard,
  pmPageIcon,
  pmPageTitle,
  pmStatusTag,
} from '@/components/PaymentMethod/styles'
import { useGetPaymentMethodCategory } from '@/hooks/usePaymentMethodCategory'
import { getPaymentMethodCategoriesColumns } from '@/tables/table-payment-category'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Layers, Loader2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function PaymentMethodCategoryPage() {
  const { t, i18n } = useTranslation('common')
  const { data, isLoading, isError, isFetchedAfterMount, isSuccess } = useGetPaymentMethodCategory()
  const paymentMethodCategoriesColumns = useMemo(() => getPaymentMethodCategoriesColumns(t), [t])

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(t('paymentMethodCategoryToasts.loadSuccess'))
    }
    if (isError && isFetchedAfterMount) {
      toast.error(t('paymentMethodCategoryToasts.loadError'))
    }
  }, [isSuccess, isError, isFetchedAfterMount, t])

  const rows = useMemo(
    () => [...(data?.data ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    [data?.data]
  )

  return (
    <DashboardLayout>
      <div className='mx-auto min-w-0 max-w-7xl space-y-5'>
        <div
          className={cn(
            pmCard,
            'flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5',
          )}
        >
          <div className='flex gap-3'>
            <span className={cn(pmPageIcon, 'bg-[#ff9ed2]')}>
              <Layers className='h-5 w-5' strokeWidth={2.5} aria-hidden />
            </span>
            <div className='min-w-0 space-y-1.5'>
              <h1 className={pmPageTitle}>{t('paymentMethodCategoryPage.title')}</h1>
              <p className='text-xs font-bold leading-relaxed text-[#111]/60'>
                {t('paymentMethodCategoryPage.subtitle')}
              </p>
            </div>
          </div>

          <div className='flex shrink-0 sm:justify-end'>
            {isLoading && (
              <p className={cn(pmStatusTag, 'bg-[#6fe3f5]')}>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                {t('paymentMethodCategoryPage.loadingShort')}
              </p>
            )}
            {isError && (
              <p className={cn(pmStatusTag, 'bg-[#ff4d3d]')}>
                <AlertCircle className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                {t('paymentMethodCategoryPage.errorShort')}
              </p>
            )}
            {isSuccess && (
              <p className={cn(pmStatusTag, 'bg-[#c9f24d]')}>
                <CheckCircle2 className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                <span className='tabular-nums'>
                  {t('paymentMethodCategoryPage.total', {
                    total: rows.length.toLocaleString(i18n.language.startsWith('id') ? 'id-ID' : 'en-US'),
                  })}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Toolbar daftar */}
        <div
          className={cn(
            pmCard,
            'flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4',
          )}
        >
          <div className='min-w-0 space-y-1'>
            <h2 className='text-sm font-black uppercase tracking-tight'>
              {t('paymentMethodCategoryPage.listTitle')}
            </h2>
            <p className='inline-block bg-[#ffd84d] px-1.5 py-0.5 text-xs font-bold'>
              {t('paymentMethodCategoryPage.listHint')}
            </p>
          </div>
          <CreatePaymentCategoryModal />
        </div>

        {isLoading && (
          <div
            className={cn(
              pmCard,
              'flex min-h-[16rem] flex-col items-center justify-center gap-4 py-12',
            )}
            role='status'
            aria-live='polite'
            aria-busy='true'
          >
            <span className='nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center bg-[#6fe3f5]'>
              <Loader2 className='h-7 w-7 animate-spin' strokeWidth={3} aria-hidden />
            </span>
            <div className='text-center'>
              <p className='text-sm font-black uppercase tracking-tight'>
                {t('paymentMethodCategoryPage.loadingBody')}
              </p>
              <p className='mt-1 text-xs font-bold text-[#111]/70'>
                {t('paymentMethodCategoryPage.pleaseWait')}
              </p>
            </div>
          </div>
        )}

        {isError && (
          <div className={pmCard}>
            <ErrorComponent message={t('paymentMethodCategoryPage.errorMessage')} />
          </div>
        )}

        {isSuccess && (
          <DataTable
            className='nb nb-table nb-sd'
            columns={paymentMethodCategoriesColumns}
            data={rows}
            emptyMessage={t('paymentMethodCategoryPage.emptyMessage')}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
