import { PieChart } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ORDER_STATUSES, STATUS_META } from '@/lib/dashboard'
import { formatNumber, formatRatioPercent } from '@/lib/format'
import type { StatusBreakdown as StatusBreakdownMap } from '@/types/dashboard'
import { DashboardPanel } from './DashboardPanel'

interface StatusBreakdownProps {
  statusBreakdown: Partial<StatusBreakdownMap>
  successRate: number
  totalOrders: number
  order?: number
}

export function StatusBreakdown({ statusBreakdown, successRate, totalOrders, order }: StatusBreakdownProps) {
  const { t } = useTranslation('common')

  const rows = ORDER_STATUSES.map((status) => ({
    status,
    count: statusBreakdown[status] ?? 0,
    color: STATUS_META[status].color,
  }))
  const total = rows.reduce((sum, r) => sum + r.count, 0)
  const segments = rows.filter((r) => r.count > 0)

  return (
    <DashboardPanel title={t('dashboard.status.title')} icon={PieChart} order={order}>
      <div className='flex items-end justify-between gap-4'>
        <div>
          <p className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>
            {t('dashboard.status.successRate')}
          </p>
          <p className='font-display text-3xl font-bold text-emerald-600'>{formatRatioPercent(successRate)}</p>
        </div>
        <p className='text-right text-xs text-slate-500'>
          <span className='block font-display text-lg font-bold text-slate-900'>{formatNumber(totalOrders)}</span>
          {t('dashboard.status.orders')}
        </p>
      </div>

      {/* Part-to-whole: one bar, 2px surface gaps between segments, labelled in the legend below. */}
      <div className='mt-4 flex h-3 gap-0.5 overflow-hidden rounded-full bg-slate-100' role='presentation'>
        {segments.map((r) => (
          <div
            key={r.status}
            className='h-full transition-[flex-grow] duration-700 ease-hud first:rounded-l-full last:rounded-r-full'
            style={{ flexGrow: r.count, flexBasis: 0, backgroundColor: r.color }}
            title={`${t(`dashboard.orderStatus.${r.status}`)}: ${formatNumber(r.count)}`}
          />
        ))}
      </div>

      <ul className='mt-4 space-y-1'>
        {rows.map((r) => (
          <li
            key={r.status}
            className='flex items-center justify-between gap-3 rounded px-1.5 py-1 text-sm transition-colors hover:bg-slate-50'
          >
            <span className='flex min-w-0 items-center gap-2'>
              <span className='size-2.5 shrink-0 rounded-sm' style={{ backgroundColor: r.color }} aria-hidden />
              <span className={r.count ? 'truncate text-slate-700' : 'truncate text-slate-400'}>
                {t(`dashboard.orderStatus.${r.status}`)}
              </span>
            </span>
            <span className='flex shrink-0 items-baseline gap-2 tabular-nums'>
              <span className={r.count ? 'font-semibold text-slate-900' : 'text-slate-300'}>{formatNumber(r.count)}</span>
              <span className='w-12 text-right text-xs text-slate-400'>
                {total > 0 ? formatRatioPercent(r.count / total) : '—'}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </DashboardPanel>
  )
}
