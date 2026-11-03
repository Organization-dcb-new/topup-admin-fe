import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Infinity as InfinityIcon, Package, RefreshCw, ShieldCheck, TrendingDown } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { PERM } from '@/constants/permissions'
import { useGetGameNames } from '@/hooks/useGame'
import { usePermissions } from '@/hooks/usePermissions'
import { useGetProductAnomaly } from '@/hooks/useProduct'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'

const PAGE_SIZE = 25

export default function AnomalyProduct() {
  const { t, i18n } = useTranslation('common')
  const { can } = usePermissions()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = useGetProductAnomaly(page, PAGE_SIZE)
  // The anomaly endpoint doesn't include the game, so names come from the game list.
  const { data: gameNames } = useGetGameNames(can(PERM.gameView))
  const names = useMemo(() => new Map((gameNames ?? []).map((g) => [g.id, g.name])), [gameNames])

  const products = data?.data
  // Biggest loss first within the page: those cost the most per order.
  const sorted = useMemo(() => [...(products ?? [])].sort((a, b) => loss(b) - loss(a)), [products])
  const maxLoss = sorted.length ? loss(sorted[0]) : 0
  const total = data?.meta?.total_data ?? 0

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='space-y-1'>
          <p className={hudEyebrowClass}>{t('anomalyProductPage.eyebrow')}</p>
          <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('anomalyProductPage.title')}</h1>
          <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('anomalyProductPage.subtitle')}</p>
        </header>

        {data && total > 0 && (
          <div role='status' className='bg-rose-300/80 p-px hud-clip animate-in fade-in slide-in-from-top-1 duration-500 ease-hud'>
            <div className='flex flex-col gap-3 bg-rose-50 px-5 py-4 hud-clip sm:flex-row sm:items-center'>
              <span className='grid size-10 shrink-0 place-items-center bg-linear-to-br from-rose-500 to-amber-400 text-white hud-clip-sm' aria-hidden>
                <TrendingDown className='size-5' />
              </span>
              <div className='min-w-0 flex-1'>
                <p className='font-display text-lg font-bold text-slate-900'>
                  {t('anomalyProductPage.banner.title', { count: total, formatted: total.toLocaleString(i18n.resolvedLanguage) })}
                </p>
                <p className='text-sm text-rose-800'>{t('anomalyProductPage.banner.body')}</p>
              </div>
            </div>
          </div>
        )}

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('anomalyProductPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('anomalyProductPage.retry')}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className='h-96 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />
        ) : !isError && sorted.length === 0 ? (
          <div className='grid place-items-center rounded-xl border border-dashed border-emerald-300 bg-white px-6 py-16 text-center animate-in fade-in duration-500'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-emerald-500 to-brand-cyan text-white hud-clip-sm'>
              <ShieldCheck className='size-6' aria-hidden />
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>{t('anomalyProductPage.emptyTitle')}</h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>{t('anomalyProductPage.emptyBody')}</p>
          </div>
        ) : (
          sorted.length > 0 && (
            <div className={cn('bg-slate-200/80 p-px transition-opacity duration-300 hud-clip', isPlaceholderData && 'opacity-60')}>
              <ul className='divide-y divide-slate-100 bg-white hud-clip' aria-busy={isFetching}>
                {sorted.map((product, index) => (
                  <AnomalyRow
                    key={product.id}
                    product={product}
                    gameName={names.get(product.game_id)}
                    maxLoss={maxLoss}
                    order={index}
                    canOpenGame={can(PERM.gameView)}
                  />
                ))}
              </ul>
            </div>
          )
        )}

        <HudPagination page={page} totalPages={data?.meta?.total_page ?? 1} onChange={setPage} />
      </div>
    </DashboardLayout>
  )
}

function loss(p: Product) {
  return Math.max(0, p.base_price - p.selling_price)
}

interface AnomalyRowProps {
  product: Product
  gameName?: string
  maxLoss: number
  order: number
  canOpenGame: boolean
}

function AnomalyRow({ product, gameName, maxLoss, order, canOpenGame }: AnomalyRowProps) {
  const { t, i18n } = useTranslation('common')
  const perOrder = loss(product)
  const pct = product.base_price > 0 ? (perOrder / product.base_price) * 100 : 0
  const fee = product.additional_fee ?? 0
  const percent = product.additional_percent ?? 0
  const locale = i18n.language.startsWith('id') ? 'id-ID' : 'en-US'

  return (
    <li
      className='grid gap-x-5 gap-y-3 px-4 py-4 animate-in fade-in duration-300 fill-mode-both sm:px-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,15rem)_minmax(0,13rem)_auto] lg:items-center'
      style={{ animationDelay: `${Math.min(order, 12) * 25}ms` }}
    >
      <div className='flex min-w-0 items-center gap-3'>
        <span className='grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200'>
          {product.image ? <img src={product.image} alt='' className='size-full object-cover' /> : <Package className='size-4 text-slate-300' aria-hidden />}
        </span>
        <div className='min-w-0'>
          <p className='flex items-center gap-2'>
            <span className={cn('truncate text-sm font-semibold', product.is_active ? 'text-slate-900' : 'text-slate-500')}>{product.name}</span>
            {!product.is_active && (
              <span className='shrink-0 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400'>
                {t('anomalyProductPage.inactive')}
              </span>
            )}
          </p>
          <p className='truncate text-xs text-slate-500'>
            <span className='font-mono'>{product.sku}</span>
            {gameName && <span> · {gameName}</span>}
            <span className='inline-flex items-center gap-0.5'>
              {' · '}
              {product.is_unlimited_stock ? (
                <InfinityIcon className='inline size-3' aria-label={t('anomalyProductPage.stockUnlimited')} />
              ) : (
                t('anomalyProductPage.stock', { count: product.stock_quantity })
              )}
            </span>
          </p>
        </div>
      </div>

      <div className='min-w-0 space-y-1.5'>
        <div className='flex flex-wrap items-baseline gap-x-2 text-xs tabular-nums'>
          <span className='text-slate-500'>{t('anomalyProductPage.base')}</span>
          <span className='font-medium text-slate-700'>{formatCurrency(product.base_price)}</span>
          <ArrowRight className='size-3 self-center text-slate-300' aria-hidden />
          <span className='text-slate-500'>{t('anomalyProductPage.selling')}</span>
          <span className='font-semibold text-rose-600'>{formatCurrency(product.selling_price)}</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100'>
            <div
              className='h-full rounded-full bg-rose-500/80 transition-[width] duration-700 ease-hud'
              style={{ width: `${maxLoss > 0 ? Math.max(4, (perOrder / maxLoss) * 100) : 0}%` }}
            />
          </div>
          <span className='shrink-0 text-xs font-semibold tabular-nums text-rose-700'>
            −{formatCurrency(perOrder)}
            <span className='ml-1 font-normal text-rose-500'>({pct.toLocaleString(locale, { maximumFractionDigits: 1 })}%)</span>
          </span>
        </div>
      </div>

      <dl className='grid grid-cols-2 gap-x-4 text-xs'>
        <div>
          <dt className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>{t('anomalyProductPage.fee')}</dt>
          <dd className={cn('font-medium tabular-nums', fee < 0 ? 'text-rose-600' : 'text-slate-700')}>{formatCurrency(fee)}</dd>
        </div>
        <div>
          <dt className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>{t('anomalyProductPage.markup')}</dt>
          <dd className={cn('font-medium tabular-nums', percent < 0 ? 'text-rose-600' : 'text-slate-700')}>
            {percent.toLocaleString(locale, { maximumFractionDigits: 2 })}%
          </dd>
        </div>
      </dl>

      {canOpenGame && product.game_id ? (
        <Link
          to={`/games/${product.game_id}`}
          className='group inline-flex h-8 items-center gap-1.5 justify-self-start px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-purple hud-clip-sm transition-colors hover:bg-brand-purple/10 lg:justify-self-end'
        >
          {t('anomalyProductPage.fix')}
          <ArrowRight className='size-3.5 transition-transform duration-300 ease-hud group-hover:translate-x-0.5' aria-hidden />
        </Link>
      ) : (
        <span />
      )}
    </li>
  )
}
