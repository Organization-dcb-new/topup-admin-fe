import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { txClear, txCommandItem, txControl, txPopover } from '@/components/Transaction/styles'
import { useGetPaymentMethods } from '@/hooks/usePaymentMethod'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/types/payment-method'
import { Check, ChevronsUpDown, CreditCard, FilterX, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface TransactionPaymentMethodFilterProps {
  value: string
  onChange: (paymentMethodId: string) => void
}

const LIST_LIMIT = 400

export default function TransactionPaymentMethodFilter({
  value,
  onChange,
}: TransactionPaymentMethodFilterProps) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const { data, isLoading, isError } = useGetPaymentMethods(1, LIST_LIMIT)
  const methods = data?.data ?? []

  const selected = methods.find((m: PaymentMethod) => m.id === value)
  const label = isError
    ? t('transactionFilters.paymentMethod.listError')
    : selected
      ? selected.full_name || selected.name
      : t('transactionFilters.paymentMethod.allMethods')

  return (
    <div className='flex w-full min-w-0 items-center gap-2'>
      <div className='min-w-0 flex-1'>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='outline'
              role='combobox'
              aria-expanded={open}
              aria-label={t('transactionFilters.paymentMethod.filterAria')}
              disabled={isLoading}
              className={cn(
                txControl,
                'justify-between',
                isError && 'bg-[#ff4d3d]',
                !selected && !isError && !isLoading && 'text-[#111]/55',
              )}
            >
            <span className='flex min-w-0 items-center gap-2'>
              {isLoading ? (
                <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
              ) : (
                <CreditCard className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
              )}
              <span className='truncate'>
                {isLoading ? t('transactionFilters.paymentMethod.loading') : label}
              </span>
            </span>
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(txPopover, 'w-[min(100vw-2rem,var(--radix-popover-trigger-width))] sm:w-80')}
          align='start'
        >
          <Command className='rounded-none bg-white [&_[data-slot=command-input-wrapper]]:border-b-[3px] [&_[data-slot=command-input-wrapper]]:border-[#111]'>
            <CommandInput
              placeholder={t('transactionFilters.paymentMethod.commandSearch')}
              className='font-bold placeholder:font-medium placeholder:text-[#5f5f5f]'
            />
            <CommandList>
              <CommandEmpty className='py-5 text-center text-xs font-bold uppercase tracking-tight text-[#111]/55'>
                {t('transactionFilters.paymentMethod.commandEmpty')}
              </CommandEmpty>
              <CommandGroup
                heading={t('transactionFilters.paymentMethod.groupHeading')}
                className='[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-black [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-[#111]/60'
              >
                <CommandItem
                  value='semua-metode'
                  keywords={['semua', 'all']}
                  className={txCommandItem}
                  onSelect={() => {
                    onChange('')
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4 shrink-0', value === '' ? 'opacity-100' : 'opacity-0')}
                    strokeWidth={3}
                    aria-hidden
                  />
                  {t('transactionFilters.paymentMethod.allMethods')}
                </CommandItem>
                {!isError &&
                  methods.map((pm: PaymentMethod) => {
                    const title = pm.full_name || pm.name
                    return (
                      <CommandItem
                        key={pm.id}
                        value={`${title} ${pm.code} ${pm.id}`}
                        keywords={[title, pm.code, pm.id, pm.provider]}
                        className={txCommandItem}
                        onSelect={() => {
                          onChange(pm.id)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4 shrink-0',
                            value === pm.id ? 'opacity-100' : 'opacity-0',
                          )}
                          strokeWidth={3}
                          aria-hidden
                        />
                        <span className='truncate'>{title}</span>
                      </CommandItem>
                    )
                  })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
        </Popover>
      </div>
      {value !== '' && !isLoading && (
        <button
          type='button'
          className={txClear}
          onClick={() => onChange('')}
          aria-label={t('transactionFilters.paymentMethod.clearAria')}
        >
          <FilterX className='h-4 w-4' strokeWidth={3} aria-hidden />
        </button>
      )}
    </div>
  )
}
