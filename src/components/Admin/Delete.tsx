import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { useAdminMutation } from '@/hooks/useAdmin'

export const DeleteAdminButton = ({
  id,
  email,
}: {
  id: string
  email: string
}) => {
  const { deleteAdmin } = useAdminMutation()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
          aria-label={`Hapus admin ${email}`}
        >
          <Trash2 className='h-4 w-4' aria-hidden />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className='rounded-xl'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-lg font-semibold'>Hapus akun admin?</AlertDialogTitle>
          <AlertDialogDescription className='text-sm text-muted-foreground'>
            Yakin ingin menghapus{' '}
            <span className='font-semibold text-foreground'>{email}</span>? Tindakan ini tidak dapat
            dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='gap-2 sm:gap-0'>
          <AlertDialogCancel className='rounded-lg'>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteAdmin.mutate(id)}
            disabled={deleteAdmin.isPending}
            className='rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {deleteAdmin.isPending ? (
              <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
            ) : (
              'Hapus'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
