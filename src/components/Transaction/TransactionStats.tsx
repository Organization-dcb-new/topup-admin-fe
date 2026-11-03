import { useTranslation } from 'react-i18next'
import { CheckCircle2, Percent, TrendingUp, Wallet, type LucideIcon } from 'lucide-react'

import { formatCurrency, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Payment, TransactionPaginationMeta } from '@/types/transaction'

interface Stats {
  volume: number
  paid: number
  margin: number
  /** 0–100. */
  successRate: number
  /** True when the numbers cover every matching transaction, not just this page. */
  overall: boolean
}

/** Server totals for the current filters when the backend sends them; this page's rows otherwise. */
export function computeStats(meta: TransactionPaginationMeta | undefined, rows: Payment[]): Stats {
  if (meta && meta.total_volume !== undefined) {
    return {
      volume: meta.total_volume ?? 0,
      paid: meta.total_paid_count ?? 0,
      margin: meta.total_margin ?? 0,
      successRate: meta.success_rate ?? 0,
      overall: true,
    }
  }
  const paid = rows.filter((r) => r.status === 'PAID')
  return {
    volume: paid.reduce((sum, r) => sum + (r.amount ?? 0), 0),
    paid: paid.length,
    margin: paid.reduce((sum, r) => sum + (r.margin ?? 0), 0),
    successRate: rows.length ? (paid.length / rows.length) * 100 : 0,
    overall: false,
  }
}

export function TransactionStats({ stats, loading }: { stats: Stats; loading: boolean }) {
  const { t, i18n } = useTranslation('common')
  const locale = i18n.language.startsWith('id') ? 'id-ID' : 'en-US'
  const scope = stats.overall ? t('transactionPage.stats.scopeFiltered') : t('transactionPage.stats.scopePage')

  return (
    <div className='space-y-2'>
      <ul className='grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4'>
        <Tile order={0} icon={Wallet} label={t('transactionPage.stats.volume')} value={formatCurrency(stats.volume)} loading={loading} />
        <Tile order={1} icon={CheckCircle2} label={t('transactionPage.stats.paid')} value={formatNumber(stats.paid)} loading={loading} />
        <Tile
          order={2}
          icon={TrendingUp}
          label={t('transactionPage.stats.margin')}
          value={formatCurrency(stats.margin)}
          tone={stats.margin < 0 ? 'rose' : 'emerald'}
          loading={loading}
        />
        <Tile
          order={3}
          icon={Percent}
          label={t('transactionPage.stats.successRate')}
          value={`${stats.successRate.toLocaleString(locale, { maximumFractionDigits: 1 })}%`}
          loading={loading}
          bar={Math.min(100, Math.max(0, stats.successRate))}
        />
      </ul>
      <p className='text-right font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>{scope}</p>
    </div>
  )
}

interface TileProps {
  order: number
  icon: LucideIcon
  label: string
  value: string
  tone?: 'emerald' | 'rose'
  loading: boolean
  /** 0–100, draws a thin progress bar under the value. */
  bar?: number
}

function Tile({ order, icon: Icon, label, value, tone, loading, bar }: TileProps) {
  return (
    <li className='min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both' style={{ animationDelay: `${order * 60}ms` }}>
      <div className='h-full bg-slate-200/80 p-px hud-clip-sm'>
        <div className='flex h-full flex-col gap-2 bg-white p-3 hud-clip-sm sm:p-4'>
          <div className='flex items-center justify-between gap-2'>
            <p className='truncate font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 sm:tracking-[0.2em]'>{label}</p>
            <Icon className='size-4 shrink-0 text-brand-purple/70' aria-hidden />
          </div>
          {loading ? (
            <div className='h-7 w-3/4 animate-pulse rounded bg-slate-100' aria-hidden />
          ) : (
            <p
              className={cn(
                'truncate font-display text-lg font-bold sm:text-2xl',
                tone === 'emerald' ? 'text-emerald-600' : tone === 'rose' ? 'text-rose-600' : 'text-slate-900'
              )}
            >
              {value}
            </p>
          )}
          {bar !== undefined && (
            <div className='mt-auto h-1.5 w-full overflow-hidden rounded-full bg-slate-100' role='presentation'>
              <div className='h-full rounded-full bg-emerald-500 transition-[width] duration-700 ease-hud' style={{ width: `${bar}%` }} />
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
