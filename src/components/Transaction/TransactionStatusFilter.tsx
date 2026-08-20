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
import { txClear } from '@/components/Transaction/styles'
import { cn } from '@/lib/utils'
import type { Payment } from '@/types/transaction'
import { FilterX, ListFilter } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const ALL = '__all__'

const STATUS_ORDER: Payment['status'][] = ['PAID', 'PENDING', 'FAILED', 'PROCESSING', 'EXPIRED']

interface TransactionStatusFilterProps {
  value: '' | Payment['status']
  onChange: (status: '' | Payment['status']) => void
}

export default function TransactionStatusFilter({ value, onChange }: TransactionStatusFilterProps) {
  const { t } = useTranslation('common')
  const selectValue = value === '' ? ALL : value

  return (
    <div className='flex w-full min-w-0 items-center gap-2'>
      <div className='min-w-0 flex-1'>
        <Select
          value={selectValue}
          onValueChange={(v) => onChange(v === ALL ? '' : (v as Payment['status']))}
        >
          <SelectTrigger
            className={cn(dashSelectTrigger, 'h-10 w-full min-w-0')}
            aria-label={t('transactionFilters.status.filterAria')}
          >
            <ListFilter className='mr-2 h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
            <SelectValue placeholder={t('transactionFilters.status.placeholderAll')} />
          </SelectTrigger>
          <SelectContent className={dashSelectContent}>
            <SelectItem value={ALL} className={dashSelectItem}>
              {t('transactionFilters.status.optionAll')}
            </SelectItem>
            {STATUS_ORDER.map((opt) => (
              <SelectItem key={opt} value={opt} className={dashSelectItem}>
                {t(`paymentStatus.${opt}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {value !== '' && (
        <button
          type='button'
          className={txClear}
          onClick={() => onChange('')}
          aria-label={t('transactionFilters.status.clearAria')}
        >
          <FilterX className='h-4 w-4' strokeWidth={3} aria-hidden />
        </button>
      )}
    </div>
  )
}
