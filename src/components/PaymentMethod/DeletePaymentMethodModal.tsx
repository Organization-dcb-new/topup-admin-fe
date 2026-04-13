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
import { useDeletePaymentMethod } from '@/hooks/usePaymentMethod'
import { useTranslation } from 'react-i18next'

export function DeletePaymentMethodModal({ id }: { id: string }) {
  const { t } = useTranslation('common')
  const mutation = useDeletePaymentMethod(id)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          disabled={mutation.isPending}
          aria-label={t('paymentMethodDelete.triggerAria')}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">{t('paymentMethodDelete.title')}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {t('paymentMethodDelete.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="rounded-lg">{t('paymentMethodDelete.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {t('paymentMethodDelete.deleting')}
              </span>
            ) : (
              t('paymentMethodDelete.confirmDelete')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
