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
import { Loader2, Trash2 } from 'lucide-react'
import { useDeletePaymentCategory } from '@/hooks/usePaymentMethodCategory'

export function DeletePaymentCategory({ id }: { id: string }) {
  const mutation = useDeletePaymentCategory(id)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
          disabled={mutation.isPending}
          aria-label='Hapus kategori'
        >
          <Trash2 className='h-4 w-4' aria-hidden />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className='rounded-xl'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-lg font-semibold'>Hapus kategori?</AlertDialogTitle>
          <AlertDialogDescription className='text-sm text-muted-foreground'>
            Tindakan ini tidak dapat dibatalkan. Kategori akan dihapus dari sistem.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className='gap-2 sm:gap-0'>
          <AlertDialogCancel className='rounded-lg'>Batal</AlertDialogCancel>
          <AlertDialogAction
            className='rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90'
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                Menghapus…
              </span>
            ) : (
              'Hapus'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
