import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, Gamepad2, Loader2, Search } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { GameNames } from '@/hooks/useGame'
import { cn } from '@/lib/utils'

interface GamePickerProps {
  id: string
  /** Selected game id. */
  value: string
  games: GameNames[]
  loading?: boolean
  invalid?: boolean
  onChange: (game: GameNames) => void
}

/** Searchable game select; categories belong to exactly one game. */
export function GamePicker({ id, value, games, loading, invalid, onChange }: GamePickerProps) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const selected = games.find((g) => g.id === value)
  const query = search.trim().toLowerCase()
  const matches = query ? games.filter((g) => g.name.toLowerCase().includes(query)) : games

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
          aria-invalid={invalid}
          className={cn(
            'flex h-12 w-full items-center gap-2.5 rounded-md border bg-slate-50 px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40',
            invalid ? 'border-rose-300' : 'border-slate-200 hover:border-slate-300',
            open && 'border-brand-purple/50 bg-white'
          )}
        >
          <Gamepad2 className={cn('size-4 shrink-0', selected ? 'text-brand-purple' : 'text-slate-400')} aria-hidden />
          <span className={cn('min-w-0 flex-1 truncate', selected ? 'font-medium text-slate-900' : 'text-slate-400')}>
            {selected?.name ?? t('categoryProductPage.form.gamePlaceholder')}
          </span>
          {loading ? (
            <Loader2 className='size-4 shrink-0 animate-spin text-slate-400' aria-hidden />
          ) : (
            <ChevronDown className={cn('size-4 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} aria-hidden />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-(--radix-popover-trigger-width) overflow-hidden rounded-md p-0'>
        <div className='flex items-center gap-2 border-b border-slate-100 px-3'>
          <Search className='size-3.5 shrink-0 text-slate-400' aria-hidden />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('categoryProductPage.form.gameSearch')}
            aria-label={t('categoryProductPage.form.gameSearch')}
            className='h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400'
          />
        </div>
        <ul role='listbox' aria-label={t('categoryProductPage.form.gameLabel')} className='max-h-60 overflow-y-auto p-1'>
          {matches.length === 0 ? (
            <li className='px-3 py-6 text-center text-xs text-slate-500'>
              {loading ? t('categoryProductPage.form.gamesLoading') : t('categoryProductPage.form.noGames')}
            </li>
          ) : (
            matches.map((game) => {
              const isSelected = game.id === value
              return (
                <li key={game.id} role='option' aria-selected={isSelected}>
                  <button
                    type='button'
                    onClick={() => {
                      onChange(game)
                      setOpen(false)
                      setSearch('')
                    }}
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
