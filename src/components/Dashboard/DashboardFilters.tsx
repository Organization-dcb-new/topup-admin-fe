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
import {
  dashSelectContent,
  dashSelectItem,
  dashSelectTrigger,
} from '@/components/Dashboard/styles'
import { RANGE_OPTIONS } from '@/lib/dashboard'
import type { DashboardRange } from '@/types/dashboard'
import { format } from 'date-fns'
import { CalendarIcon, RotateCw } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

/** Nilai `<option>` polling; `off` mematikan refetch berkala. */
const POLLING_OPTIONS = [
  { value: 'off', labelKey: 'dashboard.autoRefresh.off' },
  { value: '30000', labelKey: 'dashboard.autoRefresh.30s' },
  { value: '60000', labelKey: 'dashboard.autoRefresh.1m' },
  { value: '300000', labelKey: 'dashboard.autoRefresh.5m' },
] as const

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
      <label className='nb-frame nb-frame-thin nb-sd-sm flex h-9 items-center gap-1.5 bg-white px-2.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#111]'>
        <span>{t('dashboard.autoRefresh.label')}</span>
        <select
          value={pollingInterval === false ? 'off' : pollingInterval}
          onChange={(e) => {
            const val = e.target.value
            if (val === 'off') onPollingIntervalChange(false)
            else onPollingIntervalChange(Number(val))
          }}
          className='nb-focus cursor-pointer border-none bg-transparent font-black text-[#111] focus:outline-hidden'
        >
          {POLLING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </label>

      {/* Manual Refresh Trigger */}
      <Button
        type='button'
        variant='outline'
        size='icon'
        onClick={onRefresh}
        disabled={isRefreshing}
        className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-9 w-9 cursor-pointer bg-[#ffd84d] text-[#111] hover:bg-[#ffd84d] hover:text-[#111]'
        title={t('dashboard.refresh')}
        aria-label={t('dashboard.refresh')}
      >
        <RotateCw
          className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
          strokeWidth={3}
          aria-hidden
        />
      </Button>

      <Select value={range} onValueChange={(v) => onRangeChange(v as DashboardRange)}>
        <SelectTrigger
          className={`${dashSelectTrigger} h-9 w-44`}
          aria-label={t('dashboard.rangeLabel')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={dashSelectContent}>
          {RANGE_OPTIONS.map((r) => (
            <SelectItem key={r} value={r} className={dashSelectItem}>
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
              className={cn(
                'nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-9 w-64 cursor-pointer justify-start bg-white text-left font-bold text-[#111] hover:bg-[#ffd84d] hover:text-[#111]',
                !date?.from && 'text-[#111]/55',
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' strokeWidth={3} aria-hidden />
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
          {/* Portal berada di luar pembungkus `.nb`, jadi kelasnya dipasang lagi. */}
          <PopoverContent
            className='nb nb-frame nb-frame-thick nb-sd w-auto bg-white p-0'
            align='start'
          >
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
