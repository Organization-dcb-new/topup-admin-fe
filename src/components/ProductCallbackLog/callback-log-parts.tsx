import { useTranslation } from 'react-i18next'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus } from 'lucide-react'

import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Provider stock status; anything unknown is shown as-is in a neutral chip. */
export function StockChip({ status }: { status: string }) {
  const { t } = useTranslation('common')
  const known = status === 'available' || status === 'empty'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] hud-clip-sm',
        status === 'available' && 'bg-emerald-50 text-emerald-700',
        status === 'empty' && 'bg-rose-50 text-rose-700',
        !known && 'bg-slate-100 text-slate-600'
      )}
    >
      <span
        className={cn('size-1.5 rounded-full', status === 'available' ? 'bg-emerald-500' : status === 'empty' ? 'bg-rose-500' : 'bg-slate-400')}
        aria-hidden
      />
      {known ? t(`productCallbackLogPage.stock.${status}`) : status || '—'}
    </span>
  )
}

const KNOWN_SOURCES = ['SCHEDULER', 'MANUAL_SYNC', 'CHECKOUT', 'CALLBACK']

/** Where a change came from (the sync job, an admin's sync, checkout, or LapakGaming's old pushes). */
export function SourceChip({ source }: { source: string }) {
  const { t } = useTranslation('common')
  return (
    <span className='inline-flex items-center bg-brand-purple/[0.07] px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-purple/80 hud-clip-sm'>
      {KNOWN_SOURCES.includes(source) ? t(`productCallbackLogPage.source.${source}`) : source || '—'}
    </span>
  )
}

/** The stock, with what it was before when it changed (available → out of stock). */
export function StockChange({ previous, current }: { previous?: string; current: string }) {
  if (!previous || previous === current) return <StockChip status={current} />
  return (
    <span className='inline-flex flex-wrap items-center gap-1'>
      <span className='opacity-60'>
        <StockChip status={previous} />
      </span>
      <ArrowRight className='size-3 text-slate-300' aria-hidden />
      <StockChip status={current} />
    </span>
  )
}

/**
 * The provider's price change. A higher cost eats into margin, so increases read as bad (rose)
 * and drops as good (emerald).
 */
export function PriceDelta({ previous, current, size = 'sm' }: { previous: number; current: number; size?: 'sm' | 'lg' }) {
  const { t, i18n } = useTranslation('common')
  const diff = current - previous
  const pct = previous > 0 ? (diff / previous) * 100 : null
  const Icon = diff > 0 ? ArrowUpRight : diff < 0 ? ArrowDownRight : Minus
  const locale = i18n.language.startsWith('id') ? 'id-ID' : 'en-US'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 font-semibold tabular-nums hud-clip-sm',
        size === 'lg' ? 'px-2 py-1 text-sm' : 'px-1.5 py-0.5 text-[11px]',
        diff > 0 && 'bg-rose-50 text-rose-700',
        diff < 0 && 'bg-emerald-50 text-emerald-700',
        diff === 0 && 'bg-slate-100 text-slate-500'
      )}
    >
      <Icon className={size === 'lg' ? 'size-4' : 'size-3'} aria-hidden />
      {diff === 0
        ? t('productCallbackLogPage.noChange')
        : `${diff > 0 ? '+' : '−'}${formatCurrency(Math.abs(diff))}${
            pct !== null ? ` (${diff > 0 ? '+' : '−'}${Math.abs(pct).toLocaleString(locale, { maximumFractionDigits: 1 })}%)` : ''
          }`}
    </span>
  )
}
