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
import { cn } from '@/lib/utils'
import { Loader2, Trash2 } from 'lucide-react'
import { useDeleteBlog } from '../hooks/useBlog'

export function DeleteBlogDialog({
  blogId,
  triggerClassName,
}: {
  blogId: string
  triggerClassName?: string
}) {
  const deleteMutation = useDeleteBlog()
  const inToolbar = Boolean(triggerClassName)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant={inToolbar ? 'outline' : 'ghost'}
          size={inToolbar ? 'sm' : 'icon'}
          className={cn(
            'cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive',
            inToolbar
              ? cn('gap-1.5', triggerClassName)
              : 'h-9 w-9 shrink-0',
            !inToolbar && 'hover:text-destructive',
          )}
          disabled={deleteMutation.isPending}
          aria-label="Hapus artikel"
        >
          <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
          {inToolbar ? <span className="hidden sm:inline">Hapus</span> : null}
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
                Hapus artikel?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              Tindakan ini tidak bisa dibatalkan. Artikel akan dihapus permanen dari server.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className="gap-2 border-t border-border px-6 py-5 sm:pt-5">
          <AlertDialogCancel
            className="cursor-pointer sm:min-w-[5.5rem]"
            disabled={deleteMutation.isPending}
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            className="inline-flex cursor-pointer items-center justify-center bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:min-w-[5.5rem]"
            onClick={() => deleteMutation.mutate(blogId)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" aria-hidden />
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
