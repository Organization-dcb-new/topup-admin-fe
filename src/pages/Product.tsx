import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Boxes, ImagePlus, Package, RefreshCw, Tag } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import EditBulkAllPriceModal from '@/components/Games/EditBulkAllPriceModal'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { GameImageDialog, type GameImageTarget } from '@/components/Product/GameImageDialog'
import { ProductFilterBar } from '@/components/Product/ProductFilterBar'
import { ActiveChip, MarkupChip, StockChip, UpdatedBy } from '@/components/Product/ProductParts'
import { ProductPriceDialog } from '@/components/Product/ProductPriceDialog'
import { EMPTY_PRODUCT_FILTERS, toProductParams, type ProductFilterState } from '@/components/Product/product-filters'
import { marginOf, parseActor } from '@/components/Product/product-pricing'
import { PERM } from '@/constants/permissions'
import { useAdminNames } from '@/hooks/useAdmin'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetGameNames } from '@/hooks/useGame'
import { usePermissions } from '@/hooks/usePermissions'
import { useGetProducts } from '@/hooks/useProduct'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'

const PAGE_SIZE = 25

const iconButtonClass =
  'grid size-8 shrink-0 place-items-center text-slate-400 hud-clip-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'

export default function ProductPage() {
  const { t, i18n } = useTranslation('common')
  const { can } = usePermissions()
  const canPickGame = can(PERM.gameView)
  const [filters, setFilters] = useState<ProductFilterState>(EMPTY_PRODUCT_FILTERS)
  const [page, setPage] = useState(1)
  const [priceTarget, setPriceTarget] = useState<Product | null>(null)
  const [imageTarget, setImageTarget] = useState<GameImageTarget | null>(null)

  // Typed fields wait for a pause; clicks (status, stock, game) apply at once. /products is rate limited.
  const typedNow = useMemo(
    () => ({
      search: filters.search,
      sku: filters.sku,
      baseMin: filters.baseMin,
      baseMax: filters.baseMax,
      sellMin: filters.sellMin,
      sellMax: filters.sellMax,
      feeMin: filters.feeMin,
      feeMax: filters.feeMax,
      pctMin: filters.pctMin,
      pctMax: filters.pctMax,
    }),
    [filters.search, filters.sku, filters.baseMin, filters.baseMax, filters.sellMin, filters.sellMax, filters.feeMin, filters.feeMax, filters.pctMin, filters.pctMax]
  )
  const typed = useDebounce(typedNow, 400)
  const params = toProductParams({ ...filters, ...typed })

  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = useGetProducts(page, PAGE_SIZE, params)
  const { data: games = [] } = useGetGameNames(canPickGame)
  const adminNames = useAdminNames()
  const products = data?.data ?? []
  const total = data?.meta?.total_data
  const filtered = JSON.stringify(filters) !== JSON.stringify(EMPTY_PRODUCT_FILTERS)

  const updateFilters = (patch: Partial<ProductFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }
  const resetFilters = () => {
    setFilters(EMPTY_PRODUCT_FILTERS)
    setPage(1)
  }

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <header className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('productsPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('productsPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('productsPage.subtitle')}</p>
          </div>
          <div className='flex shrink-0 flex-wrap items-center gap-3'>
            {total !== undefined && (
              <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
                {t('productsPage.total', { count: total, formatted: total.toLocaleString(i18n.resolvedLanguage) })}
              </span>
            )}
            {canPickGame && (
              <Can permission={PERM.productUpdate}>
                <button
                  type='button'
                  onClick={() => setImageTarget({})}
                  className='inline-flex h-11 items-center gap-2 bg-white px-4 font-display text-xs font-bold uppercase tracking-[0.15em] text-slate-600 ring-1 ring-inset ring-slate-200 hud-clip-sm transition-colors hover:text-brand-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'
                >
                  <ImagePlus className='size-4' aria-hidden />
                  {t('productsPage.actions.gameImage')}
                </button>
              </Can>
            )}
            <Can permission={PERM.productUpdatePrice}>
              <EditBulkAllPriceModal />
            </Can>
          </div>
        </header>

        <ProductFilterBar value={filters} onChange={updateFilters} onReset={resetFilters} games={games} canPickGame={canPickGame} />

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('productsPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('productsPage.retry')}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className='h-96 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />
        ) : !isError && products.length === 0 ? (
          <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              <Boxes className='size-6' aria-hidden />
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>
              {filtered ? t('productsPage.noMatchTitle') : t('productsPage.emptyTitle')}
            </h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>
              {filtered ? t('productsPage.noMatchBody') : t('productsPage.emptyBody')}
            </p>
          </div>
        ) : (
          products.length > 0 && (
            <div className={cn('bg-slate-200/80 p-px transition-opacity duration-300 hud-clip', isPlaceholderData && 'opacity-60')}>
              <ul className='divide-y divide-slate-100 bg-white hud-clip' aria-busy={isFetching}>
                {products.map((product, index) => {
                  const actor = parseActor(product.last_updated_by)
                  return (
                    <ProductRow
                      key={product.id}
                      product={product}
                      order={index}
                      adminName={actor.kind === 'admin' ? adminNames.get(actor.detail) : undefined}
                      onPrice={() => setPriceTarget(product)}
                      onImage={() =>
                        setImageTarget({ game: product.game?.id ? { id: product.game.id, name: product.game.name } : { id: product.game_id, name: '' } })
                      }
                    />
                  )
                })}
              </ul>
            </div>
          )
        )}

        <HudPagination page={page} totalPages={data?.meta?.total_page ?? 1} onChange={setPage} />
      </div>

      <ProductPriceDialog product={priceTarget} onOpenChange={(open) => !open && setPriceTarget(null)} />
      <GameImageDialog
        target={imageTarget}
        onOpenChange={(open) => !open && setImageTarget(null)}
        games={games}
        canPickGame={canPickGame}
      />
    </DashboardLayout>
  )
}

interface ProductRowProps {
  product: Product
  order: number
  adminName?: string
  onPrice: () => void
  onImage: () => void
}

function ProductRow({ product, order, adminName, onPrice, onImage }: ProductRowProps) {
  const { t, i18n } = useTranslation('common')
  const [imageFailed, setImageFailed] = useState(false)
  const image = product.image?.trim() || product.game?.thumbnail_url?.trim()
  const margin = marginOf(product)
  const locale = i18n.language.startsWith('id') ? 'id-ID' : 'en-US'
  const loss = margin.amount < 0

  return (
    <li
      className={cn(
        'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-4 py-3.5 transition-colors animate-in fade-in duration-300 fill-mode-both hover:bg-slate-50/70 sm:px-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,17rem)_minmax(0,10rem)_minmax(0,9rem)_auto]',
        !product.is_active && 'bg-slate-50/50'
      )}
      style={{ animationDelay: `${Math.min(order, 12) * 20}ms` }}
    >
      <div className='flex min-w-0 items-center gap-3'>
        <span className='grid size-11 shrink-0 place-items-center overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200'>
          {image && !imageFailed ? (
            <img
              src={image}
              alt=''
              loading='lazy'
              onError={() => setImageFailed(true)}
              className={cn('size-full object-cover', !product.is_active && 'grayscale')}
            />
          ) : (
            <Package className='size-4 text-slate-300' aria-hidden />
          )}
        </span>
        <div className='min-w-0'>
          <p className={cn('truncate text-sm font-semibold', product.is_active ? 'text-slate-900' : 'text-slate-500')} title={product.name}>
            {product.name}
          </p>
          <p className='truncate text-xs text-slate-500'>
            <span className='font-mono'>{product.sku}</span>
            {product.game?.name && <span> · {product.game.name}</span>}
          </p>
        </div>
      </div>

      <div className='col-span-2 min-w-0 space-y-1 xl:col-span-1'>
        <div className='flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs tabular-nums'>
          <span className='text-slate-500'>{formatCurrency(product.base_price)}</span>
          <ArrowRight className='size-3 text-slate-300' aria-hidden />
          <span className={cn('text-sm font-semibold', loss ? 'text-rose-600' : 'text-slate-900')}>{formatCurrency(product.selling_price)}</span>
          <MarkupChip product={product} />
        </div>
        <p className={cn('text-[11px] tabular-nums', loss ? 'font-medium text-rose-600' : 'text-slate-400')}>
          {t(loss ? 'productsPage.row.loss' : 'productsPage.row.margin', {
            amount: formatCurrency(Math.abs(margin.amount)),
            percent: margin.percent === null ? '—' : `${Math.abs(margin.percent).toLocaleString(locale, { maximumFractionDigits: 1 })}%`,
          })}
        </p>
      </div>

      <div className='col-span-2 flex flex-wrap items-center gap-1.5 xl:col-span-1'>
        <StockChip product={product} />
        <ActiveChip active={product.is_active} />
      </div>

      <div className='col-span-2 min-w-0 space-y-0.5 xl:col-span-1'>
        <UpdatedBy raw={product.last_updated_by} adminName={adminName} />
        <p className='pl-5 text-[11px] tabular-nums text-slate-400'>{formatBackendDateTime(product.updated_at, 'dd MMM yyyy, HH:mm')}</p>
      </div>

      <div className='col-start-2 row-start-1 flex shrink-0 items-center gap-0.5 xl:col-start-auto xl:row-start-auto'>
        <Can permission={PERM.productUpdatePrice}>
          <button
            type='button'
            onClick={onPrice}
            aria-label={t('productsPage.row.editPrice', { name: product.name })}
            title={t('productsPage.row.editPrice', { name: product.name })}
            className={`${iconButtonClass} hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:ring-brand-purple/40`}
          >
            <Tag className='size-4' aria-hidden />
          </button>
        </Can>
        <Can permission={PERM.productUpdate}>
          <button
            type='button'
            onClick={onImage}
            aria-label={t('productsPage.row.changeImage', { game: product.game?.name ?? '' })}
            title={t('productsPage.row.changeImage', { game: product.game?.name ?? '' })}
            className={`${iconButtonClass} hover:bg-cyan-50 hover:text-cyan-700 focus-visible:ring-brand-cyan/40`}
          >
            <ImagePlus className='size-4' aria-hidden />
          </button>
        </Can>
      </div>
    </li>
  )
}
