import { useTranslation } from 'react-i18next'
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react'

import { hudInputClass } from '@/components/Auth/hud-styles'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PERM } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { cn } from '@/lib/utils'
import { GameField, PaymentMethodField } from './TransactionPickers'
import { advancedCount, hasAnyFilter, type TransactionFilterState } from './transaction-filters'
import { PAYMENT_STATUSES } from './transaction-meta'

const ALL = '__all__'

interface TransactionFilterBarProps {
  value: TransactionFilterState
  onChange: (patch: Partial<TransactionFilterState>) => void
  onReset: () => void
  advancedOpen: boolean
  onAdvancedOpenChange: (open: boolean) => void
}

export function TransactionFilterBar({ value, onChange, onReset, advancedOpen, onAdvancedOpenChange }: TransactionFilterBarProps) {
  const { t } = useTranslation('common')
  const { can } = usePermissions()
  const extra = advancedCount(value)

  return (
    <div className='bg-slate-200/80 p-px hud-clip'>
      <div className='space-y-3 bg-white p-4 hud-clip'>
        <div className='grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem] lg:grid-cols-[minmax(0,1fr)_10.5rem_17.5rem_auto]'>
          <div className='group relative'>
            <span className='pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-slate-400 group-focus-within:text-brand-purple'>
              <Search className='size-4' aria-hidden />
            </span>
            <Input
              value={value.search}
              onChange={(e) => onChange({ search: e.target.value })}
              placeholder={t('transactionPage.filters.searchPlaceholder')}
              aria-label={t('transactionPage.filters.searchPlaceholder')}
              title={t('transactionPage.filters.searchHint')}
              className={cn(hudInputClass, 'h-10 bg-white pl-10 text-sm')}
            />
          </div>
          <Select value={value.status || ALL} onValueChange={(v) => onChange({ status: v === ALL ? '' : v })}>
            <SelectTrigger aria-label={t('transactionPage.filters.status')} className={cn('h-10 w-full bg-white', value.status && 'border-brand-purple/40')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('transactionPage.filters.allStatuses')}</SelectItem>
              {PAYMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`paymentStatus.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DateRangeFilter
            value={value.range}
            onChange={(range) => onChange({ range })}
            placeholder={t('transactionPage.filters.anyDate')}
            className='md:col-span-2 lg:col-span-1'
          />
          <button
            type='button'
            onClick={() => onAdvancedOpenChange(!advancedOpen)}
            aria-expanded={advancedOpen}
            aria-controls='transaction-more-filters'
            className={cn(
              'inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 md:col-span-2 lg:col-span-1',
              advancedOpen || extra
                ? 'border-brand-purple/40 bg-brand-purple/10 text-brand-purple'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-brand-purple'
            )}
          >
            <SlidersHorizontal className='size-3.5' aria-hidden />
            {t('transactionPage.filters.more')}
            {extra > 0 && (
              <span className='grid min-w-5 place-items-center rounded-full bg-brand-purple px-1 text-[10px] text-white'>{extra}</span>
            )}
          </button>
        </div>

        {advancedOpen && (
          <div
            id='transaction-more-filters'
            className='grid gap-3 border-t border-slate-100 pt-3 animate-in fade-in slide-in-from-top-1 duration-300 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_minmax(0,1.4fr)]'
          >
            {can(PERM.gameView) && <GameField value={value.gameId} onChange={(gameId) => onChange({ gameId })} />}
            {can(PERM.paymentMethodView) && (
              <PaymentMethodField value={value.paymentMethodId} onChange={(paymentMethodId) => onChange({ paymentMethodId })} />
            )}
            <div className='grid grid-cols-3 gap-2 sm:col-span-2 lg:col-span-1'>
              <AmountInput
                value={value.priceAbove}
                onChange={(priceAbove) => onChange({ priceAbove })}
                label={t('transactionPage.filters.amountMin')}
                placeholder={t('transactionPage.filters.amountMinShort')}
              />
              <AmountInput
                value={value.priceBelow}
                onChange={(priceBelow) => onChange({ priceBelow })}
                label={t('transactionPage.filters.amountMax')}
                placeholder={t('transactionPage.filters.amountMaxShort')}
              />
              <AmountInput
                value={value.price}
                onChange={(price) => onChange({ price })}
                label={t('transactionPage.filters.amountExact')}
                placeholder={t('transactionPage.filters.amountExactShort')}
              />
            </div>
          </div>
        )}

        {hasAnyFilter(value) && (
          <div className='flex justify-end'>
            <button
              type='button'
              onClick={onReset}
              className='inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600'
            >
              <RotateCcw className='size-3.5' aria-hidden />
              {t('transactionPage.filters.reset')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  /** Read out to screen readers and shown as a tooltip. */
  label: string
  placeholder: string
}

function AmountInput({ value, onChange, label, placeholder }: AmountInputProps) {
  return (
    <label className='relative block min-w-0'>
      <span className='sr-only'>{label}</span>
      <span className='pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-[11px] font-semibold text-slate-400'>Rp</span>
      <Input
        type='number'
        inputMode='numeric'
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        title={label}
        className='h-10 rounded-md border-slate-200 bg-white pl-8 text-sm tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
      />
    </label>
  )
}
