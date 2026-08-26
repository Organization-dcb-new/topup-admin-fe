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
                'h-10 w-full min-w-0 justify-between font-normal shadow-xs',
                isError && 'border-destructive/50 text-destructive',
                !selected && !isError && !isLoading && 'text-muted-foreground',
              )}
            >
            <span className='flex min-w-0 items-center gap-2'>
              {isLoading ? (
                <Loader2 className='h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none text-muted-foreground' aria-hidden />
              ) : (
                <CreditCard className='h-4 w-4 shrink-0 text-muted-foreground' aria-hidden />
              )}
              <span className='truncate'>
                {isLoading ? t('transactionFilters.paymentMethod.loading') : label}
              </span>
            </span>
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-[min(100vw-2rem,var(--radix-popover-trigger-width))] p-0 sm:w-80'
          align='start'
        >
          <Command>
            <CommandInput placeholder={t('transactionFilters.paymentMethod.commandSearch')} />
            <CommandList>
              <CommandEmpty>{t('transactionFilters.paymentMethod.commandEmpty')}</CommandEmpty>
              <CommandGroup heading={t('transactionFilters.paymentMethod.groupHeading')}>
                <CommandItem
                  value='semua-metode'
                  keywords={['semua', 'all']}
                  onSelect={() => {
                    onChange('')
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4 shrink-0', value === '' ? 'opacity-100' : 'opacity-0')}
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
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground'
          onClick={() => onChange('')}
          aria-label={t('transactionFilters.paymentMethod.clearAria')}
        >
          <FilterX className='h-4 w-4' aria-hidden />
        </Button>
      )}
    </div>
  )
}
