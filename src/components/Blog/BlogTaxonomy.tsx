import { useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, Gamepad2, Plus, Search, X } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { GameNames } from '@/hooks/useGame'
import { cn } from '@/lib/utils'

interface CategoryPickerProps {
  id: string
  value: string
  games: GameNames[]
  onChange: (name: string) => void
  invalid?: boolean
}

/** Articles are filed under a game, stored by its name. */
export function CategoryPicker({ id, value, games, onChange, invalid }: CategoryPickerProps) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
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
            'flex h-11 w-full items-center gap-2.5 rounded-md border bg-slate-50 px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40',
            invalid ? 'border-rose-300' : 'border-slate-200 hover:border-slate-300',
            open && 'border-brand-purple/50 bg-white'
          )}
        >
          <Gamepad2 className={cn('size-4 shrink-0', value ? 'text-brand-purple' : 'text-slate-400')} aria-hidden />
          <span className={cn('min-w-0 flex-1 truncate', value ? 'font-medium text-slate-900' : 'text-slate-400')}>
            {value || t('blogPage.editor.categoryPlaceholder')}
          </span>
          <ChevronDown className={cn('size-4 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-(--radix-popover-trigger-width) overflow-hidden rounded-md p-0'>
        <div className='flex items-center gap-2 border-b border-slate-100 px-3'>
          <Search className='size-3.5 shrink-0 text-slate-400' aria-hidden />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('blogPage.editor.categorySearch')}
            aria-label={t('blogPage.editor.categorySearch')}
            className='h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400'
          />
        </div>
        <ul role='listbox' aria-label={t('blogPage.editor.categoryLabel')} className='max-h-60 overflow-y-auto p-1'>
          {matches.length === 0 ? (
            <li className='px-3 py-6 text-center text-xs text-slate-500'>{t('blogPage.editor.noGames')}</li>
          ) : (
            matches.map((game) => {
              const selected = game.name === value
              return (
                <li key={game.id} role='option' aria-selected={selected}>
                  <button
                    type='button'
                    onClick={() => {
                      onChange(game.name)
                      setOpen(false)
                      setSearch('')
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded px-3 py-2 text-left text-sm transition-colors',
                      selected ? 'bg-brand-purple/10 font-medium text-brand-purple' : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <span className='truncate'>{game.name}</span>
                    {selected && <Check className='size-4 shrink-0' aria-hidden />}
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

interface TagsInputProps {
  id: string
  value: string[]
  suggestions: string[]
  onChange: (tags: string[]) => void
}

/** Free-form tags; Enter or comma adds one, game names are offered as quick picks. */
export function TagsInput({ id, value, suggestions, onChange }: TagsInputProps) {
  const { t } = useTranslation('common')
  const [draft, setDraft] = useState('')

  const add = (raw: string) => {
    const tag = raw.trim().toLowerCase()
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setDraft('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  const query = draft.trim().toLowerCase()
  const quickPicks = suggestions
    .filter((s) => !value.includes(s.toLowerCase()) && (!query || s.toLowerCase().includes(query)))
    .slice(0, 8)

  return (
    <div className='space-y-2.5'>
      <div className='flex min-h-11 flex-wrap items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 p-1.5 transition-colors focus-within:border-brand-purple/50 focus-within:bg-white'>
        {value.map((tag) => (
          <span
            key={tag}
            className='inline-flex items-center gap-1 bg-white py-0.5 pl-2 pr-0.5 font-mono text-xs text-slate-700 ring-1 ring-inset ring-slate-200 hud-clip-sm'
          >
            #{tag}
            <button
              type='button'
              onClick={() => onChange(value.filter((x) => x !== tag))}
              aria-label={t('blogPage.editor.removeTag', { tag })}
              className='grid size-5 place-items-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600'
            >
              <X className='size-3' aria-hidden />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft.trim() && add(draft)}
          placeholder={value.length ? '' : t('blogPage.editor.tagsPlaceholder')}
          className='h-7 min-w-[7rem] flex-1 bg-transparent px-1.5 text-sm outline-none placeholder:text-slate-400'
        />
      </div>
      {quickPicks.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {quickPicks.map((name) => (
            <button
              key={name}
              type='button'
              onClick={() => add(name)}
              className='inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-brand-purple/5 hover:text-brand-purple hover:ring-brand-purple/30'
            >
              <Plus className='size-3' aria-hidden />
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
