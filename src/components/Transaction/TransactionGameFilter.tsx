import type { GameName } from '@/components/Blog/types/blog'
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
import { useGetGameNames } from '@/hooks/useGame'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, FilterX, Gamepad2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface TransactionGameFilterProps {
  /** ID game terpilih; string kosong = semua game */
  value: string
  onChange: (gameId: string) => void
}

export default function TransactionGameFilter({ value, onChange }: TransactionGameFilterProps) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const { data: games, isLoading, isError } = useGetGameNames()

  const selected = games?.find((g: GameName) => g.id === value)
  const label = isError
    ? t('transactionFilters.game.listError')
    : selected
      ? selected.name
      : t('transactionFilters.game.allGames')

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
              aria-label={t('transactionFilters.game.filterAria')}
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
                <Gamepad2 className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
              )}
              <span className='truncate'>
                {isLoading ? t('transactionFilters.game.loading') : label}
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
              placeholder={t('transactionFilters.game.commandSearch')}
              className='font-bold placeholder:font-medium placeholder:text-[#5f5f5f]'
            />
            <CommandList>
              <CommandEmpty className='py-5 text-center text-xs font-bold uppercase tracking-tight text-[#111]/55'>
                {t('transactionFilters.game.commandEmpty')}
              </CommandEmpty>
              <CommandGroup
                heading={t('transactionFilters.game.groupHeading')}
                className='[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-black [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-[#111]/60'
              >
                <CommandItem
                  value='semua-game'
                  keywords={['semua', 'all', '']}
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
                  {t('transactionFilters.game.allGames')}
                </CommandItem>
                {!isError &&
                  games?.map((game: GameName) => (
                    <CommandItem
                      key={game.id}
                      value={`${game.name} ${game.id}`}
                      keywords={[game.name, game.id]}
                      className={txCommandItem}
                      onSelect={() => {
                        onChange(game.id)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4 shrink-0',
                          value === game.id ? 'opacity-100' : 'opacity-0',
                        )}
                        strokeWidth={3}
                        aria-hidden
                      />
                      <span className='truncate'>{game.name}</span>
                    </CommandItem>
                  ))}
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
          aria-label={t('transactionFilters.game.clearAria')}
        >
          <FilterX className='h-4 w-4' strokeWidth={3} aria-hidden />
        </button>
      )}
    </div>
  )
}
