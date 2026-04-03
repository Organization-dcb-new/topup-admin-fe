import { ProductListCard } from '@/components/Product/ProductListCard'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetProducts } from '@/hooks/useProduct'
import { productColumns } from '@/tables/table-product'
import { AlertCircle, Boxes, CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [sku, setSku] = useState('')
  const [gameName, setGameName] = useState('')

  const debouncedSearch = useDebounce(search, 500)
  const debouncedSku = useDebounce(sku, 500)
  const [page, setPage] = useState(1)
  const limit = 25
  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetProducts(
    page,
    limit,
    search,
    isActive,
    debouncedSku,
    gameName,
  )

  useEffect(() => {
    // Reset halaman saat filter berubah (perilaku sama seperti sebelum refactor UI).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sinkronisasi page dengan filter/debounce
    setPage(1)
  }, [debouncedSearch, debouncedSku, gameName, isActive])

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success('Berhasil memuat produk')
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Gagal memuat produk')
    }
  }, [isSuccess, isError, isFetchedAfterMount])

  const rows = data?.data ?? []

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
                Cari, saring per game dan SKU, serta kelola gambar per game. Tabel di bawah menampilkan{' '}
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
          search={search}
          isActive={isActive}
          onSearchChange={setSearch}
          onActiveChange={setIsActive}
          sku={sku}
          onSkuChange={setSku}
          gameName={gameName}
          onGameNameChange={setGameName}
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
