import { AlertCircle, CheckCircle2, Loader2, Package, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Can } from '@/components/Auth/Can'
import { CreateCategoryProductModal } from '@/components/CategoryProduct/CreateCategoryProduct'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { EmptyState, TableSkeleton } from '@/components/Layout/table-states'
import { Button } from '@/components/ui/button'
import { PERM } from '@/constants/permissions'
import { useGetCategoryProduct } from '@/hooks/useCategoryProduct'
import type { CategoryProduct } from '@/hooks/useCategoryProduct'
import i18n from '@/i18n'
import { cn } from '@/lib/utils'
import { getCategoryProductColumns } from '@/tables/table-category-product'

const PAGE_SIZE = 10

export default function CategoryProduct() {
  const { t } = useTranslation('common')
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isSuccess, isFetching, isPlaceholderData, refetch } =
    useGetCategoryProduct(page, PAGE_SIZE)

  // Dimemo karena ikut jadi dependency getCategoryProductColumns: `data?.data ?? []`
  // menghasilkan array baru tiap render.
  const rows = useMemo(() => data?.data ?? [], [data])
  const totalPage = data?.meta?.total_page ?? 1
  const categoryProductColumn = useMemo(() => getCategoryProductColumns(t), [t])

  // Menghapus baris terakhir sebuah halaman membuat `page` menunjuk halaman
  // yang sudah tidak ada. Dijepit saat render, bukan lewat useEffect, supaya
  // tidak ada render antara dengan nomor halaman yang sudah usang.
  const [lastTotalPage, setLastTotalPage] = useState(totalPage)
  if (isSuccess && totalPage !== lastTotalPage) {
    setLastTotalPage(totalPage)
    if (page > totalPage) setPage(totalPage)
  }

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

  const emptyMessage = (
    <EmptyState
      message={t('categoryProductPage.emptyPage')}
      action={
        <Can perm={PERM.CATEGORY_PRODUCT_CREATE}>
          <CreateCategoryProductModal />
        </Can>
      }
    />
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
              {/* h2, bukan h1: navbar sudah merender h1 judul halaman. */}
              <h2 className='text-2xl font-semibold tracking-tight text-foreground'>
                {t('categoryProductPage.title')}
              </h2>
              <p className='text-sm text-muted-foreground'>{t('categoryProductPage.subtitle')}</p>
            </div>
          </div>
          <div className='flex flex-col items-end gap-1 sm:text-right'>
            {isLoading && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Loader2
                  className='h-4 w-4 shrink-0 animate-spin text-primary motion-reduce:animate-none'
                  aria-hidden
                />
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

        <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          <div className='flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
            <div className='min-w-0 space-y-0.5'>
              <h3 className='text-sm font-semibold text-foreground'>
                {t('categoryProductPage.listTitle')}
              </h3>
              <p className='text-xs text-muted-foreground'>
                {t('categoryProductPage.listHint', { limit: PAGE_SIZE })}
              </p>
            </div>
            <Can perm={PERM.CATEGORY_PRODUCT_CREATE}>
              <CreateCategoryProductModal />
            </Can>
          </div>

          <div className='p-3 sm:p-4'>
            {isLoading && (
              <div role='status' aria-busy='true' aria-live='polite'>
                <span className='sr-only'>{t('categoryProductPage.tableLoadingTitle')}</span>
                <TableSkeleton />
              </div>
            )}

            {isError && (
              <div role='alert' className='flex flex-col items-center gap-3 px-4 py-12 text-center'>
                <p className='text-sm text-destructive'>
                  {t('categoryProductPage.loadErrorDetail')}
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
                {/* Baris halaman sebelumnya sengaja dipertahankan selama halaman
                    baru dimuat; peredupan inilah satu-satunya penanda bahwa
                    datanya belum yang terbaru. */}
                <div
                  aria-busy={isPlaceholderData}
                  inert={isPlaceholderData}
                  className={cn(
                    'transition-opacity duration-200 motion-reduce:transition-none',
                    isPlaceholderData && 'opacity-60',
                  )}
                >
                  <DataTable
                    renderSubRow={renderSubRow}
                    columns={categoryProductColumn}
                    data={rows}
                    getRowId={(row) => row.id}
                    stickyHeader
                    caption={t('categoryProductPage.tableCaption', { count: rows.length })}
                    emptyMessage={emptyMessage}
                  />
                </div>

                <Pagination page={page} totalPage={totalPage} onChange={setPage} />
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
