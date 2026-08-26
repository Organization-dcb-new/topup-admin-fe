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
import { useGetGameNames, type GameNames } from '@/hooks/useGame'
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

  const selected = games?.find((g: GameNames) => g.id === value)
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
                'h-10 w-full min-w-0 justify-between font-normal shadow-xs',
                isError && 'border-destructive/50 text-destructive',
                !selected && !isError && !isLoading && 'text-muted-foreground',
              )}
            >
            <span className='flex min-w-0 items-center gap-2'>
              {isLoading ? (
                <Loader2 className='h-4 w-4 shrink-0 animate-spin text-muted-foreground' aria-hidden />
              ) : (
                <Gamepad2 className='h-4 w-4 shrink-0 text-muted-foreground' aria-hidden />
              )}
              <span className='truncate'>
                {isLoading ? t('transactionFilters.game.loading') : label}
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
            <CommandInput placeholder={t('transactionFilters.game.commandSearch')} />
            <CommandList>
              <CommandEmpty>{t('transactionFilters.game.commandEmpty')}</CommandEmpty>
              <CommandGroup heading={t('transactionFilters.game.groupHeading')}>
                <CommandItem
                  value='semua-game'
                  keywords={['semua', 'all', '']}
                  onSelect={() => {
                    onChange('')
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4 shrink-0', value === '' ? 'opacity-100' : 'opacity-0')}
                    aria-hidden
                  />
                  {t('transactionFilters.game.allGames')}
                </CommandItem>
                {!isError &&
                  games?.map((game: GameNames) => (
                    <CommandItem
                      key={game.id}
                      value={`${game.name} ${game.id}`}
                      keywords={[game.name, game.id]}
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
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground'
          onClick={() => onChange('')}
          aria-label={t('transactionFilters.game.clearAria')}
        >
          <FilterX className='h-4 w-4' aria-hidden />
        </Button>
      )}
    </div>
  )
}
