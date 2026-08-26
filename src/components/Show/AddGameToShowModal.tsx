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
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, ListPlus, Loader2, Plus, RefreshCw, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useSetShowGames } from '@/hooks/useShow'
import { useGetGameNames } from '@/hooks/useGame'
import type { ShowGame } from '@/types/show'
import { useTranslation } from 'react-i18next'

/**
 * Kurasi keanggotaan game sebuah show.
 *
 * Penting: PUT /shows/:id/games bersemantik GANTI-SEMUA. Daftar yang dikirim
 * menjadi keanggotaan baru show, jadi melepas centang sama dengan mencabut game
 * dari etalase. Karena itu dialog ini menampilkan ringkasan dampak (berapa
 * ditambah, berapa dilepas) sebelum tombol simpan, dan meminta konfirmasi kedua
 * bila hasilnya mengosongkan show.
 */
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
  const [search, setSearch] = useState('')
  /**
   * `null` berarti pengguna belum menyentuh apa pun, sehingga pilihan mengikuti
   * data server terbaru. Tanpa ini, hasil refetch akan tertimpa snapshot lama
   * yang diambil saat dialog dibuka.
   */
  const [draft, setDraft] = useState<string[] | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  // Daftar game baru ditarik saat dialog dibuka: komponen ini dirender satu kali
  // per baris tabel, jadi memanggilnya eager berarti membuka halaman Show ikut
  // menarik seluruh katalog game.
  const {
    data: games,
    isLoading: gamesLoading,
    isError: gamesError,
    isFetching: gamesFetching,
    refetch: refetchGames,
  } = useGetGameNames({ enabled: open })

  const mutation = useSetShowGames(showId)

  const baseline = useMemo(() => existingGames?.map((g) => g.id) ?? [], [existingGames])
  const selected = draft ?? baseline

  const baselineSet = useMemo(() => new Set(baseline), [baseline])
  const selectedSet = useMemo(() => new Set(selected), [selected])

  const query = search.trim().toLowerCase()
  const filteredGames = useMemo(() => {
    if (!games?.length) return []
    if (!query) return games
    return games.filter((g) => g.name.toLowerCase().includes(query))
  }, [games, query])

  // Ringkasan dampak: admin berhak tahu apa yang akan berubah sebelum menyimpan
  const toAdd = selected.filter((id) => !baselineSet.has(id))
  const toRemove = baseline.filter((id) => !selectedSet.has(id))
  const hasChanges = toAdd.length > 0 || toRemove.length > 0
  const willBeEmpty = selected.length === 0 && baseline.length > 0

  const toggle = (id: string) => {
    setConfirmClear(false)
    setDraft((prev) => {
      const base = prev ?? baseline
      return base.includes(id) ? base.filter((x) => x !== id) : [...base, id]
    })
  }

  const close = () => {
    setOpen(false)
    setDraft(null)
    setSearch('')
    setConfirmClear(false)
  }

  const handleSubmit = () => {
    // Mengosongkan etalase adalah aksi sah, tapi tidak boleh terjadi sekali klik
    if (willBeEmpty && !confirmClear) {
      setConfirmClear(true)
      return
    }
    mutation.mutate(selected, { onSuccess: close })
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        // Jangan biarkan Radix menutup dialog selagi mutasi berjalan
        if (mutation.isPending) return
        if (next) setOpen(true)
        else close()
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className={cn('cursor-pointer gap-1.5', triggerClassName)}
          aria-label={t('addGamesModal.triggerAria')}
        >
          <Plus className='h-4 w-4 shrink-0' aria-hidden />
          <span className='hidden sm:inline'>{t('addGamesModal.triggerShort')}</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-lg'>
        <div className='border-b border-border bg-muted/30 px-6 py-5'>
          <AlertDialogHeader className='gap-1.5 text-left'>
            <div className='flex items-center gap-2'>
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                <ListPlus className='h-4 w-4' aria-hidden />
              </span>
              <AlertDialogTitle className='text-xl font-semibold tracking-tight'>
                {t('addGamesModal.title')}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className='text-left'>
              {t('addGamesModal.descriptionReplace')}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <div className='space-y-3 px-6 py-4'>
          <div className='relative'>
            <Search
              className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
              aria-hidden
            />
            <Input
              type='search'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('addGamesModal.searchPlaceholder')}
              className='pl-9'
              aria-label={t('addGamesModal.searchAria')}
              autoComplete='off'
              disabled={mutation.isPending}
            />
          </div>

          <p className='text-xs text-muted-foreground'>
            {t('addGamesModal.selectedCount', { count: selected.length })}
            {query
              ? t('addGamesModal.filterSummary', {
                  filtered: filteredGames.length,
                  total: games?.length ?? 0,
                })
              : null}
          </p>

          {/* Tinggi dikunci supaya dialog tidak melonjak saat daftar tiba */}
          <div className='h-64 space-y-0.5 overflow-y-auto rounded-lg border border-border/80 bg-muted/15 p-2'>
            {gamesLoading ? (
              <div className='space-y-1.5' role='status' aria-busy='true'>
                <span className='sr-only'>{t('addGamesModal.loadingGames')}</span>
                {[0, 1, 2, 3, 4].map((row) => (
                  <Skeleton key={row} className='h-9 w-full rounded-md' />
                ))}
              </div>
            ) : gamesError ? (
              <div
                role='alert'
                className='flex h-full flex-col items-center justify-center gap-3 px-4 text-center'
              >
                <AlertTriangle className='h-6 w-6 shrink-0 text-destructive' aria-hidden />
                <p className='text-sm text-destructive'>{t('addGamesModal.loadError')}</p>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='cursor-pointer gap-1.5'
                  onClick={() => void refetchGames()}
                  disabled={gamesFetching}
                >
                  <RefreshCw
                    className={cn('h-4 w-4 shrink-0', gamesFetching && 'animate-spin')}
                    aria-hidden
                  />
                  {t('addGamesModal.retry')}
                </Button>
              </div>
            ) : !games?.length ? (
              <p className='py-8 text-center text-sm text-muted-foreground'>
                {t('addGamesModal.noGames')}
              </p>
            ) : filteredGames.length === 0 ? (
              <p className='py-8 text-center text-sm text-muted-foreground'>
                {t('addGamesModal.noMatch')}
              </p>
            ) : (
              filteredGames.map((game) => (
                <label
                  key={game.id}
                  htmlFor={`show-${showId}-game-${game.id}`}
                  className='flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/70'
                >
                  <Checkbox
                    id={`show-${showId}-game-${game.id}`}
                    checked={selectedSet.has(game.id)}
                    onCheckedChange={() => toggle(game.id)}
                    disabled={mutation.isPending}
                    aria-label={t('addGamesModal.selectGameAria', { name: game.name })}
                  />
                  <span className='min-w-0 flex-1 truncate text-sm leading-snug text-foreground'>
                    {game.name}
                  </span>
                  {baselineSet.has(game.id) ? (
                    <span className='shrink-0 rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground'>
                      {t('addGamesModal.currentMember')}
                    </span>
                  ) : null}
                </label>
              ))
            )}
          </div>

          {hasChanges ? (
            <ul className='space-y-1 rounded-lg border border-border bg-muted/30 p-2.5 text-xs'>
              {toAdd.length > 0 ? (
                <li className='text-success'>
                  {t('addGamesModal.summaryAdd', { total: toAdd.length })}
                </li>
              ) : null}
              {toRemove.length > 0 ? (
                <li className='font-medium text-destructive'>
                  {t('addGamesModal.summaryRemove', { total: toRemove.length })}
                </li>
              ) : null}
              {toAdd.length > 0 ? (
                <li className='text-warning'>{t('addGamesModal.moveWarning')}</li>
              ) : null}
            </ul>
          ) : null}

          {willBeEmpty ? (
            <div
              role='alert'
              className='flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3'
            >
              <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-destructive' aria-hidden />
              <p className='min-w-0 text-sm text-destructive'>
                {confirmClear
                  ? t('addGamesModal.clearConfirmPrompt')
                  : t('addGamesModal.clearWarning')}
              </p>
            </div>
          ) : null}
        </div>

        <AlertDialogFooter className='gap-2 border-t border-border px-6 py-5 sm:pt-5'>
          <AlertDialogCancel
            type='button'
            className='cursor-pointer sm:min-w-[5.5rem]'
            disabled={mutation.isPending}
          >
            {t('addGamesModal.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              // Cegah Radix menutup dialog sebelum mutasi selesai
              e.preventDefault()
              handleSubmit()
            }}
            disabled={mutation.isPending || !hasChanges}
            className={cn(
              'cursor-pointer sm:min-w-[5.5rem]',
              toRemove.length > 0 && 'bg-destructive text-white hover:bg-destructive/90',
            )}
          >
            {mutation.isPending ? (
              <>
                <Loader2
                  className='mr-2 h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none'
                  aria-hidden
                />
                {t('addGamesModal.saving')}
              </>
            ) : willBeEmpty && confirmClear ? (
              t('addGamesModal.clearConfirm')
            ) : (
              t('addGamesModal.save')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
