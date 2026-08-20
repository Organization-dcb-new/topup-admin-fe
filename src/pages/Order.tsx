import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { useGetOrderItem } from '@/hooks/useOrderItem'
import { cn } from '@/lib/utils'
import { getOrderItemColumns } from '@/tables/table-order-item'
import { AlertCircle, CheckCircle2, ListOrdered, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

/** Label status di sisi kanan judul halaman. */
function StatusTag({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <p
      className={cn(
        'nb-frame nb-frame-thin nb-sd-sm inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-black uppercase tracking-[0.12em]',
        accent,
      )}
    >
      {children}
    </p>
  )
}

export default function OrderPages() {
  const { t } = useTranslation('common')
  const limit = 20
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetOrderItem(page, limit)

  useEffect(() => {
    setPage(1)
  }, [])

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(t('orderPage.toastSuccess'))
    }
    if (isError && isFetchedAfterMount) {
      toast.error(t('orderPage.toastError'))
    }
  }, [isSuccess, isError, isFetchedAfterMount, t])

  const rows = data?.data ?? []
  const orderItemColumns = useMemo(() => getOrderItemColumns(t), [t])

  return (
    <DashboardLayout>
      <div className='mx-auto min-w-0 max-w-7xl space-y-5'>
        <div className='nb-frame nb-frame-thick nb-sd flex flex-col gap-4 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5'>
          <div className='flex gap-3'>
            <span className='nb-frame nb-frame-thin nb-sd-sm flex h-12 w-12 shrink-0 items-center justify-center bg-[#ff9ed2]'>
              <ListOrdered className='h-5 w-5' strokeWidth={2.5} aria-hidden />
            </span>
            <div className='min-w-0 space-y-1.5'>
              <h1 className='text-2xl font-black uppercase leading-none tracking-tight'>
                {t('orderPage.title')}
              </h1>
              <p className='inline-block bg-[#ffd84d] px-1.5 py-0.5 text-xs font-bold'>
                {t('orderPage.subtitle', { limit })}
              </p>
            </div>
          </div>

          <div className='flex shrink-0 sm:justify-end'>
            {isLoading && (
              <StatusTag accent='bg-[#6fe3f5]'>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                {t('orderPage.loadingShort')}
              </StatusTag>
            )}
            {isError && (
              <StatusTag accent='bg-[#ff4d3d]'>
                <AlertCircle className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                {t('orderPage.loadFailedShort')}
              </StatusTag>
            )}
            {isSuccess && (
              <StatusTag accent='bg-[#c9f24d]'>
                <CheckCircle2 className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                <span className='tabular-nums'>
                  {t('orderPage.totalItems', {
                    count: (data?.meta?.total_data ?? 0).toLocaleString('id-ID'),
                  })}
                </span>
              </StatusTag>
            )}
          </div>
        </div>

        <div className='nb-frame nb-frame-thick nb-sd bg-white p-3 sm:p-4'>
          <h2 className='text-sm font-black uppercase tracking-tight'>
            {t('orderPage.listTitle')}
          </h2>
          <p className='mt-0.5 text-xs font-bold text-[#111]/70'>{t('orderPage.listHint')}</p>
        </div>

        {isLoading && (
          <div
            className='nb-frame nb-frame-thick nb-sd flex min-h-[16rem] flex-col items-center justify-center gap-4 bg-white py-12'
            role='status'
            aria-live='polite'
            aria-busy='true'
          >
            <span className='nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center bg-[#6fe3f5]'>
              <Loader2 className='h-7 w-7 animate-spin' strokeWidth={3} aria-hidden />
            </span>
            <div className='text-center'>
              <p className='text-sm font-black uppercase tracking-tight'>
                {t('orderPage.tableLoadingTitle')}
              </p>
              <p className='mt-1 text-xs font-bold text-[#111]/70'>
                {t('orderPage.tableLoadingHint')}
              </p>
            </div>
          </div>
        )}

        {isError && (
          <div className='nb-frame nb-frame-thick nb-sd bg-white'>
            <ErrorComponent message={t('orderPage.loadErrorDetail')} />
          </div>
        )}

        {isSuccess && (
          <>
            <DataTable
              className='nb nb-table nb-sd'
              columns={orderItemColumns}
              data={rows}
              emptyMessage={t('orderPage.emptyPage')}
            />
            <Pagination
              className='nb nb-pagination'
              page={page}
              totalPage={data?.meta?.total_page}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
