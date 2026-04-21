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
import { useDeleteProvider } from '@/hooks/useProvider'
import { Loader2, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function DeleteProviderModal({ id }: { id: string }) {
  const { t } = useTranslation('common')
  const mutation = useDeleteProvider(id)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='cursor-pointer text-destructive hover:bg-destructive/10'
          disabled={mutation.isPending}
          aria-label={t('providerDelete.triggerAria')}
        >
          <Trash2 className='h-4 w-4' aria-hidden />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className='rounded-2xl'>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('providerDelete.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('providerDelete.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className='cursor-pointer rounded-xl'>{t('providerDelete.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            className='inline-flex cursor-pointer items-center gap-2 rounded-xl bg-destructive hover:bg-destructive/90'
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin' aria-hidden />
                {t('providerDelete.deleting')}
              </>
            ) : (
              t('providerDelete.confirmDelete')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
