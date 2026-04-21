import { CreateCategoryProductModal } from '@/components/CategoryProduct/CreateCategoryProduct'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { useGetCategoryProduct } from '@/hooks/useCategoryProduct'
import type { CategoryProduct } from '@/hooks/useCategoryProduct'
import { getCategoryProductColumns } from '@/tables/table-category-product'
import i18n from '@/i18n'
import { AlertCircle, CheckCircle2, Package, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function CategoryProduct() {
  const { t } = useTranslation('common')
  const limit = 10
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetCategoryProduct(
    page,
    limit,
  )

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(t('categoryProductPage.toastSuccess'))
    }
    if (isError && isFetchedAfterMount) {
      toast.error(t('categoryProductPage.toastError'))
    }
  }, [isSuccess, isError, isFetchedAfterMount, t])

  const rows = data?.data ?? []
  const categoryProductColumn = useMemo(() => getCategoryProductColumns(t), [t])

  const renderSubRow = (row: CategoryProduct) => (
    <div className='px-4 py-3 sm:pl-8'>
      <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
        {t('categoryProductPage.subRowTitle')}
      </p>
      {row.product?.length ? (
        <ul className='list-disc space-y-1 pl-4 text-sm text-foreground'>
          {row.product.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      ) : (
        <p className='text-sm text-muted-foreground'>{t('categoryProductPage.subRowEmpty')}</p>
      )}
    </div>
  )

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex gap-3'>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <Package className='h-5 w-5' aria-hidden />
            </div>
            <div className='min-w-0 space-y-1'>
              <h1 className='text-2xl font-semibold tracking-tight text-gray-900'>{t('categoryProductPage.title')}</h1>
              <p className='text-sm text-muted-foreground'>{t('categoryProductPage.subtitle')}</p>
            </div>
          </div>
          <div className='flex flex-col items-end gap-1 sm:text-right'>
            {isLoading && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin text-primary' aria-hidden />
                {t('categoryProductPage.loadingShort')}
              </p>
            )}
            {isError && (
              <p className='flex items-center gap-2 text-sm font-medium text-destructive'>
                <AlertCircle className='h-4 w-4 shrink-0' aria-hidden />
                {t('categoryProductPage.loadFailedShort')}
              </p>
            )}
            {isSuccess && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <CheckCircle2 className='h-4 w-4 shrink-0 text-emerald-600' aria-hidden />
                <span className='tabular-nums text-foreground'>
                  {t('categoryProductPage.totalCategories', {
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
              <h2 className='text-sm font-semibold text-gray-900'>{t('categoryProductPage.listTitle')}</h2>
              <p className='text-xs text-muted-foreground'>
                {t('categoryProductPage.listHint', { limit })}
              </p>
            </div>
            <CreateCategoryProductModal />
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
                  <p className='text-sm font-medium text-foreground'>{t('categoryProductPage.tableLoadingTitle')}</p>
                  <p className='mt-1 text-xs text-muted-foreground'>{t('categoryProductPage.tableLoadingHint')}</p>
                </div>
              </div>
            )}

            {isError && (
              <ErrorComponent message={t('categoryProductPage.loadErrorDetail')} />
            )}

            {isSuccess && (
              <>
                <div className='max-h-[min(70vh,40rem)] overflow-y-auto overflow-x-auto overscroll-contain'>
                  <DataTable
                    renderSubRow={renderSubRow}
                    columns={categoryProductColumn}
                    data={rows}
                    emptyMessage={t('categoryProductPage.emptyPage')}
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
