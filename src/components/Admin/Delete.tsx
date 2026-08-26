import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { StepUpOtpSection } from '@/components/Auth/twofa/StepUpOtpSection'
import { useAdminMutation } from '@/hooks/useAdmin'
import { useStepUp } from '@/hooks/useStepUp'

export const DeleteAdminButton = ({
  id,
  email,
  /** Backend menolak 400 kalau admin menghapus akunnya sendiri. */
  isSelf,
  selfHint,
}: {
  id: string
  email: string
  isSelf: boolean
  selfHint: string
}) => {
  const { t } = useTranslation('common')
  const { deleteAdmin } = useAdminMutation()
  // Dua penjaga dengan tugas berbeda: mengetik email menahan klik tak sengaja,
  // kode TOTP membuktikan yang mengklik memang pemilik akun ini.
  const stepUp = useStepUp()
  const [open, setOpen] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')

  const confirmFieldId = `admin-delete-confirm-${id}`
  const matches = confirmEmail.trim().toLowerCase() === email.toLowerCase()
  const showMismatch = confirmEmail.trim() !== '' && !matches

  // Tombol tetap dirender agar lebar kolom aksi tidak berubah antar baris.
  // `aria-disabled`, bukan `disabled`: tombol yang benar-benar disabled hilang
  // dari urutan tab dan tooltip-nya tidak pernah muncul, sehingga alasannya
  // justru tidak sampai ke pengguna keyboard dan pembaca layar.
  if (isSelf) {
    return (
      <Button
        variant='ghost'
        size='icon'
        type='button'
        aria-disabled='true'
        aria-label={selfHint}
        title={selfHint}
        onClick={(event) => event.preventDefault()}
        className='h-8 w-8 cursor-not-allowed text-muted-foreground opacity-50 hover:bg-transparent hover:text-muted-foreground'
      >
        <Trash2 className='h-4 w-4' aria-hidden />
      </Button>
    )
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (deleteAdmin.isPending) return
        setOpen(next)
        if (!next) {
          setConfirmEmail('')
          stepUp.reset()
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          type='button'
          className='h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
          aria-label={t('adminDelete.triggerLabel', { email })}
        >
          <Trash2 className='h-4 w-4' aria-hidden />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className='rounded-xl'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-lg font-semibold'>
            {t('adminDelete.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className='text-sm text-muted-foreground'>
            {t('adminDelete.description', { email })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Penghapusan tidak bisa dibatalkan dan tidak diverifikasi sandi di
            backend, jadi email tujuan diketik ulang supaya klik tak sengaja
            pada ikon tong sampah tidak cukup untuk menghapus akun. */}
        <div className='space-y-2'>
          <Label htmlFor={confirmFieldId} className='text-sm font-medium'>
            {t('adminDelete.typeEmailLabel', { email })}
          </Label>
          <Input
            id={confirmFieldId}
            value={confirmEmail}
            onChange={(event) => setConfirmEmail(event.target.value)}
            placeholder={t('adminDelete.typeEmailPlaceholder')}
            autoComplete='off'
            aria-invalid={showMismatch}
            className='rounded-lg'
          />
          {showMismatch && (
            <p className='text-xs text-destructive'>{t('adminDelete.emailMismatch')}</p>
          )}
        </div>

        {stepUp.required && (
          <StepUpOtpSection
            code={stepUp.code}
            onCodeChange={stepUp.changeCode}
            error={stepUp.error}
            disabled={deleteAdmin.isPending}
          />
        )}

        <AlertDialogFooter className='gap-2 sm:gap-0'>
          <AlertDialogCancel
            autoFocus
            disabled={deleteAdmin.isPending}
            className='rounded-lg'
          >
            {t('adminDelete.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              // Tanpa preventDefault, AlertDialogAction (Dialog.Close) menutup
              // dialog di klik yang sama sehingga spinner tak pernah terlihat.
              event.preventDefault()
              if (!matches || !stepUp.canSubmit) return
              deleteAdmin.mutate(
                { id, otp: stepUp.otp },
                {
                  onSuccess: () => {
                    stepUp.reset()
                    setOpen(false)
                  },
                  onError: stepUp.handleError,
                },
              )
            }}
            disabled={deleteAdmin.isPending || !matches || !stepUp.canSubmit}
            aria-busy={deleteAdmin.isPending}
            className='rounded-lg bg-destructive text-white hover:bg-destructive/90'
          >
            {deleteAdmin.isPending ? (
              <span className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                {t('adminDelete.deleting')}
              </span>
            ) : (
              t('adminDelete.confirm')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
