import { format } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import { CalendarIcon, RotateCw, Timer } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'

import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RANGE_OPTIONS } from '@/lib/dashboard'
import { cn } from '@/lib/utils'
import type { DashboardRange } from '@/types/dashboard'
import { Segmented } from '@/components/ui/segmented'

const RANGE_LABEL_KEY: Record<DashboardRange, string> = {
  today: 'dashboard.range.today',
  '7d': 'dashboard.range.last7d',
  '30d': 'dashboard.range.last30d',
  this_month: 'dashboard.range.thisMonth',
  custom: 'dashboard.range.custom',
}

const POLLING_OPTIONS = ['off', '30000', '60000', '300000'] as const

const toolButtonClass =
  'inline-flex h-9 items-center gap-2 bg-white px-3 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200 hud-clip-sm transition-colors hover:text-brand-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-60'

interface DashboardFiltersProps {
  range: DashboardRange
  onRangeChange: (range: DashboardRange) => void
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  pollingInterval: number | false
  onPollingIntervalChange: (v: number | false) => void
  onRefresh: () => void
  isRefreshing?: boolean
  /** When the shown data was fetched, in ms. */
  updatedAt?: number
}

export function DashboardFilters({
  range,
  onRangeChange,
  date,
  onDateChange,
  pollingInterval,
  onPollingIntervalChange,
  onRefresh,
  isRefreshing,
  updatedAt,
}: DashboardFiltersProps) {
  const { t, i18n } = useTranslation('common')
  const locale = i18n.language.startsWith('id') ? idLocale : enUS
  const fmt = (d: Date) => format(d, 'dd MMM yyyy', { locale })

  return (
    <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
      <div className='flex min-w-0 flex-wrap items-center gap-2'>
        <Segmented
          size='md'
          value={range}
          onChange={onRangeChange}
          label={t('dashboard.rangeLabel')}
          options={RANGE_OPTIONS.map((r) => ({ value: r, label: t(RANGE_LABEL_KEY[r]) }))}
        />
        {range === 'custom' && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type='button'
                aria-label={t('dashboard.pickDateAria')}
                className={cn(toolButtonClass, 'animate-in fade-in slide-in-from-left-1 duration-300', !date?.from && 'text-slate-400')}
              >
                <CalendarIcon className='size-4 text-brand-purple' aria-hidden />
                {date?.from
                  ? date.to
                    ? `${fmt(date.from)} – ${fmt(date.to)}`
                    : fmt(date.from)
                  : t('dashboard.pickDateRange')}
              </button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='range'
                selected={date}
                onSelect={onDateChange}
                numberOfMonths={2}
                locale={locale}
                disabled={{ after: new Date() }}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        {updatedAt ? (
          <span className='mr-1 text-xs text-slate-500'>
            {t('dashboard.updatedAt', { time: format(updatedAt, 'HH:mm:ss') })}
          </span>
        ) : null}
        <Select
          value={pollingInterval === false ? 'off' : String(pollingInterval)}
          onValueChange={(v) => onPollingIntervalChange(v === 'off' ? false : Number(v))}
        >
          <SelectTrigger
            aria-label={t('dashboard.autoRefresh.label')}
            className='h-9 w-auto gap-2 rounded-none border-0 bg-white px-3 text-xs font-medium text-slate-600 shadow-none ring-1 ring-inset ring-slate-200 hud-clip-sm focus-visible:ring-2 focus-visible:ring-brand-purple/40'
          >
            <Timer className='size-4 text-slate-400' aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align='end'>
            {POLLING_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {t(`dashboard.autoRefresh.${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type='button'
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label={t('dashboard.refresh')}
          title={t('dashboard.refresh')}
          className={cn(toolButtonClass, 'w-9 justify-center px-0')}
        >
          <RotateCw className={cn('size-4', isRefreshing && 'animate-spin')} aria-hidden />
        </button>
      </div>
    </div>
  )
}
