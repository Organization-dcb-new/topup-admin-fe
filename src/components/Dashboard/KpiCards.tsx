import { Card, CardContent } from '@/components/ui/card'
import {
  formatChangePct,
  formatCurrency,
  formatNumber,
  formatRatioPercent,
} from '@/lib/format'
import { cn } from '@/lib/utils'
import type {
  ComparisonMetric,
  DashboardComparison,
  DashboardSummary,
} from '@/types/dashboard'
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Minus,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function ChangeIndicator({ metric }: { metric?: ComparisonMetric }) {
  const { t } = useTranslation('common')
  const pct = metric?.change_pct ?? null
  const up = pct != null && pct > 0
  const down = pct != null && pct < 0
  const Icon = pct == null || pct === 0 ? Minus : up ? ArrowUpRight : ArrowDownRight

  return (
    <span className='flex flex-wrap items-center gap-1.5'>
      <span
        className={cn(
          'nb-frame nb-frame-thin inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-black tabular-nums',
          up && 'bg-[#c9f24d]',
          down && 'bg-[#ff4d3d]',
          (pct == null || pct === 0) && 'bg-[#f5f1e8]',
        )}
      >
        <Icon className='h-3 w-3' strokeWidth={3} aria-hidden />
        {formatChangePct(pct)}
      </span>
      <span className='text-[10px] font-bold uppercase tracking-[0.08em] text-[#111]/55'>
        {t('dashboard.kpi.vsPrev')}
      </span>
    </span>
  )
}

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  /** Warna kotak ikon — pembeda antar KPI saat dilihat sekilas. */
  accent: string
  change?: ComparisonMetric
  /** Sorotan di belakang angka, dipakai KPI margin untuk menandai untung/rugi. */
  valueClass?: string
}

function StatCard({ label, value, icon: Icon, accent, change, valueClass }: StatCardProps) {
  return (
    <Card className='nb-frame nb-frame-thick nb-sd nb-press gap-0 bg-white py-0'>
      <CardContent className='space-y-2 p-3'>
        <div className='flex items-center justify-between gap-2'>
          <p className='truncate text-[11px] font-black uppercase tracking-[0.12em] text-[#111]/60'>
            {label}
          </p>
          <span
            className={cn(
              'nb-frame nb-frame-thin flex h-7 w-7 shrink-0 items-center justify-center',
              accent,
            )}
          >
            <Icon className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
          </span>
        </div>
        <p className='text-xl font-black leading-tight tabular-nums text-[#111]'>
          <span className={cn('inline-block', valueClass)}>{value}</span>
        </p>
        {change && <ChangeIndicator metric={change} />}
      </CardContent>
    </Card>
  )
}

interface KpiCardsProps {
  summary: DashboardSummary
  comparison: DashboardComparison
}

export function KpiCards({ summary, comparison }: KpiCardsProps) {
  const { t } = useTranslation('common')
  const marginNegative = summary.total_margin < 0

  return (
    <div className='grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5'>
      <StatCard
        label={t('dashboard.kpi.totalOrders')}
        value={formatNumber(summary.total_orders)}
        icon={ShoppingCart}
        accent='bg-[#6fe3f5]'
        change={comparison.orders}
      />
      <StatCard
        label={t('dashboard.kpi.revenue')}
        value={formatCurrency(summary.total_revenue)}
        icon={Wallet}
        accent='bg-[#c9f24d]'
        change={comparison.revenue}
      />
      <StatCard
        label={t('dashboard.kpi.margin')}
        value={formatCurrency(summary.total_margin)}
        icon={TrendingUp}
        accent='bg-[#ff9ed2]'
        change={comparison.margin}
        valueClass={marginNegative ? 'bg-[#ff4d3d] px-1' : 'bg-[#c9f24d] px-1'}
      />
      <StatCard
        label={t('dashboard.kpi.avgOrderValue')}
        value={formatCurrency(summary.avg_order_value)}
        icon={Receipt}
        accent='bg-[#ffd84d]'
      />
      <StatCard
        label={t('dashboard.kpi.successRate')}
        value={formatRatioPercent(summary.success_rate)}
        icon={CheckCircle2}
        accent='bg-[#ff9d3d]'
      />
    </div>
  )
}
