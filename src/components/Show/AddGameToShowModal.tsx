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
import { ListPlus, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useAddGamesToShow } from '@/hooks/useShow'
import { useGetGameNames } from '@/hooks/useGame'
import type { ShowGame } from '@/types/show'
import type { GameName } from '../Blog/types/blog'

export function AddGamesToShowButton({
  showId,
  existingGames,
  triggerClassName,
}: {
  showId: string
  existingGames?: ShowGame[]
  triggerClassName?: string
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const { data: games, isLoading: gamesLoading } = useGetGameNames()
  const mutation = useAddGamesToShow(showId)

  const query = search.trim().toLowerCase()
  const filteredGames = useMemo(() => {
    if (!games?.length) return []
    if (!query) return games
    return games.filter((g: GameName) => g.name.toLowerCase().includes(query))
  }, [games, query])

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSubmit = () => {
    mutation.mutate(selected)
  }

  return (
    <AlertDialog
      onOpenChange={(open) => {
        if (!open) return
        setSearch('')
        setSelected(existingGames?.map((g) => g.id) ?? [])
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('cursor-pointer gap-1.5', triggerClassName)}
          aria-label="Atur game pada show"
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          <span className="hidden sm:inline">Atur game</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <div className="border-b border-border bg-muted/30 px-6 py-5">
          <AlertDialogHeader className="gap-1.5 text-left">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ListPlus className="h-4 w-4" aria-hidden />
              </span>
              <AlertDialogTitle className="text-xl font-semibold tracking-tight">
                Atur game pada show
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              Centang game yang ingin masuk ke show ini. Daftar bisa disaring dengan kolom pencarian.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <div className="space-y-3 px-6 py-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama game…"
              className="pl-9"
              aria-label="Cari game"
              autoComplete="off"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">{selected.length}</span> game
            dipilih
            {query ? (
              <>
                {' '}
                · menampilkan{' '}
                <span className="font-medium tabular-nums text-foreground">
                  {filteredGames.length}
                </span>{' '}
                dari {games?.length ?? 0}
              </>
            ) : null}
          </p>

          <div className="max-h-64 space-y-0.5 overflow-y-auto rounded-lg border border-border/80 bg-muted/15 p-2">
            {gamesLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Memuat daftar game…</p>
            ) : !games?.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Belum ada game yang bisa dipilih.
              </p>
            ) : filteredGames.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Tidak ada game yang cocok dengan pencarian.
              </p>
            ) : (
              filteredGames.map((game: GameName) => (
                <label
                  key={game.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/70"
                >
                  <Checkbox
                    checked={selected.includes(game.id)}
                    onCheckedChange={() => toggle(game.id)}
                    aria-label={`Pilih ${game.name}`}
                  />
                  <span className="select-none text-sm leading-snug text-foreground">{game.name}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <AlertDialogFooter className="gap-2 border-t border-border px-6 py-5 sm:pt-5">
          <AlertDialogCancel
            className="cursor-pointer sm:min-w-[5.5rem]"
            disabled={mutation.isPending}
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={!selected.length || mutation.isPending}
            className="cursor-pointer sm:min-w-[5.5rem]"
          >
            {mutation.isPending ? 'Menyimpan…' : 'Simpan'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
