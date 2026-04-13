import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { GameNames } from '@/hooks/useGame'
import { useGetGameNames } from '@/hooks/useGame'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type ProductSkuGameFilterProps = {
  sku: string
  onSkuChange: (value: string) => void
  gameName: string
  onGameNameChange: (value: string) => void
}

export function ProductSkuGameFilter({
  sku,
  onSkuChange,
  gameName,
  onGameNameChange,
}: ProductSkuGameFilterProps) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const { data: games } = useGetGameNames()
  const selectedGameLabel = games?.find((g: GameNames) => g.name === gameName)?.name

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:items-end">
      <div className="grid min-w-0 gap-1.5">
        <span className="text-xs text-muted-foreground">{t('productFilters.skuLabel')}</span>
        <Input
          placeholder={t('productFilters.skuPlaceholder')}
          className="h-10 w-full min-w-0 shadow-sm"
          value={sku}
          onChange={(e) => onSkuChange(e.target.value)}
          aria-label={t('productFilters.skuAria')}
        />
      </div>
      <div className="grid min-w-0 gap-1.5">
        <span className="text-xs text-muted-foreground">{t('productFilters.gameLabel')}</span>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="h-10 w-full min-w-0 justify-between font-normal shadow-sm"
            >
              <span className="truncate">{selectedGameLabel || t('productFilters.gamePlaceholder')}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] min-w-[min(100%,18rem)] p-0"
            align="start"
          >
          <Command>
            <CommandInput placeholder={t('productFilters.gameSearchPlaceholder')} />
            <CommandList>
              <CommandEmpty>{t('productFilters.gameEmpty')}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value=""
                  onSelect={() => {
                    onGameNameChange('')
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', gameName === '' ? 'opacity-100' : 'opacity-0')}
                    aria-hidden
                  />
                  {t('productFilters.allGames')}
                </CommandItem>
                {games?.map((game: GameNames) => (
                  <CommandItem
                    key={game.id}
                    value={game.name}
                    onSelect={() => {
                      onGameNameChange(game.name)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        gameName === game.name ? 'opacity-100' : 'opacity-0',
                      )}
                      aria-hidden
                    />
                    {game.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
