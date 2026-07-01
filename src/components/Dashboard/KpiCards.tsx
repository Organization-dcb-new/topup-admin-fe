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
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        up && 'text-emerald-600',
        down && 'text-red-600',
        (pct == null || pct === 0) && 'text-muted-foreground',
      )}
    >
      <Icon className='h-3.5 w-3.5' aria-hidden />
      {formatChangePct(pct)}
      <span className='font-normal text-muted-foreground'>{t('dashboard.kpi.vsPrev')}</span>
    </span>
  )
}

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  change?: ComparisonMetric
  valueClass?: string
}

function StatCard({ label, value, icon: Icon, change, valueClass }: StatCardProps) {
  return (
    <Card className='gap-0 rounded-xl py-0 shadow-sm ring-1 ring-gray-900/5'>
      <CardContent className='space-y-1 p-3'>
        <div className='flex items-center justify-between gap-2'>
          <p className='truncate text-xs font-medium text-muted-foreground'>{label}</p>
          <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary'>
            <Icon className='h-3.5 w-3.5' aria-hidden />
          </span>
        </div>
        <p className={cn('text-xl font-semibold tabular-nums text-foreground', valueClass)}>
          {value}
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
    <div className='grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5'>
      <StatCard
        label={t('dashboard.kpi.totalOrders')}
        value={formatNumber(summary.total_orders)}
        icon={ShoppingCart}
        change={comparison.orders}
      />
      <StatCard
        label={t('dashboard.kpi.revenue')}
        value={formatCurrency(summary.total_revenue)}
        icon={Wallet}
        change={comparison.revenue}
      />
      <StatCard
        label={t('dashboard.kpi.margin')}
        value={formatCurrency(summary.total_margin)}
        icon={TrendingUp}
        change={comparison.margin}
        valueClass={marginNegative ? 'text-red-600' : 'text-emerald-600'}
      />
      <StatCard
        label={t('dashboard.kpi.avgOrderValue')}
        value={formatCurrency(summary.avg_order_value)}
        icon={Receipt}
      />
      <StatCard
        label={t('dashboard.kpi.successRate')}
        value={formatRatioPercent(summary.success_rate)}
        icon={CheckCircle2}
      />
    </div>
  )
}
