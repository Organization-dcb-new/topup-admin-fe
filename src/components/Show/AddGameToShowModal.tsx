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
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useAddGamesToShow } from '@/hooks/useShow'
import { useGetGameNames } from '@/hooks/useGame'

type GameName = {
  id: string
  name: string
}

export function AddGamesToShowButton({ showId }: { showId: string }) {
  const [selected, setSelected] = useState<string[]>([])

  const { data: games } = useGetGameNames()
  const mutation = useAddGamesToShow(showId)

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = () => {
    mutation.mutate(selected)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className='cursor-pointer' variant="ghost" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Games to Show</AlertDialogTitle>
          <AlertDialogDescription>
            Select games you want to add to this show.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* LIST GAME */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {games?.map((game: GameName) => (
            <label
              key={game.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(game.id)}
                onChange={() => toggle(game.id)}
              />
              <span>{game.name}</span>
            </label>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={!selected.length || mutation.isPending}
            className="cursor-pointer"
          >
            {mutation.isPending ? 'Saving...' : 'Add Games'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
