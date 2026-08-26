import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CreditCard, Inbox, RefreshCw } from 'lucide-react'

import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import ModalAddPaymentMethod from '@/components/PaymentMethod/CreatePaymentMethodModal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'
import { useGetPaymentMethods } from '@/hooks/usePaymentMethod'
import { getPaymentMethodColumns } from '@/tables/table-payment-method'
import { formatNumber } from '@/lib/format'

const PAGE_SIZE = 20

function TableSkeleton() {
  return (
    <div className='space-y-2 p-1'>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className='h-14 w-full rounded-lg' />
      ))}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className='flex flex-col items-center gap-3 px-4 py-14 text-center'>
      <span
        className='flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground'
        aria-hidden
      >
        <Inbox className='h-6 w-6' />
      </span>
      <p className='text-sm text-muted-foreground'>{message}</p>
    </div>
  )
}

export default function PaymentMethodPage() {
  const { t } = useTranslation('common')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, isSuccess, isFetching, refetch } =
    useGetPaymentMethods(page, PAGE_SIZE)

  const columns = useMemo(() => getPaymentMethodColumns(t), [t])
  const rows = data?.data ?? []
  const totalPage = data?.meta?.total_page ?? 1

  // Menghapus baris terakhir di halaman terakhir dulu meninggalkan admin pada
  // halaman di luar jangkauan yang isinya kosong. Dikoreksi saat render —
  // pola resmi React untuk menyesuaikan state terhadap data baru; memakai
  // useEffect di sini melanggar aturan set-state-in-effect repo ini.
  if (isSuccess && page > totalPage) {
    setPage(totalPage)
  }

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='flex gap-3'>
            <span
              className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'
              aria-hidden
            >
              <CreditCard className='h-5 w-5' />
            </span>
            <div className='min-w-0 space-y-1'>
              {/* h2, bukan h1: navbar sudah merender h1 judul halaman */}
              <h2 className='text-2xl font-semibold tracking-tight text-foreground'>
                {t('paymentMethodPage.title')}
              </h2>
              <p className='text-sm text-muted-foreground'>
                {t('paymentMethodPage.subtitle')}
              </p>
            </div>
          </div>

          {isSuccess && (
            <p className='shrink-0 text-sm font-medium tabular-nums text-muted-foreground'>
              {t('paymentMethodPage.totalMethods', {
                total: formatNumber(data?.meta?.total_data ?? 0),
              })}
            </p>
          )}
        </header>

        <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          <div className='flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
            <div className='min-w-0 space-y-0.5'>
              <h3 className='text-sm font-semibold text-foreground'>
                {t('paymentMethodPage.listTitle')}
              </h3>
              <p className='text-xs text-muted-foreground'>
                {t('paymentMethodPage.listHint')}
              </p>
            </div>
            <Can perm={PERM.PAYMENT_METHOD_CREATE}>
              <ModalAddPaymentMethod />
            </Can>
          </div>

          <div className='p-3 sm:p-4'>
            {isLoading && (
              <div role='status' aria-busy='true' aria-live='polite'>
                <span className='sr-only'>
                  {t('paymentMethodPage.tableLoadingTitle')}
                </span>
                <TableSkeleton />
              </div>
            )}

            {isError && (
              <div className='flex flex-col items-center gap-3 px-4 py-12 text-center'>
                <p className='text-sm text-destructive'>
                  {t('paymentMethodPage.loadErrorDetail')}
                </p>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='gap-2'
                  onClick={() => void refetch()}
                  disabled={isFetching}
                >
                  <RefreshCw className='h-3.5 w-3.5' aria-hidden />
                  {t('common.refresh')}
                </Button>
              </div>
            )}

            {isSuccess && (
              <>
                <div className='max-h-[min(70vh,40rem)] w-full min-w-0 overflow-auto overscroll-contain'>
                  <DataTable
                    columns={columns}
                    data={rows}
                    stickyHeader
                    // Tanpa ini baris di-key berdasarkan indeks array, sehingga
                    // dialog per baris bisa menempel ke record yang salah
                    getRowId={(row) => row.id}
                    emptyMessage={
                      <EmptyState message={t('paymentMethodPage.emptyPage')} />
                    }
                  />
                </div>
                <div className='mt-4'>
                  <Pagination
                    page={page}
                    totalPage={totalPage}
                    onChange={setPage}
                  />
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
