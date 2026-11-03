import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, Gamepad2, Search } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { GameNames } from '@/hooks/useGame'
import { cn } from '@/lib/utils'

interface GamePickerProps {
  id?: string
  games: GameNames[]
  /** The selected game's name or id, depending on `by`. */
  value: string
  by: 'name' | 'id'
  onChange: (game: GameNames | null) => void
  placeholder: string
  /** Offers an "all games" row that clears the choice. */
  allLabel?: string
  invalid?: boolean
  disabled?: boolean
  className?: string
}

/** Searchable game list in a popover; the filter bar picks by name, dialogs by id. */
export function GamePicker({ id, games, value, by, onChange, placeholder, allLabel, invalid, disabled, className }: GamePickerProps) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const selected = value ? games.find((g) => g[by] === value) : undefined
  const query = search.trim().toLowerCase()
  const matches = query ? games.filter((g) => g.name.toLowerCase().includes(query)) : games

  const pick = (game: GameNames | null) => {
    onChange(game)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSearch('')
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type='button'
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(
            'flex h-10 w-full items-center gap-2.5 rounded-md border bg-white px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:cursor-not-allowed disabled:opacity-60',
            invalid ? 'border-rose-300' : selected ? 'border-brand-purple/40' : 'border-slate-200 hover:border-slate-300',
            className
          )}
        >
          <Gamepad2 className={cn('size-4 shrink-0', selected ? 'text-brand-purple' : 'text-slate-400')} aria-hidden />
          <span className={cn('min-w-0 flex-1 truncate', selected ? 'font-medium text-slate-900' : 'text-slate-400')}>
            {selected?.name ?? (value && by === 'name' ? value : placeholder)}
          </span>
          <ChevronDown className={cn('size-4 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-(--radix-popover-trigger-width) min-w-64 overflow-hidden rounded-md p-0'>
        <div className='flex items-center gap-2 border-b border-slate-100 px-3'>
          <Search className='size-3.5 shrink-0 text-slate-400' aria-hidden />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('productsPage.filters.gameSearch')}
            aria-label={t('productsPage.filters.gameSearch')}
            className='h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400'
          />
        </div>
        <ul role='listbox' aria-label={placeholder} className='max-h-64 overflow-y-auto p-1'>
          {allLabel && !query && (
            <li role='option' aria-selected={!value}>
              <button
                type='button'
                onClick={() => pick(null)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded px-3 py-2 text-left text-sm transition-colors',
                  !value ? 'bg-brand-purple/10 font-medium text-brand-purple' : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                {allLabel}
                {!value && <Check className='size-4 shrink-0' aria-hidden />}
              </button>
            </li>
          )}
          {matches.length === 0 ? (
            <li className='px-3 py-6 text-center text-xs text-slate-500'>{t('productsPage.filters.noGames')}</li>
          ) : (
            matches.map((game) => {
              const isSelected = game[by] === value
              return (
                <li key={game.id} role='option' aria-selected={isSelected}>
                  <button
                    type='button'
                    onClick={() => pick(game)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded px-3 py-2 text-left text-sm transition-colors',
                      isSelected ? 'bg-brand-purple/10 font-medium text-brand-purple' : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <span className='truncate'>{game.name}</span>
                    {isSelected && <Check className='size-4 shrink-0' aria-hidden />}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
