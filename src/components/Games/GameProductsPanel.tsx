import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Package, Percent, RefreshCw, RotateCcw, Search, SearchX } from 'lucide-react'

import { Can } from '@/components/Auth/Can'
import { hudInputClass } from '@/components/Auth/hud-styles'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { PERM } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { useProductsByGame } from '@/hooks/useProduct'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Game } from '@/types/game'
import type { Product } from '@/types/product'
import { DetailPanel } from './GameDetailParts'
import { formatMarkup, gameChipClass, gamePanelButtonClass, providerStock } from './game-utils'

const PAGE_SIZE = 10
const STATUSES = ['all', 'active', 'inactive'] as const
const STOCKS = ['all', 'available', 'empty'] as const

const columnsClass = 'lg:grid-cols-[minmax(0,1fr)_11rem_9rem_9rem]'

interface GameProductsPanelProps {
  game: Pick<Game, 'id' | 'product'>
  onPrice: () => void
  onSync: () => void
  order?: number
}

/** What the game sells, with the price build-up per product. Filtering happens here, on the loaded list. */
export function GameProductsPanel({ game, onPrice, onSync, order }: GameProductsPanelProps) {
  const { t } = useTranslation('common')
  const { can } = usePermissions()
  const products = game.product ?? []
  // The detail endpoint keeps only the cheapest offer per product name; this one lists every offer.
  const listings = useProductsByGame(game.id, can(PERM.productView))
  const totalListings = listings.data?.length ?? 0

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('all')
  const [stock, setStock] = useState<(typeof STOCKS)[number]>('all')
  const [page, setPage] = useState(1)

  const needle = query.trim().toLowerCase()
  const filtered = products.filter((p) => {
    if (needle && !p.name.toLowerCase().includes(needle) && !(p.sku ?? '').toLowerCase().includes(needle)) return false
    if (status !== 'all' && p.is_active !== (status === 'active')) return false
    if (stock !== 'all' && providerStock(p.provider_status) !== stock) return false
    return true
  })
  const filtering = !!needle || status !== 'all' || stock !== 'all'
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const available = products.filter((p) => providerStock(p.provider_status) === 'available').length
  const belowBase = products.filter((p) => p.selling_price < p.base_price).length

  const reset = () => {
    setQuery('')
    setStatus('all')
    setStock('all')
    setPage(1)
  }

  return (
    <DetailPanel
      icon={Package}
      title={t('gameDetailPage.products.title')}
      description={
        products.length > 0 && (
          <>
            {t('gameDetailPage.products.summary', { count: products.length, available })}
            {totalListings > products.length && <> · {t('gameDetailPage.products.offersNote', { count: totalListings })}</>}
          </>
        )
      }
      order={order}
      action={
        <>
          <Can permission={PERM.gameSync}>
            <button type='button' onClick={onSync} className={gamePanelButtonClass}>
              <RefreshCw className='size-4' aria-hidden />
              {t('gameDetailPage.products.sync')}
            </button>
          </Can>
          {products.length > 0 && (
            <Can permission={PERM.productUpdatePrice}>
              <button type='button' onClick={onPrice} className={gamePanelButtonClass}>
                <Percent className='size-4' aria-hidden />
                {t('gameDetailPage.products.markup')}
              </button>
            </Can>
          )}
        </>
      }
    >
      {products.length === 0 ? (
        <div className='grid place-items-center px-4 py-8 text-center'>
          <span className='mb-3 grid size-12 place-items-center bg-slate-100 text-slate-400 hud-clip-sm'>
            <Package className='size-5' aria-hidden />
          </span>
          <p className='font-display text-base font-bold text-slate-900'>{t('gameDetailPage.products.emptyTitle')}</p>
          <p className='mt-1 max-w-sm text-sm text-slate-500'>{t('gameDetailPage.products.emptyBody')}</p>
        </div>
      ) : (
        <div className='space-y-4'>
          <div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
            <div className='group relative min-w-0 flex-1'>
              <span className='pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-slate-400 group-focus-within:text-brand-purple'>
                <Search className='size-4' aria-hidden />
              </span>
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                placeholder={t('gameDetailPage.products.searchPlaceholder')}
                aria-label={t('gameDetailPage.products.searchPlaceholder')}
                className={cn(hudInputClass, 'h-10 bg-white pl-10 text-sm')}
              />
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <Segmented
                size='md'
                value={status}
                onChange={(v) => {
                  setStatus(v)
                  setPage(1)
                }}
                label={t('gameDetailPage.products.statusLabel')}
                options={STATUSES.map((s) => ({ value: s, label: t(`gameDetailPage.products.status.${s}`) }))}
              />
              <Segmented
                size='md'
                value={stock}
                onChange={(v) => {
                  setStock(v)
                  setPage(1)
                }}
                label={t('gameDetailPage.products.stockLabel')}
                options={STOCKS.map((s) => ({ value: s, label: t(`gameDetailPage.products.stock.${s}`) }))}
              />
              {filtering && (
                <button
                  type='button'
                  onClick={reset}
                  className='inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600'
                >
                  <RotateCcw className='size-3.5' aria-hidden />
                  {t('gameDetailPage.products.reset')}
                </button>
              )}
            </div>
          </div>

          {belowBase > 0 && (
            <p className='flex items-start gap-2 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700 ring-1 ring-inset ring-rose-200'>
              <AlertTriangle className='mt-px size-3.5 shrink-0' aria-hidden />
              {t('gameDetailPage.products.belowBaseWarning', { count: belowBase })}
            </p>
          )}

          {filtered.length === 0 ? (
            <div className='grid place-items-center rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center'>
              <SearchX className='mb-2 size-6 text-slate-400' aria-hidden />
              <p className='text-sm text-slate-500'>{t('gameDetailPage.products.noMatch')}</p>
            </div>
          ) : (
            <div className='overflow-hidden rounded-lg border border-slate-200'>
              <div
                className={cn(
                  'hidden gap-x-4 border-b border-slate-200 bg-slate-50 px-4 py-2.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 lg:grid',
                  columnsClass
                )}
                aria-hidden
              >
                <span>{t('gameDetailPage.products.cols.product')}</span>
                <span>{t('gameDetailPage.products.cols.state')}</span>
                <span>{t('gameDetailPage.products.cols.base')}</span>
                <span className='text-right'>{t('gameDetailPage.products.cols.price')}</span>
              </div>
              <ul className='divide-y divide-slate-100'>
                {rows.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))}
              </ul>
            </div>
          )}

          <HudPagination page={current} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </DetailPanel>
  )
}

function ProductRow({ product: p }: { product: Product }) {
  const { t } = useTranslation('common')
  const stock = providerStock(p.provider_status)
  const margin = p.selling_price - p.base_price
  const markup = formatMarkup(p.additional_percent, p.additional_fee)

  // Phones: name and price on top, chips and base price under them. Desktop: four columns.
  return (
    <li className={cn('grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2 px-4 py-3 lg:items-center', columnsClass)}>
      <div className='order-1 min-w-0'>
        <p className={cn('truncate text-sm font-semibold', p.is_active ? 'text-slate-900' : 'text-slate-500')}>{p.name}</p>
        <p className='truncate font-mono text-[11px] text-slate-400'>{p.sku || '—'}</p>
      </div>

      <div className='order-3 flex flex-wrap items-center gap-1.5 lg:order-2'>
        <span
          className={cn(
            gameChipClass,
            stock === 'available' ? 'bg-emerald-50 text-emerald-700' : stock === 'empty' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
          )}
          title={p.provider_status || undefined}
        >
          {stock === 'other' ? p.provider_status : t(`gameDetailPage.products.stock.${stock}`)}
        </span>
        {!p.is_active && <span className={cn(gameChipClass, 'bg-slate-100 text-slate-500')}>{t('gameDetailPage.products.status.inactive')}</span>}
        {!p.is_unlimited_stock && (
          <span className={cn('text-[11px] tabular-nums', p.stock_quantity > 0 ? 'text-slate-500' : 'text-rose-600')}>
            {t('gameDetailPage.products.stockLeft', { count: p.stock_quantity })}
          </span>
        )}
      </div>

      <div className='order-4 text-right text-xs lg:order-3 lg:text-left'>
        <p className='tabular-nums text-slate-600'>{formatCurrency(p.base_price)}</p>
        <p className='tabular-nums text-slate-400'>{markup ?? t('gameDetailPage.products.noMarkup')}</p>
      </div>

      <div className='order-2 text-right lg:order-4'>
        <p className='font-display text-sm font-bold tabular-nums text-slate-900'>{formatCurrency(p.selling_price)}</p>
        <p className={cn('text-[11px] font-medium tabular-nums', margin < 0 ? 'text-rose-600' : 'text-emerald-600')}>
          {margin < 0
            ? t('gameDetailPage.products.belowBase', { amount: formatCurrency(-margin) })
            : t('gameDetailPage.products.margin', { amount: formatCurrency(margin) })}
        </p>
      </div>
    </li>
  )
}
