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
import { Loader2, Trash2 } from 'lucide-react'
import { useDeletePaymentCategory } from '@/hooks/usePaymentMethodCategory'
import { cn } from '@/lib/utils'
import {
  pmBtn,
  pmDialog,
  pmDialogDesc,
  pmDialogHeader,
  pmDialogIcon,
  pmDialogTitle,
  pmIconBtn,
} from '@/components/PaymentMethod/styles'

export function DeletePaymentCategory({ id }: { id: string }) {
  const mutation = useDeletePaymentCategory(id)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type='button'
          className={cn(pmIconBtn, 'bg-[#ff4d3d]')}
          disabled={mutation.isPending}
          aria-label='Hapus kategori'
        >
          <Trash2 className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className={cn(pmDialog, 'overflow-hidden sm:max-w-lg')}>
        <div className={cn(pmDialogHeader, 'bg-[#ff4d3d]')}>
          <AlertDialogHeader className='gap-2 text-left'>
            <div className='flex items-center gap-2.5'>
              <span className={pmDialogIcon}>
                <Trash2 className='h-4 w-4' strokeWidth={3} aria-hidden />
              </span>
              <AlertDialogTitle className={pmDialogTitle}>Hapus kategori?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className={cn(pmDialogDesc, 'text-left')}>
              Tindakan ini tidak dapat dibatalkan. Kategori akan dihapus dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className='gap-2 px-5 py-5'>
          <AlertDialogCancel className={cn(pmBtn, 'bg-white')}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(pmBtn, 'bg-[#ff4d3d]')}
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' strokeWidth={3} aria-hidden />
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
