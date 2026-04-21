import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useGetGameNamesWithType } from '@/hooks/useGame'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  value: string
  onChange: (gameId: string) => void
}

export function GamePickerSelect({ value, onChange }: Props) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const { data: games, isLoading, isError } = useGetGameNamesWithType()

  const selectedName = value ? games?.find((g) => g.id === value)?.name : undefined

  return (
    <div className='grid min-w-0 w-full gap-1.5'>
      <Label htmlFor='game-picker-trigger' className='text-xs text-muted-foreground'>
        {t('gameFilters.gameLabel')}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id='game-picker-trigger'
            type='button'
            variant='outline'
            role='combobox'
            aria-expanded={open}
            disabled={isLoading || isError}
            className='h-9 w-full min-w-0 justify-between px-3 font-normal shadow-sm'
          >
            <span className='truncate text-left'>
              {isLoading ? t('gameFilters.loadingGames') : (selectedName ?? t('gameFilters.allGames'))}
            </span>
            {isLoading ? (
              <Loader2 className='h-3.5 w-3.5 shrink-0 animate-spin opacity-50' aria-hidden />
            ) : (
              <ChevronsUpDown className='h-3.5 w-3.5 shrink-0 opacity-50' aria-hidden />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-[var(--radix-popover-trigger-width)] min-w-[min(100%,18rem)] p-0'
          align='start'
        >
          <Command>
            <CommandInput placeholder={t('gameFilters.searchPlaceholder')} />
            <CommandList>
              <CommandEmpty>{t('gameFilters.emptySearch')}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value='semua game all'
                  keywords={['semua', 'all', 'game']}
                  onSelect={() => {
                    onChange('')
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4 shrink-0', !value ? 'opacity-100' : 'opacity-0')}
                    aria-hidden
                  />
                  {t('gameFilters.allGames')}
                </CommandItem>
                {games?.map((g) => (
                  <CommandItem
                    key={g.id}
                    value={g.name}
                    keywords={[g.id, g.name]}
                    onSelect={() => {
                      onChange(g.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 shrink-0',
                        value === g.id ? 'opacity-100' : 'opacity-0',
                      )}
                      aria-hidden
                    />
                    {g.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {isError && (
        <p className='text-xs text-destructive'>{t('gameFilters.loadNamesError')}</p>
      )}
    </div>
  )
}
