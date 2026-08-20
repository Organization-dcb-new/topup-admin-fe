import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DashboardRangeParams } from '@/hooks/useDashboard'
import { useDashboardTimeseries } from '@/hooks/useDashboard'
import {
  defaultGranularity,
  fillTimeseriesGaps,
  formatBucketFull,
  formatBucketLabel,
  GRANULARITY_BY_RANGE,
} from '@/lib/dashboard'
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatCurrency,
  formatNumber,
} from '@/lib/format'
import i18n from '@/i18n'
import {
  dashAccent,
  dashCard,
  dashCardBody,
  dashCardHeader,
  dashCardTitle,
  dashSelectContent,
  dashSelectItem,
  dashSelectTrigger,
} from '@/components/Dashboard/styles'
import type { DashboardGranularity } from '@/types/dashboard'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Metric = 'count' | 'revenue' | 'margin'
const METRICS: Metric[] = ['count', 'revenue', 'margin']

/** Isian area per metrik; garisnya selalu hitam supaya kontras tetap tegas. */
const METRIC_FILL: Record<Metric, string> = {
  count: '#6fe3f5',
  revenue: '#c9f24d',
  margin: '#ff9ed2',
}

const INK = '#111111'

const GRANULARITY_LABEL_KEY: Record<DashboardGranularity, string> = {
  second: 'dashboard.granularity.second',
  minute: 'dashboard.granularity.minute',
  hour: 'dashboard.granularity.hour',
  day: 'dashboard.granularity.day',
  week: 'dashboard.granularity.week',
  month: 'dashboard.granularity.month',
}

function extractErrorMessage(error: unknown): string | undefined {
  return (error as { response?: { data?: { message?: string } } })?.response?.data?.message
}

interface TransactionChartProps {
  params: DashboardRangeParams
}

export function TransactionChart({ params }: TransactionChartProps) {
  const { t } = useTranslation('common')
  const [metric, setMetric] = useState<Metric>('count')
  const [granularity, setGranularity] = useState<DashboardGranularity>(
    defaultGranularity(params.range),
  )

  const { data, isLoading, isError, error } = useDashboardTimeseries(params, granularity)
  const series = data ? fillTimeseriesGaps(data.data.series, granularity) : []
  const isCount = metric === 'count'
  const fill = METRIC_FILL[metric]

  return (
    <Card className={dashCard}>
      <CardHeader
        className={`${dashCardHeader} ${dashAccent.cyan} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
      >
        <CardTitle className={dashCardTitle}>{t('dashboard.chart.title')}</CardTitle>
        <div className='flex flex-wrap items-center gap-2'>
          <Select value={metric} onValueChange={(v) => setMetric(v as Metric)}>
            <SelectTrigger
              className={`${dashSelectTrigger} h-8 w-36`}
              aria-label={t('dashboard.chart.metricLabel')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={dashSelectContent}>
              {METRICS.map((m) => (
                <SelectItem key={m} value={m} className={dashSelectItem}>
                  {t(`dashboard.chart.metric.${m}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={granularity}
            onValueChange={(v) => setGranularity(v as DashboardGranularity)}
          >
            <SelectTrigger
              className={`${dashSelectTrigger} h-8 w-28`}
              aria-label={t('dashboard.chart.granularityLabel')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={dashSelectContent}>
              {GRANULARITY_BY_RANGE[params.range].map((g) => (
                <SelectItem key={g} value={g} className={dashSelectItem}>
                  {t(GRANULARITY_LABEL_KEY[g])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className={dashCardBody}>
        {isLoading ? (
          <div className='flex h-56 items-center justify-center'>
            <span className='nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center bg-[#6fe3f5]'>
              <Loader2 className='h-7 w-7 animate-spin' strokeWidth={3} aria-hidden />
            </span>
          </div>
        ) : isError ? (
          <div className='flex h-56 flex-col items-center justify-center gap-3 text-center'>
            <span className='nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center bg-[#ff4d3d]'>
              <AlertCircle className='h-7 w-7' strokeWidth={3} aria-hidden />
            </span>
            <p className='text-xs font-black uppercase tracking-tight text-[#111]'>
              {extractErrorMessage(error) ?? t('dashboard.chart.loadError')}
            </p>
          </div>
        ) : series.length === 0 ? (
          <div className='flex h-56 items-center justify-center'>
            <p className='text-xs font-bold uppercase tracking-tight text-[#111]/55'>
              {t('dashboard.chart.empty')}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={224}>
            <AreaChart data={series} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray='4 4'
                vertical={false}
                stroke={INK}
                strokeOpacity={0.18}
              />
              <XAxis
                dataKey='time_key'
                tickFormatter={(v) => formatBucketLabel(v, granularity, i18n.language)}
                tick={{ fontSize: 11, fill: INK, fontWeight: 700 }}
                tickLine={false}
                axisLine={{ stroke: INK, strokeWidth: 2 }}
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 11, fill: INK, fontWeight: 700 }}
                tickLine={false}
                axisLine={{ stroke: INK, strokeWidth: 2 }}
                width={56}
                tickFormatter={(v) =>
                  isCount ? formatCompactNumber(v) : formatCompactCurrency(v)
                }
              />
              <Tooltip
                cursor={{ stroke: INK, strokeWidth: 2 }}
                labelFormatter={(v) => formatBucketFull(String(v), i18n.language)}
                formatter={(value) => {
                  const num = typeof value === 'number' ? value : Number(value)
                  return [
                    isCount ? formatNumber(num) : formatCurrency(num),
                    t(`dashboard.chart.metric.${metric}`),
                  ] as [string, string]
                }}
                contentStyle={{
                  background: '#fff',
                  border: `3px solid ${INK}`,
                  borderRadius: 0,
                  boxShadow: `5px 5px 0 0 ${INK}`,
                  fontSize: 12,
                  fontWeight: 700,
                  color: INK,
                }}
                labelStyle={{ fontWeight: 900, color: INK }}
                itemStyle={{ color: INK }}
              />
              {/* `linear` + garis tebal hitam: bentuknya bersudut, senada
                  dengan sisa halaman, dan tiap bucket tetap kebaca. */}
              <Area
                type='linear'
                dataKey={metric}
                stroke={INK}
                strokeWidth={3}
                fill={fill}
                fillOpacity={0.85}
                activeDot={{ r: 5, fill, stroke: INK, strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
