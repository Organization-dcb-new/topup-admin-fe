import { ProductSkuGameImageRow } from '@/components/Product/Filter/ProductSkuGameImageRow'
import ProductsSearchInput from '@/components/Product/Filter/SearchProduct'
import type { ReactNode } from 'react'

export type ProductListCardProps = {
  search: string
  isActive: boolean
  onSearchChange: (value: string) => void
  onActiveChange: (value: boolean) => void
  sku: string
  onSkuChange: (value: string) => void
  gameName: string
  onGameNameChange: (value: string) => void
  children: ReactNode
}

export function ProductListCard({
  search,
  isActive,
  onSearchChange,
  onActiveChange,
  sku,
  onSkuChange,
  gameName,
  onGameNameChange,
  children,
}: ProductListCardProps) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="min-w-0 space-y-0.5">
            <h2 className="text-sm font-semibold text-gray-900">Filter dan pencarian</h2>
            <p className="text-xs text-muted-foreground">
              Gabungkan kata kunci, status aktif, SKU, dan game. Halaman akan kembali ke 1 saat filter
              berubah.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ProductsSearchInput
              search={search}
              isActive={isActive}
              onSearchChange={onSearchChange}
              onActiveChange={onActiveChange}
            />
            <ProductSkuGameImageRow
              sku={sku}
              onSkuChange={onSkuChange}
              gameName={gameName}
              onGameNameChange={onGameNameChange}
            />
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">{children}</div>
    </div>
  )
}
