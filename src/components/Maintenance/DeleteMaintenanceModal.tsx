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
import { useDeleteMaintenance } from '@/hooks/useMaintenance'
import { cn } from '@/lib/utils'
import { Loader2, Trash2 } from 'lucide-react'

export function DeleteMaintenanceModal({
  id,
  name,
  triggerClassName,
}: {
  id: string
  name: string
  triggerClassName?: string
}) {
  const mutation = useDeleteMaintenance(id)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('cursor-pointer text-destructive hover:bg-destructive/10', triggerClassName)}
          disabled={mutation.isPending}
          aria-label={`Hapus pemeliharaan ${name}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus pemeliharaan?</AlertDialogTitle>
          <AlertDialogDescription>
            Entri &quot;{name}&quot; akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer rounded-xl">Batal</AlertDialogCancel>
          <AlertDialogAction
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-destructive hover:bg-destructive/90"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                Menghapus…
              </>
            ) : (
              'Hapus'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
