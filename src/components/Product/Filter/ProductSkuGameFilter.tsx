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
  const [open, setOpen] = useState(false)
  const { data: games } = useGetGameNames()
  const selectedGameLabel = games?.find((g: GameNames) => g.name === gameName)?.name

  return (
    <>
      <Input
        placeholder="Cari SKU…"
        className="h-10 min-w-[10rem] max-w-xs"
        value={sku}
        onChange={(e) => onSkuChange(e.target.value)}
        aria-label="Cari SKU"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-10 min-w-[12rem] max-w-[16rem] justify-between font-normal"
          >
            <span className="truncate">{selectedGameLabel || 'Pilih game…'}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(100vw-2rem,20rem)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Cari game…" />
            <CommandList>
              <CommandEmpty>Tidak ada game.</CommandEmpty>
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
                  Semua game
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
    </>
  )
}
