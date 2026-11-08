import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Library, RefreshCw, RotateCcw, Search, SearchX, X } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass } from '@/components/Auth/hud-styles'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { BrandDialog } from '@/components/SupplierCatalog/BrandDialog'
import { MappingChip, StockChip } from '@/components/SupplierCatalog/catalog-parts'
import { ProductDialog } from '@/components/SupplierCatalog/ProductDialog'
import { SyncPanel } from '@/components/SupplierCatalog/SyncPanel'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetProvider } from '@/hooks/useProvider'
import { catalogErrorKey, useSupplierBrand, useSupplierBrands, useSupplierProducts } from '@/hooks/useSupplierCatalog'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { SupplierBrand, SupplierMappingStatus, SupplierProduct, SupplierStockStatus } from '@/types/supplier-catalog'

const PAGE_SIZE = 20

const TABS = ['brands', 'products'] as const
const MAPPINGS = ['all', 'UNMAPPED', 'MAPPED', 'IGNORED'] as const
const STOCKS = ['all', 'available', 'empty'] as const

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

/** Desktop columns, shared by each list's header and rows. */
const brandColumns = 'lg:grid-cols-[minmax(0,1.4fr)_6rem_minmax(0,1fr)_8.5rem_1rem]'
const productColumns = 'lg:grid-cols-[minmax(0,1.5fr)_7.5rem_7.5rem_6.5rem_minmax(0,1fr)_1rem]'

/**
 * What each supplier sells, pulled whole from the supplier and kept apart from the storefront
 * until an admin ties a brand to a game and a product to a product.
 */
export default function SupplierCatalogPage() {
  const { t, i18n } = useTranslation('common')
  // Filters live in the URL, so a refresh or a shared link keeps the view.
  const [params, setParams] = useSearchParams()
  const tab = pick(params.get('tab'), TABS, 'brands')
  const q = params.get('q') ?? ''
  const mapping = pick(params.get('mapping'), MAPPINGS, 'all')
  const stock = pick(params.get('stock'), STOCKS, 'all')
  const brandFilter = params.get('brand') ?? ''
  const page = Math.max(1, Number(params.get('page')) || 1)
  const search = useDebounce(q.trim(), 350)
  const [openBrand, setOpenBrand] = useState<string | null>(null)
  const [openProduct, setOpenProduct] = useState<string | null>(null)

  const providersQuery = useGetProvider()
  // Providers left over from suppliers the backend no longer integrates have no catalog to show.
  const providers = (providersQuery.data?.data ?? []).filter((p) => p.supported !== false)
  const providerId = providers.some((p) => p.id === params.get('provider')) ? params.get('provider')! : (providers[0]?.id ?? '')

  const update = (patch: Record<string, string | null>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(patch)) {
          if (!value || value === 'all' || (key === 'page' && value === '1')) next.delete(key)
          else next.set(key, value)
        }
        return next
      },
      { replace: true }
    )

  const mappingStatus = mapping === 'all' ? undefined : (mapping as SupplierMappingStatus)
  const brands = useSupplierBrands(
    { providerId, search, mappingStatus, page, limit: PAGE_SIZE },
    !!providerId && tab === 'brands'
  )
  const products = useSupplierProducts(
    {
      providerId,
      supplierBrandId: brandFilter || undefined,
      search,
      mappingStatus,
      status: stock === 'all' ? undefined : (stock as SupplierStockStatus),
      page,
      limit: PAGE_SIZE,
    },
    !!providerId && tab === 'products'
  )
  const active = tab === 'brands' ? brands : products
  const total = active.data?.meta?.total_data
  const filtered = !!(q.trim() || mapping !== 'all' || (tab === 'products' && (stock !== 'all' || brandFilter)))
  const emptyByChoice = filtered || page > 1

  const reset = () => update({ q: null, mapping: null, stock: null, brand: null, page: null })
  const showProductsOf = (brandId: string) => {
    setOpenBrand(null)
    update({ tab: 'products', brand: brandId, q: null, stock: null, mapping: null, page: null })
  }
  const openBrandFromProduct = (brandId: string) => {
    setOpenProduct(null)
    setOpenBrand(brandId)
  }

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='min-w-0 space-y-1'>
            <p className={hudEyebrowClass}>{t('supplierCatalogPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('supplierCatalogPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('supplierCatalogPage.subtitle')}</p>
          </div>
          <div className='flex shrink-0 items-center gap-3'>
            {total !== undefined && (
              <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
                {t(`supplierCatalogPage.total.${tab}`, { count: total, formatted: total.toLocaleString(i18n.resolvedLanguage) })}
              </span>
            )}
            <button
              type='button'
              onClick={() => void active.refetch()}
              disabled={active.isFetching || !providerId}
              aria-label={t('supplierCatalogPage.refresh')}
              title={t('supplierCatalogPage.refresh')}
              className='grid size-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:text-brand-purple disabled:opacity-60'
            >
              <RefreshCw className={cn('size-4', active.isFetching && 'animate-spin')} aria-hidden />
            </button>
          </div>
        </header>

        {providersQuery.isLoading ? (
          <div className='h-28 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />
        ) : providers.length === 0 ? (
          <AuthAlert>{t('supplierCatalogPage.noProvider')}</AuthAlert>
        ) : (
          <SyncPanel providers={providers} providerId={providerId} onProviderChange={(id) => update({ provider: id, brand: null, page: null })} />
        )}

        <div className='bg-slate-200/80 p-px hud-clip'>
          <div className='flex flex-col gap-3 bg-white p-4 hud-clip'>
            <div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
              <Segmented
                size='md'
                value={tab}
                onChange={(v) => update({ tab: v, page: null, brand: v === 'brands' ? null : brandFilter })}
                label={t('supplierCatalogPage.tabs.label')}
                options={TABS.map((v) => ({ value: v, label: t(`supplierCatalogPage.tabs.${v}`) }))}
              />
              <div className='group relative min-w-0 flex-1'>
                <span className='pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-slate-400 group-focus-within:text-brand-purple'>
                  <Search className='size-4' aria-hidden />
                </span>
                <Input
                  type='search'
                  value={q}
                  onChange={(e) => update({ q: e.target.value, page: null })}
                  placeholder={t(`supplierCatalogPage.filters.search.${tab}`)}
                  aria-label={t(`supplierCatalogPage.filters.search.${tab}`)}
                  className={cn(hudInputClass, 'h-10 bg-white pl-10 text-sm')}
                />
              </div>
            </div>
            <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center'>
              <Segmented
                size='md'
                value={mapping}
                onChange={(v) => update({ mapping: v, page: null })}
                label={t('supplierCatalogPage.filters.mapping')}
                options={MAPPINGS.map((m) => ({ value: m, label: t(`supplierCatalogPage.filters.mappingOptions.${m}`) }))}
              />
              {tab === 'products' && (
                <Segmented
                  size='md'
                  value={stock}
                  onChange={(v) => update({ stock: v, page: null })}
                  label={t('supplierCatalogPage.filters.stock')}
                  options={STOCKS.map((s) => ({ value: s, label: t(`supplierCatalogPage.filters.stockOptions.${s}`) }))}
                />
              )}
              {tab === 'products' && brandFilter && <BrandFilterChip brandId={brandFilter} onClear={() => update({ brand: null, page: null })} />}
              {filtered && (
                <button
                  type='button'
                  onClick={reset}
                  className='inline-flex h-10 shrink-0 items-center gap-1.5 self-start rounded-md px-3 text-xs font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 sm:ml-auto sm:self-auto'
                >
                  <RotateCcw className='size-3.5' aria-hidden />
                  {t('supplierCatalogPage.filters.reset')}
                </button>
              )}
            </div>
          </div>
        </div>

        {active.isError && (
          <div className='space-y-3'>
            <AuthAlert>{t(catalogErrorKey(active.error))}</AuthAlert>
            <button
              type='button'
              onClick={() => void active.refetch()}
              disabled={active.isFetching}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple disabled:opacity-60'
            >
              <RefreshCw className={cn('size-4', active.isFetching && 'animate-spin')} aria-hidden />
              {t('supplierCatalogPage.retry')}
            </button>
          </div>
        )}

        {!providerId ? null : active.isLoading ? (
          <ListSkeleton />
        ) : !active.isError && (active.data?.list.length ?? 0) === 0 ? (
          <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center animate-in fade-in duration-500'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              {emptyByChoice ? <SearchX className='size-6' aria-hidden /> : <Library className='size-6' aria-hidden />}
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>
              {emptyByChoice ? t('supplierCatalogPage.noMatchTitle') : t('supplierCatalogPage.emptyTitle')}
            </h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>
              {emptyByChoice ? t('supplierCatalogPage.noMatchBody') : t('supplierCatalogPage.emptyBody')}
            </p>
            {emptyByChoice && (
              <button
                type='button'
                onClick={reset}
                className='mt-5 inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-brand-purple transition-colors hover:bg-brand-purple/10'
              >
                <RotateCcw className='size-4' aria-hidden />
                {t('supplierCatalogPage.filters.reset')}
              </button>
            )}
          </div>
        ) : tab === 'brands' ? (
          <BrandList brands={brands.data?.list ?? []} dimmed={brands.isPlaceholderData} busy={brands.isFetching} onOpen={setOpenBrand} />
        ) : (
          <ProductList products={products.data?.list ?? []} dimmed={products.isPlaceholderData} busy={products.isFetching} onOpen={setOpenProduct} />
        )}

        <HudPagination page={page} totalPages={active.data?.meta?.total_page ?? 1} onChange={(p) => update({ page: String(p) })} />
      </div>

      <BrandDialog brandId={openBrand} onClose={() => setOpenBrand(null)} onShowProducts={showProductsOf} />
      <ProductDialog productId={openProduct} onClose={() => setOpenProduct(null)} onOpenBrand={openBrandFromProduct} />
    </DashboardLayout>
  )
}

/** The brand the product list is narrowed to, with a way out. */
function BrandFilterChip({ brandId, onClear }: { brandId: string; onClear: () => void }) {
  const { t } = useTranslation('common')
  const { data: brand } = useSupplierBrand(brandId)
  return (
    <span className='inline-flex h-9 max-w-full items-center gap-2 rounded-md bg-brand-purple/10 pl-3 pr-1 text-xs font-medium text-brand-purple'>
      <span className='truncate'>
        {t('supplierCatalogPage.filters.brand', { name: brand ? `${brand.name} (${brand.supplier_brand_code})` : '…' })}
      </span>
      <button
        type='button'
        onClick={onClear}
        aria-label={t('supplierCatalogPage.filters.clearBrand')}
        title={t('supplierCatalogPage.filters.clearBrand')}
        className='grid size-7 shrink-0 place-items-center rounded transition-colors hover:bg-brand-purple/15'
      >
        <X className='size-3.5' aria-hidden />
      </button>
    </span>
  )
}

interface ListProps {
  dimmed: boolean
  busy: boolean
  onOpen: (id: string) => void
}

function BrandList({ brands, dimmed, busy, onOpen }: ListProps & { brands: SupplierBrand[] }) {
  const { t, i18n } = useTranslation('common')
  return (
    <section aria-label={t('supplierCatalogPage.tabs.brands')} className={cn('bg-slate-200/80 p-px transition-opacity duration-300 hud-clip', dimmed && 'opacity-60')}>
      <div className='bg-white hud-clip'>
        <div
          className={cn(
            'hidden gap-x-4 border-b border-slate-100 px-5 py-2.5 font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 lg:grid',
            brandColumns
          )}
          aria-hidden
        >
          <span>{t('supplierCatalogPage.columns.brand')}</span>
          <span className='text-right'>{t('supplierCatalogPage.columns.products')}</span>
          <span>{t('supplierCatalogPage.columns.mapping')}</span>
          <span>{t('supplierCatalogPage.columns.lastSeen')}</span>
        </div>
        <ul className='divide-y divide-slate-100' aria-busy={busy}>
          {brands.map((brand, index) => (
            <li key={brand.id} className='animate-in fade-in duration-300 fill-mode-both' style={{ animationDelay: `${Math.min(index, 14) * 18}ms` }}>
              <button
                type='button'
                onClick={() => onOpen(brand.id)}
                className={cn(
                  'group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3 text-left transition-colors hover:bg-brand-purple/[0.03] focus-visible:bg-brand-purple/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40 sm:px-5',
                  brandColumns
                )}
              >
                <div className='min-w-0'>
                  <p className='truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-brand-purple'>{brand.name}</p>
                  <p className='flex flex-wrap items-center gap-x-2 text-xs text-slate-500'>
                    <span className='font-mono'>{brand.supplier_brand_code}</span>
                    {brand.check_id_enabled && <span className='text-cyan-700'>{t('supplierCatalogPage.row.checkId')}</span>}
                    <span className='tabular-nums lg:hidden'>
                      · {t('supplierCatalogPage.row.products', { count: brand.product_count, formatted: brand.product_count.toLocaleString(i18n.resolvedLanguage) })}
                    </span>
                  </p>
                </div>
                <span className='hidden text-right text-sm tabular-nums text-slate-700 lg:block'>
                  {brand.product_count.toLocaleString(i18n.resolvedLanguage)}
                </span>
                <span className='flex min-w-0 flex-wrap items-center justify-end gap-2 lg:justify-start'>
                  <MappingChip status={brand.mapping_status} />
                  {brand.game_name && <span className='hidden min-w-0 truncate text-xs text-slate-600 lg:inline'>{brand.game_name}</span>}
                </span>
                <span className='hidden text-xs tabular-nums text-slate-500 lg:block'>
                  {brand.last_seen_at ? formatBackendDateTime(brand.last_seen_at, 'dd MMM yyyy, HH:mm') : t('supplierCatalogPage.never')}
                </span>
                <ChevronRight
                  className='hidden size-4 text-slate-300 transition-transform duration-300 ease-hud group-hover:translate-x-0.5 group-hover:text-brand-purple lg:block'
                  aria-hidden
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function ProductList({ products, dimmed, busy, onOpen }: ListProps & { products: SupplierProduct[] }) {
  const { t } = useTranslation('common')
  return (
    <section aria-label={t('supplierCatalogPage.tabs.products')} className={cn('bg-slate-200/80 p-px transition-opacity duration-300 hud-clip', dimmed && 'opacity-60')}>
      <div className='bg-white hud-clip'>
        <div
          className={cn(
            'hidden gap-x-4 border-b border-slate-100 px-5 py-2.5 font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 lg:grid',
            productColumns
          )}
          aria-hidden
        >
          <span>{t('supplierCatalogPage.columns.product')}</span>
          <span>{t('supplierCatalogPage.columns.brandCode')}</span>
          <span className='text-right'>{t('supplierCatalogPage.columns.cost')}</span>
          <span>{t('supplierCatalogPage.columns.stock')}</span>
          <span>{t('supplierCatalogPage.columns.mapping')}</span>
        </div>
        <ul className='divide-y divide-slate-100' aria-busy={busy}>
          {products.map((product, index) => (
            <li key={product.id} className='animate-in fade-in duration-300 fill-mode-both' style={{ animationDelay: `${Math.min(index, 14) * 18}ms` }}>
              <button
                type='button'
                onClick={() => onOpen(product.id)}
                className={cn(
                  'group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3 text-left transition-colors hover:bg-brand-purple/[0.03] focus-visible:bg-brand-purple/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40 sm:px-5',
                  productColumns
                )}
              >
                <div className='min-w-0'>
                  <p
                    className={cn(
                      'truncate text-sm font-semibold transition-colors group-hover:text-brand-purple',
                      product.is_enabled ? 'text-slate-900' : 'text-slate-400 line-through'
                    )}
                    title={product.is_enabled ? undefined : t('supplierCatalogPage.row.disabled')}
                  >
                    {product.name}
                  </p>
                  <p className='flex flex-wrap items-center gap-x-2 text-xs text-slate-500'>
                    <span className='font-mono'>{product.supplier_sku}</span>
                    <span className='font-mono lg:hidden'>{product.supplier_brand_code}</span>
                  </p>
                </div>
                <span className='text-right text-sm font-semibold tabular-nums text-slate-900 lg:hidden'>{formatCurrency(product.cost)}</span>
                <span className='hidden min-w-0 truncate font-mono text-xs text-slate-600 lg:block'>
                  {product.supplier_brand_code || '—'}
                  {product.sub_provider_code && <span className='text-slate-400'> · {product.sub_provider_code}</span>}
                </span>
                <span className='hidden text-right text-sm tabular-nums text-slate-900 lg:block'>{formatCurrency(product.cost)}</span>
                <span className='col-span-2 flex flex-wrap items-center gap-2 lg:col-span-1'>
                  <StockChip status={product.supplier_status} />
                  <span className='lg:hidden'>
                    <MappingChip status={product.mapping_status} />
                  </span>
                </span>
                <span className='hidden min-w-0 items-center gap-2 lg:flex'>
                  <MappingChip status={product.mapping_status} />
                  {product.product_name && <span className='min-w-0 truncate text-xs text-slate-600'>{product.product_name}</span>}
                </span>
                <ChevronRight
                  className='hidden size-4 text-slate-300 transition-transform duration-300 ease-hud group-hover:translate-x-0.5 group-hover:text-brand-purple lg:block'
                  aria-hidden
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function ListSkeleton() {
  return (
    <div className='space-y-px overflow-hidden bg-slate-200/60 p-px hud-clip' aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className='flex items-center gap-4 bg-white px-5 py-4'>
          <div className='flex-1 space-y-2'>
            <div className='h-3.5 w-1/3 animate-pulse rounded bg-slate-200/70' />
            <div className='h-3 w-1/5 animate-pulse rounded bg-slate-100' />
          </div>
          <div className='hidden h-5 w-24 animate-pulse rounded bg-slate-100 sm:block' />
        </div>
      ))}
    </div>
  )
}
