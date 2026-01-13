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
import { useGetCategories } from '@/hooks/useCategory'

interface EditGameModalProps {
  game: Game
}

export interface FormValuesEditGame {
  name: string
  is_show: boolean
  category_id?: string
}

export default function EditGameModal({ game }: EditGameModalProps) {
  const [open, setOpen] = useState(false)
  const { data } = useGetCategories()

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
      category_id: game.category_id,
    })
  }, [open, game, reset])

  const updateGameMutation = useUpdateGame(setOpen, game.id)

  const onSubmit = (values: FormValuesEditGame) => {
    updateGameMutation.mutate({
      ...values,
      category_id: values.category_id || undefined,
    })
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
            <div className="space-y-4">
              {/* Name Input */}
              <div className="flex flex-col space-y-1">
                <Label htmlFor="name" className="font-medium text-sm text-gray-700">
                  Name
                </Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Enter game name"
                  className="w-full"
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              {/* Category Select */}
              <div className="flex flex-col space-y-1">
                <Label htmlFor="category_id" className="font-medium text-sm text-gray-700">
                  Category
                </Label>

                <select
                  id="category_id"
                  {...register('category_id')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Optional Category --</option>
                  {data?.data?.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* isShow Checkbox */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  {...register('is_show')}
                  id="isShow"
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <Label htmlFor="isShow" className="text-gray-700 font-medium cursor-pointer">
                  Show Game
                </Label>
              </div>
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
