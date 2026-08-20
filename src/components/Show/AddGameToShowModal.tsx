import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ListPlus, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useAddGamesToShow } from '@/hooks/useShow'
import { useGetGameNames } from '@/hooks/useGame'
import type { ShowGame } from '@/types/show'
import type { GameName } from '../Blog/types/blog'
import { useTranslation } from 'react-i18next'

export function AddGamesToShowButton({
  showId,
  existingGames,
  triggerClassName,
}: {
  showId: string
  existingGames?: ShowGame[]
  triggerClassName?: string
}) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const { data: games, isLoading: gamesLoading } = useGetGameNames()
  const mutation = useAddGamesToShow(showId, () => setOpen(false))

  const query = search.trim().toLowerCase()
  const filteredGames = useMemo(() => {
    if (!games?.length) return []
    if (!query) return games
    return games.filter((g: GameName) => g.name.toLowerCase().includes(query))
  }, [games, query])

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setSearch('')
          setSelected(existingGames?.map((g) => g.id) ?? [])
        }
        setOpen(next)
      }}
    >
      <AlertDialogTrigger asChild>
        <button
          type='button'
          className={cn(
            'nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-8 cursor-pointer items-center gap-1.5 px-2 text-[10px] font-black uppercase tracking-[0.12em]',
            triggerClassName,
          )}
          aria-label={t('addGamesModal.triggerAria')}
        >
          <Plus className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
          <span className='hidden sm:inline'>{t('addGamesModal.triggerShort')}</span>
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className='nb nb-frame nb-frame-thick nb-sd-lg gap-0 overflow-hidden bg-white p-0 sm:max-w-lg'>
        <div className='border-b-4 border-[#111] bg-[#6fe3f5] px-5 py-4'>
          <AlertDialogHeader className='gap-2 text-left'>
            <div className='flex items-center gap-2.5'>
              <span className='nb-frame nb-frame-thin flex h-9 w-9 shrink-0 items-center justify-center bg-white'>
                <ListPlus className='h-4 w-4' strokeWidth={3} aria-hidden />
              </span>
              <AlertDialogTitle className='text-xl font-black uppercase leading-none tracking-tight'>
                {t('addGamesModal.title')}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className='text-left text-xs font-bold text-[#111]/80'>
              {t('addGamesModal.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <div className='space-y-3 px-5 py-4'>
          <div className='nb-field nb-frame nb-frame-thin nb-sd-sm flex bg-white'>
            <span className='flex w-11 shrink-0 items-center justify-center border-r-[2px] border-[#111] bg-[#ffd84d]'>
              <Search className='h-4 w-4' strokeWidth={3} aria-hidden />
            </span>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('addGamesModal.searchPlaceholder')}
              className='h-10 rounded-none border-0 bg-transparent text-sm font-bold shadow-none focus-visible:ring-0 placeholder:font-medium placeholder:text-[#5f5f5f]'
              aria-label={t('addGamesModal.searchAria')}
              autoComplete='off'
            />
          </div>

          <p className='text-xs font-bold text-[#111]/80'>
            {t('addGamesModal.selectedCount', { count: selected.length })}
            {query
              ? t('addGamesModal.filterSummary', {
                  filtered: filteredGames.length,
                  total: games?.length ?? 0,
                })
              : null}
          </p>

          <div className='nb-frame nb-frame-thin max-h-64 space-y-0.5 overflow-y-auto bg-[#f5f1e8] p-2'>
            {gamesLoading ? (
              <p className='py-8 text-center text-xs font-black uppercase tracking-[0.12em]'>
                {t('addGamesModal.loadingGames')}
              </p>
            ) : !games?.length ? (
              <p className='py-8 text-center text-xs font-black uppercase tracking-[0.12em]'>
                {t('addGamesModal.noGames')}
              </p>
            ) : filteredGames.length === 0 ? (
              <p className='py-8 text-center text-xs font-black uppercase tracking-[0.12em]'>
                {t('addGamesModal.noMatch')}
              </p>
            ) : (
              filteredGames.map((game: GameName) => (
                <label
                  key={game.id}
                  className='flex cursor-pointer items-center gap-3 px-2 py-2 hover:bg-white'
                >
                  <Checkbox
                    checked={selected.includes(game.id)}
                    onCheckedChange={() => toggle(game.id)}
                    aria-label={t('addGamesModal.selectGameAria', { name: game.name })}
                    className='rounded-none border-2 border-[#111] data-[state=checked]:bg-[#c9f24d] data-[state=checked]:text-[#111]'
                  />
                  <span className='select-none text-sm font-bold leading-snug'>{game.name}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <AlertDialogFooter className='gap-2 border-t-4 border-[#111] px-5 py-5'>
          <AlertDialogCancel
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-11 cursor-pointer bg-white px-5 text-xs font-black uppercase tracking-[0.14em] sm:min-w-[5.5rem]'
            disabled={mutation.isPending}
          >
            {t('addGamesModal.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              mutation.mutate(selected)
            }}
            /**
             * Daftar kosong sengaja diizinkan: endpoint-nya PUT (mengganti
             * seluruh daftar), jadi mengosongkan pilihan adalah cara melepas
             * semua game. Versi sebelumnya mengunci tombol saat kosong sehingga
             * tindakan itu mustahil dilakukan.
             */
            disabled={mutation.isPending}
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-11 cursor-pointer bg-[#c9f24d] px-5 text-xs font-black uppercase tracking-[0.14em] text-[#111] disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[5.5rem]'
          >
            {mutation.isPending ? t('addGamesModal.saving') : t('addGamesModal.save')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
