import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDownLeft, ArrowUpRight, Landmark, ListOrdered, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'

import type { CashflowPeriodSummary } from '@/hooks/useCashflow'
import { formatCurrency, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

interface CashflowSummaryProps {
  summary: CashflowPeriodSummary | undefined
  isLoading: boolean
  /** Shown faded while a new period loads over the previous one. */
  stale: boolean
  periodLabel: string
}

export function CashflowSummary({ summary, isLoading, stale, periodLabel }: CashflowSummaryProps) {
  const { t } = useTranslation('common')

  if (isLoading && !summary) {
    return (
      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]' aria-hidden>
        <div className='h-56 animate-pulse bg-slate-200/60 hud-clip' />
        <div className='grid grid-cols-2 gap-4'>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className={cn('h-28 animate-pulse bg-slate-200/60 hud-clip-sm', i === 2 && 'col-span-2')} />
          ))}
        </div>
      </div>
    )
  }
  if (!summary) return null

  const { stats, total } = summary
  const hasPgFees = stats.total_out_pg > 0

  return (
    <section
      aria-label={t('cashflowPage.summary.label')}
      className={cn('grid gap-4 transition-opacity duration-300 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]', stale && 'opacity-60')}
    >
      <NetHero stats={stats} periodLabel={periodLabel} />
      <ul className='grid grid-cols-2 gap-4'>
        <Tile
          order={1}
          icon={ArrowDownLeft}
          iconClassName='bg-emerald-50 text-emerald-600'
          label={t('cashflowPage.summary.in')}
          value={formatCurrency(stats.total_revenue)}
          hint={t('cashflowPage.summary.inHint')}
        />
        <Tile
          order={2}
          icon={ArrowUpRight}
          iconClassName='bg-amber-50 text-amber-600'
          label={t('cashflowPage.summary.out')}
          value={formatCurrency(stats.total_out_provider)}
          hint={t('cashflowPage.summary.outHint')}
        />
        {hasPgFees && (
          <Tile
            order={3}
            icon={Landmark}
            iconClassName='bg-slate-100 text-slate-500'
            label={t('cashflowPage.summary.pgFee')}
            value={formatCurrency(stats.total_out_pg)}
            hint={t('cashflowPage.summary.pgFeeHint')}
          />
        )}
        <Tile
          order={4}
          className={hasPgFees ? undefined : 'col-span-2'}
          icon={ListOrdered}
          iconClassName='bg-brand-purple/10 text-brand-purple'
          label={t('cashflowPage.summary.entries')}
          value={formatNumber(total)}
          hint={t('cashflowPage.summary.entriesHint')}
        />
      </ul>
    </section>
  )
}

function NetHero({ stats, periodLabel }: { stats: CashflowPeriodSummary['stats']; periodLabel: string }) {
  const { t, i18n } = useTranslation('common')
  const locale = i18n.language.startsWith('id') ? 'id-ID' : 'en-US'
  const pct = (value: number) => new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(value)

  const income = stats.total_revenue
  const cost = stats.total_outflow
  const net = stats.net_profit
  const loss = net < 0
  const overspend = cost > income
  const Icon = loss ? TrendingDown : TrendingUp

  return (
    <div className='relative animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'>
      <span className='absolute -left-1.5 -top-1.5 size-5 border-l-[3px] border-t-[3px] border-brand-purple' aria-hidden />
      <span className='absolute -bottom-1.5 -right-1.5 size-5 border-b-[3px] border-r-[3px] border-brand-cyan' aria-hidden />
      <div className='h-full bg-slate-200/80 p-px hud-clip'>
        <div className='flex h-full flex-col bg-white hud-clip'>
          <div className='relative h-1 overflow-hidden bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden>
            <span className='absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/80 to-transparent animate-hud-trace' />
          </div>
          <div className='flex flex-1 flex-col gap-5 p-6'>
            <div className='flex items-start justify-between gap-4'>
              <div className='min-w-0 space-y-2'>
                <p className='font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
                  {loss ? t('cashflowPage.summary.loss') : t('cashflowPage.summary.net')}
                  <span className='ml-2 normal-case tracking-normal text-slate-400'>· {periodLabel}</span>
                </p>
                <p
                  className={cn(
                    'truncate font-display text-4xl font-bold tracking-tight sm:text-[2.75rem]',
                    loss ? 'text-rose-600' : 'text-slate-900'
                  )}
                >
                  {formatCurrency(net)}
                </p>
                {income > 0 && (
                  <p className={cn('text-xs', loss ? 'text-rose-700' : 'text-slate-500')}>
                    {loss
                      ? t('cashflowPage.summary.lossOf', { pct: pct(-net / income) })
                      : t('cashflowPage.summary.marginOf', { pct: pct(net / income) })}
                  </p>
                )}
              </div>
              <span
                className={cn(
                  'grid size-11 shrink-0 place-items-center text-white hud-clip-sm',
                  loss ? 'bg-linear-to-br from-rose-500 to-amber-400' : 'bg-linear-to-br from-brand-purple to-brand-cyan'
                )}
                aria-hidden
              >
                <Icon className='size-5' />
              </span>
            </div>

            <div className='mt-auto space-y-2.5'>
              {/* Where money in went: provider cost vs what was kept. One bar, 2px gaps, labelled below. */}
              <div className='flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-slate-100' role='presentation'>
                {overspend ? (
                  <div className='h-full w-full rounded-full bg-rose-500/80' />
                ) : income > 0 ? (
                  <>
                    {cost > 0 && (
                      <div className='h-full rounded-l-full bg-slate-400 transition-[flex-grow] duration-700 ease-hud' style={{ flexGrow: cost, flexBasis: 0 }} />
                    )}
                    {net > 0 && (
                      <div
                        className={cn('h-full bg-emerald-500 transition-[flex-grow] duration-700 ease-hud', cost > 0 ? 'rounded-r-full' : 'rounded-full')}
                        style={{ flexGrow: net, flexBasis: 0 }}
                      />
                    )}
                  </>
                ) : null}
              </div>
              {overspend ? (
                <p className='text-xs font-medium text-rose-700'>
                  {t('cashflowPage.summary.overspend', { amount: formatCurrency(cost - income) })}
                </p>
              ) : income > 0 ? (
                <div className='flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600'>
                  <Legend swatch='bg-slate-400'>
                    {t('cashflowPage.summary.costShare', { amount: formatCurrency(cost), pct: pct(cost / income) })}
                  </Legend>
                  <Legend swatch='bg-emerald-500'>
                    {t('cashflowPage.summary.keptShare', { amount: formatCurrency(Math.max(0, net)), pct: pct(Math.max(0, net) / income) })}
                  </Legend>
                </div>
              ) : (
                <p className='text-xs text-slate-500'>{t('cashflowPage.summary.noIncome')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Legend({ swatch, children }: { swatch: string; children: ReactNode }) {
  return (
    <span className='inline-flex items-center gap-1.5'>
      <span className={cn('size-2.5 shrink-0 rounded-sm', swatch)} aria-hidden />
      <span className='tabular-nums'>{children}</span>
    </span>
  )
}

interface TileProps {
  order: number
  icon: LucideIcon
  iconClassName: string
  label: string
  value: string
  hint: string
  className?: string
}

function Tile({ order, icon: Icon, iconClassName, label, value, hint, className }: TileProps) {
  return (
    <li
      className={cn('min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both', className)}
      style={{ animationDelay: `${order * 60}ms` }}
    >
      <div className='h-full bg-slate-200/80 p-px transition-colors duration-300 hud-clip-sm hover:bg-brand-purple/40'>
        <div className='flex h-full flex-col gap-2 bg-white p-4 hud-clip-sm'>
          <div className='flex items-center justify-between gap-2'>
            <p className='truncate font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{label}</p>
            <span className={cn('grid size-7 shrink-0 place-items-center hud-clip-sm', iconClassName)} aria-hidden>
              <Icon className='size-3.5' />
            </span>
          </div>
          <p className='truncate font-display text-xl font-bold text-slate-900 sm:text-2xl'>{value}</p>
          <p className='mt-auto line-clamp-2 text-xs leading-snug text-slate-500'>{hint}</p>
        </div>
      </div>
    </li>
  )
}
