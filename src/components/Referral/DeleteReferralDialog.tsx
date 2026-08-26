import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDeleteReferralCode } from '@/hooks/useReferral'
import type { ReferralCode } from '@/types/referral'

interface DeleteReferralDialogProps {
  referral: ReferralCode | null
  onOpenChange: (open: boolean) => void
}

export const DeleteReferralDialog = ({ referral, onOpenChange }: DeleteReferralDialogProps) => {
  const { t } = useTranslation('common')
  const { mutate, isPending } = useDeleteReferralCode()
  const [confirmCode, setConfirmCode] = useState('')

  const code = referral?.code ?? ''
  const matches = confirmCode.trim().toUpperCase() === code.toUpperCase() && code !== ''
  const showMismatch = confirmCode.trim() !== '' && !matches

  return (
    <AlertDialog
      open={!!referral}
      onOpenChange={(next) => {
        if (isPending) return
        if (!next) setConfirmCode('')
        onOpenChange(next)
      }}
    >
      <AlertDialogContent className='rounded-2xl'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-lg font-semibold'>
            {t('referralPage.deleteConfirm.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className='text-sm text-muted-foreground'>
            {t('referralPage.deleteConfirm.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Penghapusan permanen dan tidak diverifikasi ulang backend, jadi kode
            tujuan diketik ulang — sekaligus menyebut kode mana yang dihapus,
            yang dulu tidak pernah disebutkan sama sekali. */}
        <div className='space-y-2'>
          <Label htmlFor='referral-delete-confirm' className='text-sm font-medium'>
            {t('referralDelete.typeCodeLabel', { code })}
          </Label>
          <Input
            id='referral-delete-confirm'
            value={confirmCode}
            onChange={(event) => setConfirmCode(event.target.value)}
            placeholder={t('referralDelete.typeCodePlaceholder')}
            autoComplete='off'
            spellCheck={false}
            aria-invalid={showMismatch}
            className='rounded-lg font-mono uppercase'
          />
          {showMismatch && (
            <p className='text-xs text-destructive'>{t('referralDelete.codeMismatch')}</p>
          )}
        </div>

        <AlertDialogFooter className='gap-2 sm:gap-0'>
          <AlertDialogCancel autoFocus disabled={isPending} className='rounded-xl'>
            {t('referralPage.deleteConfirm.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              // AlertDialogAction adalah Dialog.Close: tanpa preventDefault
              // dialog menutup di klik yang sama dan spinner tak pernah tampil,
              // sehingga klik kedua mengirim DELETE kedua.
              event.preventDefault()
              if (!referral || !matches) return
              mutate(referral.id, { onSuccess: () => onOpenChange(false) })
            }}
            disabled={isPending || !matches}
            aria-busy={isPending}
            className='rounded-xl bg-destructive text-white hover:bg-destructive/90'
          >
            {isPending ? (
              <span className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                {t('referralDelete.deleting')}
              </span>
            ) : (
              t('referralPage.deleteConfirm.confirm')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
