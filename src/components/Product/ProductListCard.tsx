import {
  ProductAmountFilters,
  type ProductAmountFiltersState,
} from '@/components/Product/Filter/ProductAmountFilters'
import { ProductNameSearchInput } from '@/components/Product/Filter/ProductNameSearchInput'
import { ProductSkuGameImageRow } from '@/components/Product/Filter/ProductSkuGameImageRow'
import {
  ProductProviderStatusFilter,
  type ProductProviderStatusFilterValue,
} from '@/components/Product/Filter/ProductProviderStatusFilter'
import {
  ProductStatusFilter,
  type ProductStatusFilterValue,
} from '@/components/Product/Filter/ProductStatusFilter'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

export type ProductListCardProps = {
  productNameSearch: string
  onProductNameSearchChange: (value: string) => void
  productStatus: ProductStatusFilterValue
  onProductStatusChange: (value: ProductStatusFilterValue) => void
  providerStatus: ProductProviderStatusFilterValue
  onProviderStatusChange: (value: ProductProviderStatusFilterValue) => void
  sku: string
  onSkuChange: (value: string) => void
  gameName: string
  onGameNameChange: (value: string) => void
  amountFilters: ProductAmountFiltersState
  onAmountFiltersChange: (patch: Partial<ProductAmountFiltersState>) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
  children: ReactNode
}

export function ProductListCard({
  productNameSearch,
  onProductNameSearchChange,
  productStatus,
  onProductStatusChange,
  providerStatus,
  onProviderStatusChange,
  sku,
  onSkuChange,
  gameName,
  onGameNameChange,
  amountFilters,
  onAmountFiltersChange,
  hasActiveFilters,
  onResetFilters,
  children,
}: ProductListCardProps) {
  const { t } = useTranslation('common')
  const [filtersOpen, setFiltersOpen] = useState(true)

  return (
    <div className='overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5'>
      <div className='border-b border-gray-100'>
        <div className='flex flex-wrap items-start gap-3 px-4 py-3 sm:px-5'>
          <button
            type='button'
            className='flex min-w-0 flex-1 items-start gap-2 rounded-lg text-left outline-none ring-offset-background transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            aria-controls='product-filters-panel'
            id='product-filters-heading'
          >
            <ChevronDown
              className={cn(
                'mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
                filtersOpen && 'rotate-180',
              )}
              aria-hidden
            />
            <span className='min-w-0 space-y-0.5'>
              <span className='block text-sm font-semibold text-gray-900'>{t('productPage.filtersTitle')}</span>
              <span className='block text-xs text-muted-foreground'>
                {filtersOpen
                  ? t('productPage.filtersOpenHint')
                  : t('productPage.filtersClosedHint')}
              </span>
            </span>
          </button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-9 w-full shrink-0 gap-2 sm:w-auto'
            disabled={!hasActiveFilters}
            onClick={(e) => {
              e.stopPropagation()
              onResetFilters()
            }}
          >
            <RotateCcw className='h-4 w-4' aria-hidden />
            {t('productPage.resetFilters')}
          </Button>
        </div>

        {filtersOpen ? (
          <div
            id='product-filters-panel'
            role='region'
            aria-labelledby='product-filters-heading'
            className='space-y-4 border-t border-gray-100/90 px-4 pb-4 pt-3 sm:px-5'
          >
            <ProductNameSearchInput
              value={productNameSearch}
              onChange={onProductNameSearchChange}
            />

            <div className='grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end lg:gap-4'>
              <div className='min-w-0 lg:col-span-3'>
                <ProductStatusFilter value={productStatus} onChange={onProductStatusChange} />
              </div>
              <div className='min-w-0 lg:col-span-3'>
                <ProductProviderStatusFilter
                  value={providerStatus}
                  onChange={onProviderStatusChange}
                />
              </div>
              <div className='min-w-0 lg:col-span-6'>
                <ProductSkuGameImageRow
                  sku={sku}
                  onSkuChange={onSkuChange}
                  gameName={gameName}
                  onGameNameChange={onGameNameChange}
                />
              </div>
            </div>

            <ProductAmountFilters value={amountFilters} onChange={onAmountFiltersChange} />
          </div>
        ) : null}
      </div>

      <div className='p-3 sm:p-4'>{children}</div>
    </div>
  )
}
