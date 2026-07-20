import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RANGE_OPTIONS } from '@/lib/dashboard'
import type { DashboardRange } from '@/types/dashboard'
import { format } from 'date-fns'
import { CalendarIcon, RotateCw } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const RANGE_LABEL_KEY: Record<DashboardRange, string> = {
  today: 'dashboard.range.today',
  '7d': 'dashboard.range.last7d',
  '30d': 'dashboard.range.last30d',
  this_month: 'dashboard.range.thisMonth',
  custom: 'dashboard.range.custom',
}

interface DashboardFiltersProps {
  range: DashboardRange
  onRangeChange: (range: DashboardRange) => void
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  pollingInterval: number | false
  onPollingIntervalChange: (v: number | false) => void
  onRefresh: () => void
  isRefreshing?: boolean
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
}: DashboardFiltersProps) {
  const { t } = useTranslation('common')

  return (
    <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
      {/* Auto Refresh dropdown selector */}
      <div className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-slate-400'>
        <span>Auto Refresh:</span>
        <select
          value={pollingInterval === false ? 'off' : pollingInterval}
          onChange={(e) => {
            const val = e.target.value
            if (val === 'off') onPollingIntervalChange(false)
            else onPollingIntervalChange(Number(val))
          }}
          className='bg-transparent border-none focus:outline-hidden font-bold text-primary cursor-pointer'
        >
          <option value='off'>Off</option>
          <option value='30000'>30s</option>
          <option value='60000'>1m</option>
          <option value='300000'>5m</option>
        </select>
      </div>

      {/* Manual Refresh Trigger */}
      <Button
        type='button'
        variant='outline'
        size='icon'
        onClick={onRefresh}
        disabled={isRefreshing}
        className='h-9 w-9 rounded-lg border-slate-200 dark:border-zinc-800 text-slate-550 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer shadow-2xs'
        title='Refresh data'
      >
        <RotateCw className={cn('h-4 w-4 text-slate-500', isRefreshing && 'animate-spin')} />
      </Button>

      <Select value={range} onValueChange={(v) => onRangeChange(v as DashboardRange)}>
        <SelectTrigger className='w-44 border-slate-200 dark:border-zinc-800' aria-label={t('dashboard.rangeLabel')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {RANGE_OPTIONS.map((r) => (
            <SelectItem key={r} value={r}>
              {t(RANGE_LABEL_KEY[r])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {range === 'custom' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              aria-label={t('dashboard.pickDateAria')}
              className={`w-64 justify-start text-left font-normal border-slate-200 dark:border-zinc-800 ${!date?.from && 'text-muted-foreground'}`}
            >
              <CalendarIcon className='mr-2 h-4 w-4' aria-hidden />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'LLL dd, y')} – {format(date.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(date.from, 'LLL dd, y')
                )
              ) : (
                <span>{t('dashboard.pickDateRange')}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              initialFocus
              mode='range'
              selected={date}
              onSelect={onDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
