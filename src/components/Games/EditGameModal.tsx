import type { Game } from '@/types/game'
import { Button } from '../ui/button'
import { Loader2, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useUpdateGame } from '@/hooks/useGame'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useGetCategoriesName } from '@/hooks/useCategory'
import type { CategoryNames } from '@/types/category'
import { cn } from '@/lib/utils'

interface EditGameModalProps {
  game: Game
}

export interface FormValuesEditGame {
  name: string
  description?: string
  is_show: boolean
  category_id?: string
  popularity_score?: number
}

export default function EditGameModal({ game }: EditGameModalProps) {
  const [open, setOpen] = useState(false)

  const { data: categoriesResponse } = useGetCategoriesName()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValuesEditGame>()

  useEffect(() => {
    if (!open) return

    reset({
      name: game.name,
      is_show: game.is_show,
      description: game.description,
      category_id: game.category_id,
      popularity_score: game.popularity_score,
    })
  }, [open, game, reset])

  const updateGameMutation = useUpdateGame(setOpen, game.id)

  const onSubmit = (values: FormValuesEditGame) => {
    updateGameMutation.mutate({
      ...values,
      category_id: values.category_id || undefined,
    })
  }

  const gid = game.id
  const categories: CategoryNames[] = categoriesResponse?.data ?? []

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => setOpen(true)}
        className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={`Ubah game ${game.name}`}
      >
        <Pencil className="h-4 w-4" aria-hidden />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-xl sm:max-w-lg">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">Ubah game</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Perbarui nama, deskripsi, kategori, dan skor popularitas. Status tampil di etalase
              tetap diatur dari kolom aksi.
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`edit-game-name-${gid}`} className="text-sm font-medium">
                  Nama game
                </Label>
                <Input
                  id={`edit-game-name-${gid}`}
                  {...register('name', { required: 'Nama wajib diisi' })}
                  placeholder="Nama game"
                  className="rounded-lg"
                  autoComplete="off"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`edit-game-desc-${gid}`} className="text-sm font-medium">
                  Deskripsi
                </Label>
                <Textarea
                  id={`edit-game-desc-${gid}`}
                  {...register('description', { required: 'Deskripsi wajib diisi' })}
                  placeholder="Deskripsi singkat game"
                  rows={4}
                  className="max-h-40 min-h-[6rem] resize-y rounded-lg"
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`edit-game-cat-${gid}`} className="text-sm font-medium">
                  Kategori
                </Label>
                <select
                  id={`edit-game-cat-${gid}`}
                  {...register('category_id')}
                  className={cn(
                    'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs',
                    'ring-offset-background focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  <option value="">— Tanpa kategori —</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`edit-game-pop-${gid}`} className="text-sm font-medium">
                  Skor popularitas
                </Label>
                <Input
                  id={`edit-game-pop-${gid}`}
                  type="number"
                  step="1"
                  {...register('popularity_score', {
                    required: 'Skor popularitas wajib diisi',
                    valueAsNumber: true,
                  })}
                  placeholder="0"
                  className="rounded-lg"
                />
                {errors.popularity_score && (
                  <p className="text-xs text-destructive">{errors.popularity_score.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="mt-4 gap-3 sm:flex-row sm:justify-end sm:gap-4">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg px-5"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="h-10 min-w-[6.5rem] rounded-lg px-5 font-semibold"
                disabled={updateGameMutation.isPending}
              >
                {updateGameMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Menyimpan…
                  </span>
                ) : (
                  'Simpan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
