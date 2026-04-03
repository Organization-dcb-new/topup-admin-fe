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
import { Trash2 } from 'lucide-react'
import { useDeleteBanner } from '@/hooks/useBanner'
import { cn } from '@/lib/utils'

export function DeleteBannerButton({
  id,
  triggerClassName,
}: {
  id: string
  triggerClassName?: string
}) {
  const mutation = useDeleteBanner(id)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'cursor-pointer gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive',
            triggerClassName,
          )}
          disabled={mutation.isPending}
          aria-label="Hapus banner"
        >
          <Trash2 className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Hapus</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <div className="border-b border-border bg-muted/30 px-6 py-5">
          <AlertDialogHeader className="gap-1.5 text-left">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <Trash2 className="h-4 w-4" aria-hidden />
              </span>
              <AlertDialogTitle className="text-xl font-semibold tracking-tight">
                Hapus banner?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              Tindakan ini tidak bisa dibatalkan. Banner akan dihapus dari daftar dan tidak lagi tampil
              di aplikasi.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className="gap-2 border-t border-border px-6 py-5 sm:pt-5">
          <AlertDialogCancel className="cursor-pointer sm:min-w-[5.5rem]" disabled={mutation.isPending}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:min-w-[5.5rem]"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Menghapus…' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
