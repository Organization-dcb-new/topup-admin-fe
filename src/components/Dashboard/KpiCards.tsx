import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Minus, Receipt, ShoppingCart, TrendingUp, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'

import type { DashboardRangeParams } from '@/hooks/useDashboard'
import { useDashboardTimeseries } from '@/hooks/useDashboard'
import i18n from '@/i18n'
import { defaultGranularity, fillTimeseriesGaps, formatBucketFull } from '@/lib/dashboard'
import { formatChangePct, formatCompactCurrency, formatCurrency, formatNumber, formatRatioPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ComparisonMetric, DashboardComparison, DashboardSummary } from '@/types/dashboard'

function ChangeChip({ metric }: { metric?: ComparisonMetric }) {
  const { t } = useTranslation('common')
  const pct = metric?.change_pct ?? null
  const up = pct != null && pct > 0
  const down = pct != null && pct < 0
  const Icon = up ? ArrowUpRight : down ? ArrowDownRight : Minus

  if (pct == null) {
    return <span className='text-xs text-slate-400'>{t('dashboard.kpi.noPrev')}</span>
  }
  return (
    <span className='inline-flex items-center gap-1.5 text-xs text-slate-500'>
      <span
        className={cn(
          'inline-flex items-center gap-0.5 px-1.5 py-0.5 font-semibold tabular-nums hud-clip-sm',
          up && 'bg-emerald-50 text-emerald-700',
          down && 'bg-rose-50 text-rose-700',
          !up && !down && 'bg-slate-100 text-slate-600'
        )}
      >
        <Icon className='size-3.5' aria-hidden />
        {formatChangePct(pct)}
      </span>
      {t('dashboard.kpi.vsPrev')}
    </span>
  )
}

interface KpiCardsProps {
  summary: DashboardSummary
  comparison: DashboardComparison
  params: DashboardRangeParams
}

export function KpiCards({ summary, comparison, params }: KpiCardsProps) {
  const { t } = useTranslation('common')
  const marginNegative = summary.total_margin < 0

  return (
    <div className='grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]'>
      <RevenueHero summary={summary} comparison={comparison} params={params} />
      <ul className='grid grid-cols-2 gap-4'>
        <StatTile
          order={1}
          icon={ShoppingCart}
          label={t('dashboard.kpi.totalOrders')}
          value={formatNumber(summary.total_orders)}
          footer={<ChangeChip metric={comparison.orders} />}
        />
        <StatTile
          order={2}
          icon={TrendingUp}
          label={t('dashboard.kpi.margin')}
          value={formatCurrency(summary.total_margin)}
          valueClassName={marginNegative ? 'text-rose-600' : undefined}
          footer={<ChangeChip metric={comparison.margin} />}
        />
        <StatTile
          order={3}
          icon={Receipt}
          label={t('dashboard.kpi.avgOrderValue')}
          value={formatCurrency(summary.avg_order_value)}
          footer={<span className='text-xs text-slate-400'>{t('dashboard.kpi.perOrder')}</span>}
        />
        <StatTile
          order={4}
          icon={CheckCircle2}
          label={t('dashboard.kpi.successRate')}
          value={formatRatioPercent(summary.success_rate)}
          footer={
            <div
              className='h-1.5 w-full overflow-hidden rounded-full bg-slate-100'
              role='presentation'
            >
              <div
                className='h-full rounded-full bg-emerald-500 transition-[width] duration-700 ease-hud'
                style={{ width: `${Math.min(100, Math.max(0, summary.success_rate * 100))}%` }}
              />
            </div>
          }
        />
      </ul>
    </div>
  )
}

function RevenueHero({ summary, comparison, params }: KpiCardsProps) {
  const { t } = useTranslation('common')
  const granularity = defaultGranularity(params.range)
  // Same query as the trend chart's default view, so this costs no extra request.
  const { data } = useDashboardTimeseries(params, granularity)
  const series = data ? fillTimeseriesGaps(data.data.series, granularity) : []

  return (
    <div className='relative animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'>
      <span className='absolute -left-1.5 -top-1.5 size-5 border-l-[3px] border-t-[3px] border-brand-purple' aria-hidden />
      <span className='absolute -bottom-1.5 -right-1.5 size-5 border-b-[3px] border-r-[3px] border-brand-cyan' aria-hidden />
      <div className='h-full bg-slate-200/80 p-px hud-clip'>
        <div className='relative flex h-full flex-col overflow-hidden bg-white hud-clip'>
          <div className='relative h-1 overflow-hidden bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden>
            <span className='absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/80 to-transparent animate-hud-trace' />
          </div>
          <div className='flex items-start justify-between gap-4 px-6 pt-5'>
            <div className='min-w-0 space-y-2'>
              <p className='font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
                {t('dashboard.kpi.revenue')}
              </p>
              <p className='truncate font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-[2.75rem]'>
                {formatCurrency(summary.total_revenue)}
              </p>
              <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                <ChangeChip metric={comparison.revenue} />
                {comparison.revenue.previous > 0 && (
                  <span className='text-xs text-slate-400'>
                    {t('dashboard.kpi.previousValue', { value: formatCompactCurrency(comparison.revenue.previous) })}
                  </span>
                )}
              </div>
            </div>
            <span className='grid size-11 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm' aria-hidden>
              <Wallet className='size-5' />
            </span>
          </div>
          <div className='mt-auto h-24 pt-3' aria-hidden={series.length < 2}>
            {series.length >= 2 && (
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={series} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id='heroRevenueFill' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='0%' stopColor='#9c27b0' stopOpacity={0.22} />
                      <stop offset='100%' stopColor='#9c27b0' stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id='heroRevenueStroke' x1='0' y1='0' x2='1' y2='0'>
                      <stop offset='0%' stopColor='#9c27b0' />
                      <stop offset='100%' stopColor='#00bcd4' />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <div className='rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-lg'>
                          <p className='text-slate-500'>{formatBucketFull(String(label), i18n.language)}</p>
                          <p className='font-semibold tabular-nums text-slate-900'>{formatCurrency(Number(payload[0].value))}</p>
                        </div>
                      ) : null
                    }
                  />
                  <Area
                    type='monotone'
                    dataKey='revenue'
                    stroke='url(#heroRevenueStroke)'
                    strokeWidth={2}
                    fill='url(#heroRevenueFill)'
                    activeDot={{ r: 4, fill: '#9c27b0', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive
                    animationDuration={700}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatTileProps {
  order: number
  icon: LucideIcon
  label: string
  value: string
  valueClassName?: string
  footer: ReactNode
}

function StatTile({ order, icon: Icon, label, value, valueClassName, footer }: StatTileProps) {
  return (
    <li
      className='min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'
      style={{ animationDelay: `${order * 60}ms` }}
    >
      <div className='h-full bg-slate-200/80 p-px transition-colors duration-300 hud-clip-sm hover:bg-brand-purple/40'>
        <div className='flex h-full flex-col gap-2 bg-white p-4 hud-clip-sm'>
          <div className='flex items-center justify-between gap-2'>
            <p className='truncate font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{label}</p>
            <Icon className='size-4 shrink-0 text-brand-purple/70' aria-hidden />
          </div>
          <p className={cn('truncate font-display text-xl font-bold text-slate-900 sm:text-2xl', valueClassName)}>{value}</p>
          <div className='mt-auto'>{footer}</div>
        </div>
      </div>
    </li>
  )
}
