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
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'

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
}

export function DashboardFilters({
  range,
  onRangeChange,
  date,
  onDateChange,
}: DashboardFiltersProps) {
  const { t } = useTranslation('common')

  return (
    <div className='flex flex-wrap items-center gap-3'>
      <Select value={range} onValueChange={(v) => onRangeChange(v as DashboardRange)}>
        <SelectTrigger className='w-44' aria-label={t('dashboard.rangeLabel')}>
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
              className={`w-64 justify-start text-left font-normal ${!date?.from && 'text-muted-foreground'}`}
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
