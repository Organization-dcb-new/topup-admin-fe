import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import ModalAddPaymentMethod from '@/components/PaymentMethod/CreatePaymentMethodModal'
import {
  pmCard,
  pmPageIcon,
  pmPageTitle,
  pmStatusTag,
} from '@/components/PaymentMethod/styles'
import { useGetPaymentMethods } from '@/hooks/usePaymentMethod'
import { getPaymentMethodColumns } from '@/tables/table-payment-method'
import { cn } from '@/lib/utils'
import i18n from '@/i18n'
import { AlertCircle, CheckCircle2, CreditCard, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function PaymentMethodPage() {
  const { t } = useTranslation('common')
  const limit = 5
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetchedAfterMount, isSuccess } = useGetPaymentMethods(
    page,
    limit,
  )

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(t('paymentMethodPage.toastSuccess'))
    }
    if (isError && isFetchedAfterMount) {
      toast.error(t('paymentMethodPage.toastError'))
    }
  }, [isSuccess, isError, isFetchedAfterMount, t])

  const rows = data?.data ?? []
  const paymentMethodColumns = useMemo(() => getPaymentMethodColumns(t), [t])

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
            <span className={cn(pmPageIcon, 'bg-[#6fe3f5]')}>
              <CreditCard className='h-5 w-5' strokeWidth={2.5} aria-hidden />
            </span>
            <div className='min-w-0 space-y-1.5'>
              <h1 className={pmPageTitle}>{t('paymentMethodPage.title')}</h1>
              <p className='text-xs font-bold leading-relaxed text-[#111]/60'>
                {t('paymentMethodPage.subtitle')}
              </p>
            </div>
          </div>

          <div className='flex shrink-0 sm:justify-end'>
            {isLoading && (
              <p className={cn(pmStatusTag, 'bg-[#6fe3f5]')}>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                {t('paymentMethodPage.loadingShort')}
              </p>
            )}
            {isError && (
              <p className={cn(pmStatusTag, 'bg-[#ff4d3d]')}>
                <AlertCircle className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                {t('paymentMethodPage.loadFailedShort')}
              </p>
            )}
            {isSuccess && (
              <p className={cn(pmStatusTag, 'bg-[#c9f24d]')}>
                <CheckCircle2 className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                <span className='tabular-nums'>
                  {t('paymentMethodPage.totalMethods', {
                    count: (data?.meta?.total_data ?? 0).toLocaleString(
                      i18n.language.startsWith('id') ? 'id-ID' : 'en-US',
                    ),
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
              {t('paymentMethodPage.listTitle')}
            </h2>
            <p className='inline-block bg-[#ffd84d] px-1.5 py-0.5 text-xs font-bold'>
              {t('paymentMethodPage.listHint', { limit })}
            </p>
          </div>
          <ModalAddPaymentMethod />
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
                {t('paymentMethodPage.tableLoadingTitle')}
              </p>
              <p className='mt-1 text-xs font-bold text-[#111]/70'>
                {t('paymentMethodPage.tableLoadingHint')}
              </p>
            </div>
          </div>
        )}

        {isError && (
          <div className={pmCard}>
            <ErrorComponent message={t('paymentMethodPage.loadErrorDetail')} />
          </div>
        )}

        {isSuccess && (
          <>
            <DataTable
              className='nb nb-table nb-sd'
              columns={paymentMethodColumns}
              data={rows}
              emptyMessage={t('paymentMethodPage.emptyPage')}
            />
            <Pagination
              className='nb nb-pagination'
              page={page}
              totalPage={data?.meta?.total_page ?? 1}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
