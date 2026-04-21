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
import { useDeleteShow } from '@/hooks/useShow'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export function DeleteShowButton({
  id,
  triggerClassName,
}: {
  id: string
  triggerClassName?: string
}) {
  const { t } = useTranslation('common')
  const mutation = useDeleteShow(id)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn(
            'cursor-pointer gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive',
            triggerClassName,
          )}
          disabled={mutation.isPending}
          aria-label={t('deleteShowModal.triggerAria')}
        >
          <Trash2 className='h-4 w-4 shrink-0' aria-hidden />
          <span className='hidden sm:inline'>{t('deleteShowModal.triggerLabel')}</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-lg'>
        <div className='border-b border-border bg-muted/30 px-6 py-5'>
          <AlertDialogHeader className='gap-1.5 text-left'>
            <div className='flex items-center gap-2'>
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive'>
                <Trash2 className='h-4 w-4' aria-hidden />
              </span>
              <AlertDialogTitle className='text-xl font-semibold tracking-tight'>
                {t('deleteShowModal.title')}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className='text-left'>
              {t('deleteShowModal.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className='gap-2 border-t border-border px-6 py-5 sm:pt-5'>
          <AlertDialogCancel
            className='cursor-pointer sm:min-w-[5.5rem]'
            disabled={mutation.isPending}
          >
            {t('addGamesModal.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className='cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:min-w-[5.5rem]'
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t('deleteShowModal.deleting') : t('deleteShowModal.confirmDelete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
