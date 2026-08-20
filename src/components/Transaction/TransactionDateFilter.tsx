import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { txClear, txControl, txField, txLabel, txPopover } from '@/components/Transaction/styles'
import { cn } from '@/lib/utils'
import { format, startOfDay } from 'date-fns'
import { CalendarIcon, FilterX } from 'lucide-react'
import type { ChangeEvent } from 'react'
import type { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'

interface TransactionDateFilterProps {
  date: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
}

function parseTimeParts(value: string): [number, number, number] {
  const parts = value.split(':').map((p) => parseInt(p, 10))
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0]
}

function applyTimeToDay(day: Date, timeValue: string): Date {
  const d = startOfDay(day)
  const [h, m, s] = parseTimeParts(timeValue)
  d.setHours(h, m, s, 0)
  return d
}

function timeInputValue(d: Date): string {
  return format(d, 'HH:mm:ss')
}

export default function TransactionDateFilter({
  date,
  onChange,
}: TransactionDateFilterProps) {
  const { t } = useTranslation('common')
  const tsPattern = 'yyyy-MM-dd HH:mm:ss'

  const rangeLabel = date?.from
    ? `${format(date.from, tsPattern)} — ${format(date.to ?? date.from, tsPattern)}`
    : null

  const calendarSelected: DateRange | undefined = date?.from
    ? {
        from: startOfDay(date.from),
        to: startOfDay(date.to ?? date.from),
      }
    : undefined

  const handleCalendarSelect = (next: DateRange | undefined) => {
    if (!next?.from) {
      onChange(undefined)
      return
    }

    const prevStartTime = date?.from ? timeInputValue(date.from) : '00:00:00'
    const prevEndTime = date?.to
      ? timeInputValue(date.to)
      : date?.from
        ? timeInputValue(date.from)
        : '23:59:59'

    const endDay = next.to ?? next.from
    const from = applyTimeToDay(next.from, prevStartTime)
    const to = applyTimeToDay(endDay, prevEndTime)
    onChange({ from, to })
  }

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!date?.from) return
    const v = e.target.value
    if (!v) return
    const from = applyTimeToDay(date.from, v)
    const to = new Date(date.to ?? date.from)
    onChange({ from, to })
  }

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!date?.from) return
    const v = e.target.value
    if (!v) return
    const endDay = date.to ?? date.from
    const to = applyTimeToDay(endDay, v)
    const from = new Date(date.from)
    onChange({ from, to })
  }

  return (
    <div className='flex w-full min-w-0 items-center gap-2'>
      <div className='min-w-0 flex-1'>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='outline'
              aria-label={t('transactionFilters.date.pickAria')}
              className={cn(
                txControl,
                'justify-start text-xs sm:text-sm',
                !date?.from && 'text-[#111]/55',
              )}
            >
            <CalendarIcon className='mr-2 h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
            {rangeLabel ? (
              <span className='truncate tabular-nums' title={rangeLabel}>
                {rangeLabel}
              </span>
            ) : (
              <span>{t('transactionFilters.date.placeholderButton')}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn(txPopover, 'w-auto')} align='start'>
          <Calendar
            initialFocus
            mode='range'
            selected={calendarSelected}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
          />
          {date?.from && (
            <div className='grid gap-3 border-t-4 border-[#111] bg-[#f5f1e8] p-3 sm:grid-cols-2'>
              <div className='grid gap-1.5'>
                <Label htmlFor='tx-filter-start-time' className={txLabel}>
                  {t('transactionFilters.date.startTime')}
                </Label>
                <Input
                  id='tx-filter-start-time'
                  type='time'
                  step={1}
                  className={txField}
                  value={timeInputValue(date.from)}
                  onChange={handleStartTimeChange}
                />
              </div>
              <div className='grid gap-1.5'>
                <Label htmlFor='tx-filter-end-time' className={txLabel}>
                  {t('transactionFilters.date.endTime')}
                </Label>
                <Input
                  id='tx-filter-end-time'
                  type='time'
                  step={1}
                  className={txField}
                  value={timeInputValue(date.to ?? date.from)}
                  onChange={handleEndTimeChange}
                />
              </div>
            </div>
          )}
        </PopoverContent>
        </Popover>
      </div>
      {date?.from && (
        <button
          type='button'
          className={txClear}
          onClick={() => onChange(undefined)}
          aria-label={t('transactionFilters.date.clearAria')}
        >
          <FilterX className='h-4 w-4' strokeWidth={3} aria-hidden />
        </button>
      )}
    </div>
  )
}
