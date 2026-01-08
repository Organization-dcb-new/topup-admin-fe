import type { Game } from '@/types/game'
import { Button } from '../ui/button'
import { Pencil } from 'lucide-react'
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

interface EditGameModalProps {
  game: Game
}

export interface FormValuesEditGame {
  name: string
}

export default function EditGameModal({ game }: EditGameModalProps) {
  const [open, setOpen] = useState(false)

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
    })
  }, [open, game, reset])

  const updateGameMutation = useUpdateGame(setOpen, game.id)

  const onSubmit = (values: FormValuesEditGame) => {
    updateGameMutation.mutate(values)
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="cursor-pointer">
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                {...register('name', {
                  required: 'Name is required',
                })}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={updateGameMutation.isPending}
                className="cursor-pointer"
              >
                {updateGameMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
