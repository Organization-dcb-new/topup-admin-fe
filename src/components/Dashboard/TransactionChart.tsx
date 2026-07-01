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
import { dashCard, dashCardHeader } from '@/components/Dashboard/styles'
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
  const color = metric === 'margin' ? '#8b5cf6' : isCount ? '#0ea5e9' : '#059669'

  return (
    <Card className={dashCard}>
      <CardHeader
        className={`${dashCardHeader} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
      >
        <CardTitle className='text-sm font-semibold text-gray-900'>
          {t('dashboard.chart.title')}
        </CardTitle>
        <div className='flex flex-wrap items-center gap-2'>
          <Select value={metric} onValueChange={(v) => setMetric(v as Metric)}>
            <SelectTrigger className='h-8 w-36' aria-label={t('dashboard.chart.metricLabel')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METRICS.map((m) => (
                <SelectItem key={m} value={m}>
                  {t(`dashboard.chart.metric.${m}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={granularity}
            onValueChange={(v) => setGranularity(v as DashboardGranularity)}
          >
            <SelectTrigger className='h-8 w-28' aria-label={t('dashboard.chart.granularityLabel')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GRANULARITY_BY_RANGE[params.range].map((g) => (
                <SelectItem key={g} value={g}>
                  {t(GRANULARITY_LABEL_KEY[g])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className='p-4'>
        {isLoading ? (
          <div className='flex h-56 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' aria-hidden />
          </div>
        ) : isError ? (
          <div className='flex h-56 flex-col items-center justify-center gap-2 text-center'>
            <AlertCircle className='h-8 w-8 text-destructive' aria-hidden />
            <p className='text-sm font-medium text-destructive'>
              {extractErrorMessage(error) ?? t('dashboard.chart.loadError')}
            </p>
          </div>
        ) : series.length === 0 ? (
          <div className='flex h-56 items-center justify-center'>
            <p className='text-sm text-muted-foreground'>{t('dashboard.chart.empty')}</p>
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={224}>
            <AreaChart data={series} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id='chartFill' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor={color} stopOpacity={0.3} />
                  <stop offset='95%' stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
              <XAxis
                dataKey='time_key'
                tickFormatter={(v) => formatBucketLabel(v, granularity, i18n.language)}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v) =>
                  isCount ? formatCompactNumber(v) : formatCompactCurrency(v)
                }
              />
              <Tooltip
                labelFormatter={(v) => formatBucketFull(String(v), i18n.language)}
                formatter={(value) => {
                  const num = typeof value === 'number' ? value : Number(value)
                  return [
                    isCount ? formatNumber(num) : formatCurrency(num),
                    t(`dashboard.chart.metric.${metric}`),
                  ] as [string, string]
                }}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              <Area
                type='monotone'
                dataKey={metric}
                stroke={color}
                strokeWidth={2}
                fill='url(#chartFill)'
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
