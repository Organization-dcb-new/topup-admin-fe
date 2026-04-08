import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { CalendarIcon, FilterX } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'

interface FilterProps {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
  groupBy: string
  setGroupBy: (val: string) => void
  onReset: () => void
}

export function SummaryFilter({
  date,
  setDate,
  groupBy,
  setGroupBy,
  onReset,
}: FilterProps) {
  const { t } = useTranslation('common')
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              aria-label={t('summaryFilter.pickDateAria')}
              className={`w-65 justify-start text-left font-normal ${!date && 'text-muted-foreground'}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {' '}
                    {format(date.from, 'LLL dd, y')}- {format(date.to, 'LLL dd, y')}{' '}
                  </>
                ) : (
                  format(date.from, 'LLL dd, y')
                )
              ) : (
                <span>{t('summaryFilter.pickDateRange')}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Select value={groupBy} onValueChange={setGroupBy}>
        <SelectTrigger className="w-37.5" aria-label={t('summaryFilter.groupByPlaceholder')}>
          <SelectValue placeholder={t('summaryFilter.groupByPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hour">{t('summaryFilter.groupHour')}</SelectItem>
          <SelectItem value="day">{t('summaryFilter.groupDay')}</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="ghost" onClick={onReset} className="text-muted-foreground">
        <FilterX className="mr-2 h-4 w-4" />
        {t('summaryFilter.reset')}
      </Button>
    </div>
  )
}
