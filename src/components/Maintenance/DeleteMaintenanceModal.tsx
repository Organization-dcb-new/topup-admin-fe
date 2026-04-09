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
import { useTranslation } from 'react-i18next'

export function DeleteMaintenanceModal({
  id,
  name,
  triggerClassName,
}: {
  id: string
  name: string
  triggerClassName?: string
}) {
  const { t } = useTranslation('common')
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
          aria-label={t('maintenanceDeleteModal.triggerAria', { name })}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('maintenanceDeleteModal.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('maintenanceDeleteModal.description', { name })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer rounded-xl">
            {t('maintenanceDeleteModal.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-destructive hover:bg-destructive/90"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                {t('maintenanceDeleteModal.deleting')}
              </>
            ) : (
              t('maintenanceDeleteModal.confirmDelete')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
