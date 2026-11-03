import { useState } from 'react'
import { format } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import { CalendarIcon, X } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'

import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DateRangeFilterProps {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
  placeholder: string
  className?: string
}

/** Day-range picker in the HUD style; future days can't be picked. */
export function DateRangeFilter({ value, onChange, placeholder, className }: DateRangeFilterProps) {
  const { t, i18n } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const locale = i18n.language.startsWith('id') ? idLocale : enUS
  const fmt = (d: Date) => format(d, 'dd MMM yyyy', { locale })
  const label = value?.from ? (value.to && value.to.getTime() !== value.from.getTime() ? `${fmt(value.from)} – ${fmt(value.to)}` : fmt(value.from)) : null

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type='button'
            className={cn(
              'inline-flex h-10 w-full items-center gap-2 rounded-md border bg-white pl-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40',
              label ? 'border-brand-purple/40 pr-9 text-slate-800' : 'border-slate-200 pr-3 text-slate-400 hover:border-slate-300'
            )}
          >
            <CalendarIcon className={cn('size-4 shrink-0', label ? 'text-brand-purple' : 'text-slate-400')} aria-hidden />
            <span className='truncate'>{label ?? placeholder}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='range'
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={locale}
            disabled={{ after: new Date() }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      {label && (
        <button
          type='button'
          onClick={() => onChange(undefined)}
          aria-label={t('dateRangeFilter.clear')}
          title={t('dateRangeFilter.clear')}
          className='absolute inset-y-0 right-0 grid w-9 place-items-center text-slate-400 hover:text-rose-600'
        >
          <X className='size-3.5' aria-hidden />
        </button>
      )}
    </div>
  )
}
