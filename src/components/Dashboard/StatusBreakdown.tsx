import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ORDER_STATUSES, STATUS_META } from '@/lib/dashboard'
import { dashCard, dashCardHeader } from '@/components/Dashboard/styles'
import { formatNumber, formatRatioPercent } from '@/lib/format'
import type { OrderStatus, StatusBreakdown as StatusBreakdownMap } from '@/types/dashboard'
import { useTranslation } from 'react-i18next'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

interface StatusBreakdownProps {
  statusBreakdown: Partial<StatusBreakdownMap>
  successRate: number
  totalOrders: number
}

export function StatusBreakdown({
  statusBreakdown,
  successRate,
  totalOrders,
}: StatusBreakdownProps) {
  const { t } = useTranslation('common')

  const rows = ORDER_STATUSES.map((status) => ({
    status,
    count: statusBreakdown[status] ?? 0,
    color: STATUS_META[status].color,
  }))
  const chartData = rows.filter((r) => r.count > 0)

  return (
    <Card className={dashCard}>
      <CardHeader className={dashCardHeader}>
        <CardTitle className='text-sm font-semibold text-gray-900'>
          {t('dashboard.status.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-4 p-4 sm:grid-cols-[minmax(0,8rem)_1fr] sm:items-center'>
        <div className='relative mx-auto h-32 w-32'>
          {chartData.length > 0 ? (
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey='count'
                  nameKey='status'
                  innerRadius={40}
                  outerRadius={56}
                  paddingAngle={2}
                  stroke='none'
                >
                  {chartData.map((r) => (
                    <Cell key={r.status} fill={r.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className='flex h-full items-center justify-center rounded-full border border-dashed border-border/70' />
          )}
          <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
            <span className='text-base font-semibold tabular-nums text-foreground'>
              {formatNumber(totalOrders)}
            </span>
            <span className='text-[0.65rem] uppercase tracking-wide text-muted-foreground'>
              {t('dashboard.status.orders')}
            </span>
          </div>
        </div>

        <div className='space-y-1.5'>
          <div className='mb-2 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-1.5'>
            <span className='text-xs font-medium text-emerald-700'>
              {t('dashboard.status.successRate')}
            </span>
            <span className='text-sm font-semibold tabular-nums text-emerald-700'>
              {formatRatioPercent(successRate)}
            </span>
          </div>
          {rows.map((r) => (
            <div key={r.status} className='flex items-center justify-between gap-2 text-sm'>
              <span className='flex min-w-0 items-center gap-2'>
                <span
                  className='h-2.5 w-2.5 shrink-0 rounded-full'
                  style={{ backgroundColor: r.color }}
                  aria-hidden
                />
                <span className='truncate text-muted-foreground'>
                  {t(`dashboard.orderStatus.${r.status as OrderStatus}`)}
                </span>
              </span>
              <span className='tabular-nums font-medium text-foreground'>
                {formatNumber(r.count)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
