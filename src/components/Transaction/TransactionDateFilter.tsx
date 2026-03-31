import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format, startOfDay } from 'date-fns'
import { CalendarIcon, FilterX } from 'lucide-react'
import type { ChangeEvent } from 'react'
import type { DateRange } from 'react-day-picker'

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
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`min-w-[200px] max-w-full justify-start text-left text-xs font-normal sm:min-w-[320px] sm:text-sm ${!date?.from && 'text-muted-foreground'}`}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {rangeLabel ? (
              <span className="truncate" title={rangeLabel}>
                {rangeLabel}
              </span>
            ) : (
              <span>Start & end date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={calendarSelected}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
          />
          {date?.from && (
            <div className="grid gap-3 border-t p-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="tx-filter-start-time" className="text-muted-foreground">
                  Jam mulai
                </Label>
                <Input
                  id="tx-filter-start-time"
                  type="time"
                  step={1}
                  value={timeInputValue(date.from)}
                  onChange={handleStartTimeChange}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="tx-filter-end-time" className="text-muted-foreground">
                  Jam selesai
                </Label>
                <Input
                  id="tx-filter-end-time"
                  type="time"
                  step={1}
                  value={timeInputValue(date.to ?? date.from)}
                  onChange={handleEndTimeChange}
                />
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {date?.from && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground shrink-0"
          onClick={() => onChange(undefined)}
          aria-label="Clear date range"
        >
          <FilterX className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
