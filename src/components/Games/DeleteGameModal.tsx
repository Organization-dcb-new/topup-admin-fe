import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import { useDeleteGame } from '@/hooks/useGame'
import { useState } from 'react'

export function DeleteGameModal({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const mutation = useDeleteGame(id)

  const handleDelete = () => {
    mutation.mutate(undefined, {
      onSuccess: () => setOpen(false),
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          disabled={mutation.isPending}
          aria-label="Hapus game"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-xl">
        <AlertDialogHeader className="space-y-1 text-left">
          <AlertDialogTitle className="text-lg font-semibold">Hapus game?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Game beserta data terkait dapat terpengaruh. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 gap-3 sm:flex-row sm:justify-end sm:gap-4">
          <AlertDialogCancel
            type="button"
            className="h-10 rounded-lg px-5"
            disabled={mutation.isPending}
          >
            Batal
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            className="h-10 min-w-[6.5rem] rounded-lg px-5 font-semibold"
            onClick={handleDelete}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Menghapus…
              </span>
            ) : (
              'Hapus'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
