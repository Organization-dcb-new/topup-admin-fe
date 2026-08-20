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
import { useDeleteReferralCode } from '@/hooks/useReferral'
import {
  nbAccent,
  nbDialog,
  nbDialogButton,
  nbDialogHeader,
  nbDialogIcon,
  nbDialogTitle,
  nbHint,
  nbIconButton,
} from '@/lib/nb'
import { cn } from '@/lib/utils'
import { Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function DeleteReferralModal({ id }: { id: string }) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const mutation = useDeleteReferralCode()

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type='button'
          className={cn(nbIconButton, nbAccent.red)}
          disabled={mutation.isPending}
          aria-label={t('referralPage.deleteBtn')}
          title={t('referralPage.deleteBtn')}
        >
          <Trash2 className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className={nbDialog}>
        <div className={cn(nbDialogHeader, nbAccent.red)}>
          <AlertDialogHeader className='gap-2 text-left'>
            <div className='flex items-center gap-2.5'>
              <span className={nbDialogIcon}>
                <Trash2 className='h-4 w-4' strokeWidth={3} aria-hidden />
              </span>
              <AlertDialogTitle className={nbDialogTitle}>
                {t('referralPage.deleteConfirm.title')}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className={cn(nbHint, 'text-left')}>
              {t('referralPage.deleteConfirm.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className='gap-2 px-5 py-5'>
          <AlertDialogCancel
            className={cn(nbDialogButton, nbAccent.white)}
            disabled={mutation.isPending}
          >
            {t('referralPage.deleteConfirm.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(nbDialogButton, nbAccent.red, 'text-[#111]')}
            onClick={(e) => {
              e.preventDefault()
              mutation.mutate(id, { onSuccess: () => setOpen(false) })
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
            )}
            {t('referralPage.deleteConfirm.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
