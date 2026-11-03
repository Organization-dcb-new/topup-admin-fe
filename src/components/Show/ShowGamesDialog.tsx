import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Gamepad2, Loader2, Search } from 'lucide-react'

import { hudEyebrowClass, hudInputClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useGetGameNames, type GameNames } from '@/hooks/useGame'
import { useSetShowGames } from '@/hooks/useShow'
import { cn } from '@/lib/utils'
import type { Show } from '@/types/show'

interface ShowGamesDialogProps {
  show: Show | null
  /** Every show, to say which one a game would be moved out of. */
  shows: Show[]
  onOpenChange: (open: boolean) => void
}

export function ShowGamesDialog({ show, shows, onOpenChange }: ShowGamesDialogProps) {
  const setGames = useSetShowGames(() => onOpenChange(false))

  return (
    <Dialog open={!!show} onOpenChange={(next) => !setGames.isPending && onOpenChange(next)}>
      <DialogContent
        showCloseButton={false}
        className='flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg'
      >
        <div className='h-1 shrink-0 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {show && (
          <ShowGamesPicker
            key={show.id}
            show={show}
            shows={shows}
            pending={setGames.isPending}
            onCancel={() => onOpenChange(false)}
            onSave={(gameIds) => setGames.mutate({ showId: show.id, gameIds })}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface ShowGamesPickerProps {
  show: Show
  shows: Show[]
  pending: boolean
  onCancel: () => void
  onSave: (gameIds: string[]) => void
}

function ShowGamesPicker({ show, shows, pending, onCancel, onSave }: ShowGamesPickerProps) {
  const { t } = useTranslation('common')
  const { data, isLoading } = useGetGameNames()
  const games: GameNames[] = data ?? []
  const [selected, setSelected] = useState(() => new Set(show.games?.map((g) => g.id) ?? []))
  const [search, setSearch] = useState('')

  // A game belongs to at most one show; picking it here moves it out of the other one.
  const ownerByGame = useMemo(() => {
    const owners = new Map<string, string>()
    for (const s of shows) if (s.id !== show.id) for (const g of s.games ?? []) owners.set(g.id, s.name)
    return owners
  }, [shows, show.id])

  const query = search.trim().toLowerCase()
  const visible = query ? games.filter((g) => g.name.toLowerCase().includes(query)) : games
  const original = new Set(show.games?.map((g) => g.id) ?? [])
  // The current line-up first. Sorted by the saved list, not the live ticks, so rows never jump under the cursor.
  const ordered = [...visible].sort((a, b) => Number(original.has(b.id)) - Number(original.has(a.id)))
  const moving = [...selected].filter((id) => ownerByGame.has(id)).length
  const unchanged = selected.size === original.size && [...selected].every((id) => original.has(id))

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <>
      <div className='shrink-0 space-y-4 p-6 pb-4 sm:p-7 sm:pb-4'>
        <div className='space-y-1'>
          <p className={hudEyebrowClass}>{t('showPage.games.eyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {t('showPage.games.title', { name: show.name })}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>
            {t('showPage.games.description')}
          </DialogDescription>
        </div>
        <div className='group relative'>
          <span className='pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400 group-focus-within:text-brand-purple'>
            <Search className='size-4' aria-hidden />
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('showPage.games.searchPlaceholder')}
            aria-label={t('showPage.games.searchPlaceholder')}
            autoComplete='off'
            className={cn(hudInputClass, 'pl-11')}
          />
        </div>
        <div className='flex items-center justify-between text-xs text-slate-500'>
          <span>{t('showPage.games.selected', { count: selected.size })}</span>
          {selected.size > 0 && (
            <button type='button' onClick={() => setSelected(new Set())} className='font-medium text-slate-500 hover:text-rose-600'>
              {t('showPage.games.clear')}
            </button>
          )}
        </div>
      </div>

      <ul className='min-h-40 flex-1 overflow-y-auto border-y border-slate-100 px-3 py-2 sm:px-4' aria-label={t('showPage.games.listLabel')}>
        {isLoading ? (
          <li className='flex items-center justify-center gap-2 py-10 text-sm text-slate-500'>
            <Loader2 className='size-4 animate-spin' aria-hidden />
            {t('showPage.games.loading')}
          </li>
        ) : ordered.length === 0 ? (
          <li className='py-10 text-center text-sm text-slate-500'>
            {games.length ? t('showPage.games.noMatch') : t('showPage.games.noGames')}
          </li>
        ) : (
          ordered.map((game) => {
            const checked = selected.has(game.id)
            const owner = ownerByGame.get(game.id)
            return (
              <li key={game.id}>
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-purple/40',
                    checked ? 'bg-brand-purple/[0.06]' : 'hover:bg-slate-50'
                  )}
                >
                  <input type='checkbox' checked={checked} onChange={() => toggle(game.id)} className='sr-only' />
                  <span
                    className={cn(
                      'grid size-5 shrink-0 place-items-center rounded border transition-colors',
                      checked ? 'border-brand-purple bg-brand-purple text-white' : 'border-slate-300 bg-white'
                    )}
                    aria-hidden
                  >
                    {checked && <Check className='size-3.5' strokeWidth={3} />}
                  </span>
                  <Gamepad2 className={cn('size-4 shrink-0', checked ? 'text-brand-purple' : 'text-slate-300')} aria-hidden />
                  <span className='min-w-0 flex-1 truncate text-sm text-slate-800'>{game.name}</span>
                  {owner && (
                    <span
                      className={cn(
                        'max-w-[45%] shrink-0 truncate text-[11px]',
                        checked ? 'font-medium text-amber-700' : 'text-slate-400'
                      )}
                      title={owner}
                    >
                      {checked ? t('showPage.games.willMove', { name: owner }) : t('showPage.games.inShow', { name: owner })}
                    </span>
                  )}
                </label>
              </li>
            )
          })
        )}
      </ul>

      <div className='shrink-0 space-y-3 p-6 pt-4 sm:p-7 sm:pt-4'>
        {moving > 0 && (
          <p className='rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800'>
            {t('showPage.games.movingNote', { count: moving })}
          </p>
        )}
        <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <button
            type='button'
            onClick={onCancel}
            disabled={pending}
            className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
          >
            {t('showPage.games.cancel')}
          </button>
          <button
            type='button'
            onClick={() => onSave([...selected])}
            disabled={unchanged || pending}
            className={cn(hudPrimaryButtonClass, 'justify-center disabled:pointer-events-none sm:min-w-52')}
          >
            <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
            {pending && <Loader2 className='size-4 animate-spin' aria-hidden />}
            {pending ? t('showPage.games.saving') : t('showPage.games.save')}
          </button>
        </div>
      </div>
    </>
  )
}
