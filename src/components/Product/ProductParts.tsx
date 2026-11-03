import { useTranslation } from 'react-i18next'
import { Cpu, RefreshCw, UserRound, type LucideIcon } from 'lucide-react'

import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'
import { markupOf, parseActor, type ActorKind } from './product-pricing'

const chipClass =
  'inline-flex items-center gap-1.5 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.12em] hud-clip-sm'

/** Provider stock, plus our own quantity when it isn't unlimited. */
export function StockChip({ product }: { product: Pick<Product, 'provider_status' | 'is_unlimited_stock' | 'stock_quantity'> }) {
  const { t } = useTranslation('common')
  const status = product.provider_status?.trim().toLowerCase() ?? ''
  const available = status === 'available'
  const empty = status === 'empty' || status === ''
  return (
    <span className='inline-flex flex-wrap items-center gap-1.5'>
      <span
        className={cn(
          chipClass,
          available && 'bg-emerald-50 text-emerald-700',
          empty && 'bg-rose-50 text-rose-700',
          !available && !empty && 'bg-slate-100 text-slate-600'
        )}
        title={product.provider_status || undefined}
      >
        <span className={cn('size-1.5 rounded-full', available ? 'bg-emerald-500' : empty ? 'bg-rose-500' : 'bg-slate-400')} aria-hidden />
        {available ? t('productsPage.row.available') : empty ? t('productsPage.row.empty') : product.provider_status}
      </span>
      {!product.is_unlimited_stock && (
        <span className='text-[11px] tabular-nums text-slate-500'>{t('productsPage.row.stock', { count: product.stock_quantity })}</span>
      )}
    </span>
  )
}

export function ActiveChip({ active }: { active: boolean }) {
  const { t } = useTranslation('common')
  return (
    <span className={cn(chipClass, active ? 'bg-brand-purple/10 text-brand-purple' : 'bg-slate-100 text-slate-500')}>
      {active ? t('productsPage.row.active') : t('productsPage.row.inactive')}
    </span>
  )
}

export function MarkupChip({ product }: { product: Parameters<typeof markupOf>[0] }) {
  const { t, i18n } = useTranslation('common')
  const markup = markupOf(product)
  const locale = i18n.language.startsWith('id') ? 'id-ID' : 'en-US'
  if (markup.kind === 'none') {
    return <span className={cn(chipClass, 'bg-slate-100 text-slate-500')}>{t('productsPage.row.noMarkup')}</span>
  }
  const negative = markup.value < 0
  const text =
    markup.kind === 'fee'
      ? `${negative ? '−' : '+'}${formatCurrency(Math.abs(markup.value))}`
      : `${negative ? '−' : '+'}${Math.abs(markup.value).toLocaleString(locale, { maximumFractionDigits: 2 })}%`
  return (
    <span
      className={cn(chipClass, 'normal-case tracking-normal', negative ? 'bg-rose-50 text-rose-700' : 'bg-cyan-50 text-cyan-700')}
      title={markup.kind === 'fee' ? t('productsPage.row.markupFee') : t('productsPage.row.markupPercent')}
    >
      {text}
    </span>
  )
}

const ACTOR_ICON: Record<ActorKind, LucideIcon> = {
  admin: UserRound,
  user: UserRound,
  process: RefreshCw,
  system: Cpu,
  unknown: Cpu,
}

/** Who touched the product last: an admin by name, the provider sync, or the system. */
export function UpdatedBy({ raw, adminName }: { raw: string; adminName?: string }) {
  const { t } = useTranslation('common')
  const actor = parseActor(raw)
  const Icon = ACTOR_ICON[actor.kind]
  const label =
    actor.kind === 'admin'
      ? adminName ?? t('productsPage.actor.admin', { id: actor.detail.slice(0, 8) })
      : actor.kind === 'process'
        ? t(`productsPage.actor.processes.${actor.detail}`, { defaultValue: t('productsPage.actor.process') })
        : actor.kind === 'system'
          ? t('productsPage.actor.system')
          : actor.detail || '—'
  return (
    <span className='inline-flex min-w-0 items-center gap-1.5 text-xs text-slate-500' title={raw || undefined}>
      <Icon className='size-3.5 shrink-0 text-slate-400' aria-hidden />
      <span className='truncate'>{label}</span>
    </span>
  )
}
