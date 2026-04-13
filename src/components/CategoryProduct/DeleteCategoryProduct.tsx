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
import { useDeleteCategoryProduct } from '@/hooks/useCategoryProduct'
import { useTranslation } from 'react-i18next'

export function DeleteCategoryProductButton({ id }: { id: string }) {
  const { t } = useTranslation('common')
  const mutation = useDeleteCategoryProduct(id)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="cursor-pointer text-destructive hover:bg-destructive/10"
          disabled={mutation.isPending}
          aria-label={t('categoryProductDelete.triggerAria')}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('categoryProductDelete.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('categoryProductDelete.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer rounded-xl">{t('categoryProductDelete.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-destructive hover:bg-destructive/90"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                {t('categoryProductDelete.deleting')}
              </>
            ) : (
              t('categoryProductDelete.confirmDelete')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
