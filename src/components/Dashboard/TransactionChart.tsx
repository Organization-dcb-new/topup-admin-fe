import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Activity, ChartArea } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { DashboardRangeParams } from '@/hooks/useDashboard'
import { useDashboardTimeseries } from '@/hooks/useDashboard'
import i18n from '@/i18n'
import {
  defaultGranularity,
  fillTimeseriesGaps,
  formatBucketFull,
  formatBucketLabel,
  GRANULARITY_BY_RANGE,
} from '@/lib/dashboard'
import { formatCompactCurrency, formatCompactNumber, formatCurrency, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { DashboardGranularity, TimeseriesPoint } from '@/types/dashboard'
import { DashboardPanel, Segmented } from './DashboardPanel'

type Metric = 'count' | 'revenue' | 'margin'
type View = 'chart' | 'table'
const METRICS: Metric[] = ['count', 'revenue', 'margin']

const formatMetric = (metric: Metric, value: number) => (metric === 'count' ? formatNumber(value) : formatCurrency(value))

function extractErrorMessage(error: unknown): string | undefined {
  return (error as { response?: { data?: { message?: string } } })?.response?.data?.message
}

export function TransactionChart({ params, order }: { params: DashboardRangeParams; order?: number }) {
  const { t } = useTranslation('common')
  const [metric, setMetric] = useState<Metric>('count')
  const [view, setView] = useState<View>('chart')
  const granularities = GRANULARITY_BY_RANGE[params.range]
  const [picked, setPicked] = useState<DashboardGranularity | null>(null)
  // Fall back to the range's default when the new range doesn't offer the picked granularity.
  const granularity = picked && granularities.includes(picked) ? picked : defaultGranularity(params.range)

  const { data, isLoading, isError, error, isPlaceholderData } = useDashboardTimeseries(params, granularity)
  const series = data ? fillTimeseriesGaps(data.data.series, data.data.granularity) : []

  return (
    <DashboardPanel
      title={t('dashboard.chart.title')}
      icon={Activity}
      order={order}
      bodyClassName='p-0'
      actions={
        <div className='flex flex-wrap items-center gap-2'>
          <Segmented
            value={metric}
            onChange={setMetric}
            label={t('dashboard.chart.metricLabel')}
            options={METRICS.map((m) => ({ value: m, label: t(`dashboard.chart.metric.${m}`) }))}
          />
          {granularities.length > 1 && (
            <Segmented
              value={granularity}
              onChange={setPicked}
              label={t('dashboard.chart.granularityLabel')}
              options={granularities.map((g) => ({ value: g, label: t(`dashboard.granularity.${g}`) }))}
            />
          )}
          <Segmented
            value={view}
            onChange={setView}
            label={t('dashboard.chart.viewLabel')}
            options={[
              { value: 'chart', label: t('dashboard.chart.viewChart') },
              { value: 'table', label: t('dashboard.chart.viewTable') },
            ]}
          />
        </div>
      }
    >
      <div className={cn('transition-opacity duration-300', isPlaceholderData && 'opacity-60')}>
        {isLoading ? (
          <div className='m-5 h-64 animate-pulse rounded-md bg-slate-100' aria-hidden />
        ) : isError ? (
          <div className='flex h-72 flex-col items-center justify-center gap-2 px-5 text-center'>
            <AlertCircle className='size-7 text-rose-500' aria-hidden />
            <p className='text-sm font-medium text-rose-600'>{extractErrorMessage(error) ?? t('dashboard.chart.loadError')}</p>
          </div>
        ) : series.length === 0 ? (
          <div className='flex h-72 flex-col items-center justify-center gap-2 px-5 text-center'>
            <ChartArea className='size-7 text-slate-300' aria-hidden />
            <p className='text-sm text-slate-500'>{t('dashboard.chart.empty')}</p>
          </div>
        ) : view === 'chart' ? (
          <TrendArea series={series} metric={metric} granularity={granularity} />
        ) : (
          <TrendTable series={series} granularity={granularity} />
        )}
      </div>
    </DashboardPanel>
  )
}

function TrendArea({ series, metric, granularity }: { series: TimeseriesPoint[]; metric: Metric; granularity: DashboardGranularity }) {
  const { t } = useTranslation('common')
  const isCount = metric === 'count'

  return (
    <div className='px-3 pb-3 pt-5 sm:px-4' role='img' aria-label={t('dashboard.chart.ariaLabel', { metric: t(`dashboard.chart.metric.${metric}`) })}>
      {/* Height includes the x-axis band, so the ticks never get clipped. */}
      <ResponsiveContainer width='100%' height={288}>
        <AreaChart data={series} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id='trendFill' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#9c27b0' stopOpacity={0.18} />
              <stop offset='100%' stopColor='#9c27b0' stopOpacity={0} />
            </linearGradient>
            <linearGradient id='trendStroke' x1='0' y1='0' x2='1' y2='0'>
              <stop offset='0%' stopColor='#9c27b0' />
              <stop offset='100%' stopColor='#00bcd4' />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke='#f1f5f9' />
          <XAxis
            dataKey='time_key'
            tickFormatter={(v) => formatBucketLabel(v, granularity, i18n.language)}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            minTickGap={28}
            height={28}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            width={60}
            allowDecimals={!isCount}
            tickFormatter={(v) => (isCount ? formatCompactNumber(v) : formatCompactCurrency(v))}
          />
          <Tooltip
            cursor={{ stroke: '#9c27b0', strokeOpacity: 0.35, strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              const point = payload?.[0]?.payload as TimeseriesPoint | undefined
              if (!active || !point) return null
              return (
                <div className='min-w-44 border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-xl hud-clip-sm'>
                  <p className='mb-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
                    {formatBucketFull(String(label), i18n.language)}
                  </p>
                  <p className='text-base font-semibold tabular-nums text-slate-900'>{formatMetric(metric, point[metric])}</p>
                  <dl className='mt-1.5 grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 text-slate-500'>
                    {METRICS.filter((m) => m !== metric).map((m) => (
                      <div key={m} className='contents'>
                        <dt>{t(`dashboard.chart.metric.${m}`)}</dt>
                        <dd className='text-right tabular-nums text-slate-700'>{formatMetric(m, point[m])}</dd>
                      </div>
                    ))}
                    {point.failed > 0 && (
                      <div className='contents'>
                        <dt>{t('dashboard.orderStatus.FAILED')}</dt>
                        <dd className='text-right tabular-nums text-rose-600'>{formatNumber(point.failed)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )
            }}
          />
          <Area
            type='monotone'
            dataKey={metric}
            stroke='url(#trendStroke)'
            strokeWidth={2}
            fill='url(#trendFill)'
            activeDot={{ r: 5, fill: '#9c27b0', stroke: '#fff', strokeWidth: 2 }}
            animationDuration={700}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function TrendTable({ series, granularity }: { series: TimeseriesPoint[]; granularity: DashboardGranularity }) {
  const { t } = useTranslation('common')
  const columns: { key: keyof TimeseriesPoint; label: string; render: (p: TimeseriesPoint) => string; tone?: string }[] = [
    { key: 'count', label: t('dashboard.chart.metric.count'), render: (p) => formatNumber(p.count) },
    { key: 'revenue', label: t('dashboard.chart.metric.revenue'), render: (p) => formatCurrency(p.revenue) },
    { key: 'margin', label: t('dashboard.chart.metric.margin'), render: (p) => formatCurrency(p.margin) },
    { key: 'failed', label: t('dashboard.orderStatus.FAILED'), render: (p) => formatNumber(p.failed), tone: 'text-rose-600' },
    { key: 'pending', label: t('dashboard.orderStatus.PENDING'), render: (p) => formatNumber(p.pending), tone: 'text-amber-600' },
  ]

  return (
    <div className='max-h-[19.5rem] overflow-auto'>
      <table className='w-full min-w-[36rem] text-sm'>
        <thead className='sticky top-0 bg-white'>
          <tr className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
            <th scope='col' className='px-5 py-2.5 text-left'>{t('dashboard.chart.time')}</th>
            {columns.map((c) => (
              <th key={c.key} scope='col' className='px-3 py-2.5 text-right last:pr-5'>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100'>
          {[...series].reverse().map((point) => (
            <tr key={point.time_key} className='transition-colors hover:bg-slate-50'>
              <th scope='row' className='whitespace-nowrap px-5 py-2 text-left font-medium text-slate-700'>
                {granularity === 'hour' || granularity === 'minute'
                  ? formatBucketFull(point.time_key, i18n.language)
                  : formatBucketLabel(point.time_key, granularity, i18n.language)}
              </th>
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    'px-3 py-2 text-right tabular-nums last:pr-5',
                    Number(point[c.key]) === 0 ? 'text-slate-300' : (c.tone ?? 'text-slate-700')
                  )}
                >
                  {c.render(point)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
