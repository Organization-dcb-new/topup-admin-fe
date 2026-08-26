import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Inbox, Layers, RefreshCw } from 'lucide-react'

import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { DataTable } from '@/components/Layout/table-data'
import { CreatePaymentCategoryModal } from '@/components/PaymentMethodCategory/Create'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'
import { useGetPaymentMethodCategory } from '@/hooks/usePaymentMethodCategory'
import { getPaymentMethodCategoriesColumns } from '@/tables/table-payment-category'
import { formatNumber } from '@/lib/format'

function TableSkeleton() {
  return (
    <div className='space-y-2 p-1'>
      {Array.from({ length: 5 }).map((_, i) => (
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

export default function PaymentMethodCategoryPage() {
  const { t } = useTranslation('common')
  const { data, isLoading, isError, isSuccess, isFetching, refetch } =
    useGetPaymentMethodCategory()

  const columns = useMemo(() => getPaymentMethodCategoriesColumns(t), [t])

  // Backend tidak menjamin urutan; kategori tampil sesuai sort_order
  const rows = useMemo(
    () => [...(data?.data ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    [data?.data],
  )

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='flex gap-3'>
            <span
              className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'
              aria-hidden
            >
              <Layers className='h-5 w-5' />
            </span>
            <div className='min-w-0 space-y-1'>
              <h2 className='text-2xl font-semibold tracking-tight text-foreground'>
                {t('paymentMethodCategoryPage.title')}
              </h2>
              <p className='text-sm text-muted-foreground'>
                {t('paymentMethodCategoryPage.subtitle')}
              </p>
            </div>
          </div>

          {isSuccess && (
            <p className='shrink-0 text-sm font-medium tabular-nums text-muted-foreground'>
              {t('paymentMethodCategoryPage.total', {
                total: formatNumber(rows.length),
              })}
            </p>
          )}
        </header>

        <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          <div className='flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
            <div className='min-w-0 space-y-0.5'>
              <h3 className='text-sm font-semibold text-foreground'>
                {t('paymentMethodCategoryPage.listTitle')}
              </h3>
              <p className='text-xs text-muted-foreground'>
                {t('paymentMethodCategoryPage.listHint')}
              </p>
            </div>
            <Can perm={PERM.PAYMENT_CATEGORY_CREATE}>
              <CreatePaymentCategoryModal />
            </Can>
          </div>

          <div className='p-3 sm:p-4'>
            {isLoading && (
              <div role='status' aria-busy='true' aria-live='polite'>
                <span className='sr-only'>
                  {t('paymentMethodCategoryPage.loadingBody')}
                </span>
                <TableSkeleton />
              </div>
            )}

            {isError && (
              <div className='flex flex-col items-center gap-3 px-4 py-12 text-center'>
                <p className='text-sm text-destructive'>
                  {t('paymentMethodCategoryPage.errorMessage')}
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
              <div className='w-full min-w-0 overflow-auto'>
                <DataTable
                  columns={columns}
                  data={rows}
                  stickyHeader
                  getRowId={(row) => row.id}
                  emptyMessage={
                    <EmptyState
                      message={t('paymentMethodCategoryPage.emptyMessage')}
                    />
                  }
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
