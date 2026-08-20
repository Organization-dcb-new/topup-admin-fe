import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ORDER_STATUSES, STATUS_META } from '@/lib/dashboard'
import {
  dashAccent,
  dashCard,
  dashCardHeader,
  dashCardTitle,
} from '@/components/Dashboard/styles'
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
      <CardHeader className={`${dashCardHeader} ${dashAccent.yellow}`}>
        <CardTitle className={dashCardTitle}>{t('dashboard.status.title')}</CardTitle>
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
                  innerRadius={38}
                  outerRadius={58}
                  paddingAngle={3}
                  stroke='#111'
                  strokeWidth={3}
                >
                  {chartData.map((r) => (
                    <Cell key={r.status} fill={r.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className='nb-frame nb-round h-full w-full bg-[#f5f1e8]' />
          )}
          <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
            <span className='text-base font-black tabular-nums text-[#111]'>
              {formatNumber(totalOrders)}
            </span>
            <span className='text-[0.6rem] font-black uppercase tracking-[0.1em] text-[#111]/55'>
              {t('dashboard.status.orders')}
            </span>
          </div>
        </div>

        <div>
          <div className='nb-frame nb-frame-thin mb-2.5 flex items-center justify-between gap-2 bg-[#c9f24d] px-2.5 py-1.5'>
            <span className='text-[11px] font-black uppercase tracking-[0.08em]'>
              {t('dashboard.status.successRate')}
            </span>
            <span className='text-sm font-black tabular-nums'>
              {formatRatioPercent(successRate)}
            </span>
          </div>
          <div>
            {rows.map((r) => (
              <div
                key={r.status}
                className='flex items-center justify-between gap-2 border-b-2 border-[#111]/10 py-1 text-sm last:border-b-0'
              >
                <span className='flex min-w-0 items-center gap-2'>
                  <span
                    className='nb-frame nb-frame-thin h-3 w-3 shrink-0'
                    style={{ backgroundColor: r.color }}
                    aria-hidden
                  />
                  <span className='truncate text-xs font-bold uppercase tracking-tight text-[#111]/70'>
                    {t(`dashboard.orderStatus.${r.status as OrderStatus}`)}
                  </span>
                </span>
                <span className='font-black tabular-nums text-[#111]'>
                  {formatNumber(r.count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
