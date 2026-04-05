import { ProductListCard } from '@/components/Product/ProductListCard'
import {
  defaultProductAmountFilters,
  type ProductAmountFiltersState,
} from '@/components/Product/Filter/ProductAmountFilters'
import type { ProductStatusFilterValue } from '@/components/Product/Filter/ProductStatusFilter'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { useDebounce } from '@/hooks/useDebounce'
import { type GetProductsParams, useGetProducts } from '@/hooks/useProduct'
import { productColumns } from '@/tables/table-product'
import { AlertCircle, Boxes, CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const [productNameSearch, setProductNameSearch] = useState('')
  const [productStatus, setProductStatus] = useState<ProductStatusFilterValue>('all')
  const [sku, setSku] = useState('')
  const [gameName, setGameName] = useState('')
  const [amountFilters, setAmountFilters] = useState<ProductAmountFiltersState>(() =>
    defaultProductAmountFilters(),
  )

  const debouncedProductNameSearch = useDebounce(productNameSearch, 500)
  const debouncedSku = useDebounce(sku, 500)
  const debouncedAmount = useDebounce(amountFilters, 400)

  const [page, setPage] = useState(1)
  const limit = 25

  const listParams = useMemo((): GetProductsParams => {
    const is_active =
      productStatus === 'active' ? true : productStatus === 'inactive' ? false : undefined

    return {
      search: debouncedProductNameSearch.trim(),
      sku: debouncedSku,
      game_name: gameName,
      ...(is_active !== undefined && { is_active }),
      ...(debouncedAmount.additionalFeeAbove && {
        additional_fee_above: debouncedAmount.additionalFeeAbove,
      }),
      ...(debouncedAmount.additionalFeeBelow && {
        additional_fee_below: debouncedAmount.additionalFeeBelow,
      }),
      ...(debouncedAmount.additionalPercentAbove && {
        additional_percent_above: debouncedAmount.additionalPercentAbove,
      }),
      ...(debouncedAmount.additionalPercentBelow && {
        additional_percent_below: debouncedAmount.additionalPercentBelow,
      }),
      ...(debouncedAmount.basePriceAbove && { base_price_above: debouncedAmount.basePriceAbove }),
      ...(debouncedAmount.basePriceBelow && { base_price_below: debouncedAmount.basePriceBelow }),
      ...(debouncedAmount.basePriceExact && { base_price: debouncedAmount.basePriceExact }),
      ...(debouncedAmount.sellingPriceAbove && {
        selling_price_above: debouncedAmount.sellingPriceAbove,
      }),
      ...(debouncedAmount.sellingPriceBelow && {
        selling_price_below: debouncedAmount.sellingPriceBelow,
      }),
      ...(debouncedAmount.sellingPriceExact && {
        selling_price: debouncedAmount.sellingPriceExact,
      }),
    }
  }, [debouncedProductNameSearch, debouncedSku, gameName, productStatus, debouncedAmount])

  const hasActiveFilters =
    productNameSearch.trim() !== '' ||
    productStatus !== 'all' ||
    sku.trim() !== '' ||
    gameName !== '' ||
    Object.values(amountFilters).some((v) => v.trim() !== '')

  const handleResetFilters = () => {
    setProductNameSearch('')
    setProductStatus('all')
    setSku('')
    setGameName('')
    setAmountFilters(defaultProductAmountFilters())
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sinkron page dengan filter
    setPage(1)
  }, [debouncedProductNameSearch, debouncedSku, gameName, productStatus, debouncedAmount])

  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetProducts(
    page,
    limit,
    listParams,
  )

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success('Berhasil memuat produk')
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Gagal memuat produk')
    }
  }, [isSuccess, isError, isFetchedAfterMount])

  const rows = data?.data ?? []

  const patchAmountFilters = (patch: Partial<ProductAmountFiltersState>) => {
    setAmountFilters((prev) => ({ ...prev, ...patch }))
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Boxes className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Produk</h1>
              <p className="text-sm text-muted-foreground">
                Cari nama produk, filter status, nominal, SKU, dan game. Tabel menampilkan{' '}
                {limit} item per halaman.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 sm:text-right">
            {isLoading && (
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
                Memuat…
              </p>
            )}
            {isError && (
              <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                Gagal memuat
              </p>
            )}
            {isSuccess && (
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                <span className="tabular-nums text-foreground">
                  Total {(data?.meta?.total_data ?? 0).toLocaleString('id-ID')} produk
                </span>
              </p>
            )}
          </div>
        </div>

        <ProductListCard
          productNameSearch={productNameSearch}
          onProductNameSearchChange={setProductNameSearch}
          productStatus={productStatus}
          onProductStatusChange={setProductStatus}
          sku={sku}
          onSkuChange={setSku}
          gameName={gameName}
          onGameNameChange={setGameName}
          amountFilters={amountFilters}
          onAmountFiltersChange={patchAmountFilters}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
        >
          {isLoading && (
            <div
              className="flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/80 bg-muted/20 py-12"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <Loader2 className="h-11 w-11 animate-spin text-primary" aria-hidden />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Memuat produk…</p>
                <p className="mt-1 text-xs text-muted-foreground">Mohon tunggu sebentar.</p>
              </div>
            </div>
          )}

          {isError && (
            <ErrorComponent message="Gagal memuat produk. Periksa koneksi atau coba muat ulang halaman." />
          )}

          {isSuccess && (
            <>
              <div className="max-h-[min(70vh,40rem)] overflow-y-auto overflow-x-auto overscroll-contain">
                <DataTable
                  columns={productColumns}
                  data={rows}
                  emptyMessage="Tidak ada produk yang cocok dengan filter saat ini."
                />
              </div>
              <div className="mt-4">
                <Pagination
                  page={page}
                  totalPage={data?.meta?.total_page ?? 1}
                  onChange={setPage}
                />
              </div>
            </>
          )}
        </ProductListCard>
      </div>
    </DashboardLayout>
  )
}
