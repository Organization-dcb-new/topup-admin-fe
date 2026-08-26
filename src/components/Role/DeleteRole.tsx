import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
} from '@/components/ui/alert-dialog'
import { StepUpOtpSection } from '@/components/Auth/twofa/StepUpOtpSection'
import { useDeleteRole } from '@/hooks/useRoles'
import { useStepUp } from '@/hooks/useStepUp'
import type { Role } from '@/types/permission'

/**
 * Tombol dinonaktifkan untuk role bawaan sistem dan role yang masih dipakai.
 * Backend juga menolak keduanya (403 dan 409), tapi mengandalkan error server
 * berarti user harus mengklik dulu untuk tahu bahwa aksinya mustahil.
 */
export const DeleteRoleButton = ({ role }: { role: Role }) => {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const deleteRole = useDeleteRole(() => setOpen(false))
  // Menghapus role menghilangkan definisinya beserta seluruh centang
  // permission, dan tidak bisa dikembalikan — backend menuntut kode TOTP
  // sekali pakai kalau aktornya sudah mengaktifkan 2FA.
  const stepUp = useStepUp()

  const blockedReason = role.is_system
    ? t('rolePage.deleteSystem')
    : role.admin_count > 0
      ? t('rolePage.deleteInUse', { count: role.admin_count })
      : null

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        className='text-destructive hover:bg-destructive/10 hover:text-destructive'
        disabled={!!blockedReason || deleteRole.isPending}
        title={blockedReason ?? undefined}
        onClick={() => setOpen(true)}
      >
        <Trash2 className='h-4 w-4' aria-hidden />
        <span className='sr-only'>{t('rolePage.delete')}</span>
      </Button>

      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          // Menutup saat permintaan masih jalan hanya menyembunyikan prosesnya.
          if (deleteRole.isPending) return
          setOpen(next)
          if (!next) stepUp.reset()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('rolePage.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('rolePage.deleteBody', { name: role.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {stepUp.required && (
            <StepUpOtpSection
              code={stepUp.code}
              onCodeChange={stepUp.changeCode}
              error={stepUp.error}
              disabled={deleteRole.isPending}
            />
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteRole.isPending}>
              {t('rolePage.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                // AlertDialogAction adalah Dialog.Close: tanpa preventDefault
                // dialog menutup di klik yang sama, sehingga kode OTP yang
                // ditolak tidak pernah sempat tampil di kolomnya.
                event.preventDefault()
                if (!stepUp.canSubmit) return
                deleteRole.mutate(
                  { id: role.id, otp: stepUp.otp },
                  { onError: stepUp.handleError },
                )
              }}
              disabled={deleteRole.isPending || !stepUp.canSubmit}
              aria-busy={deleteRole.isPending}
              className='bg-destructive text-white hover:bg-destructive/90'
            >
              {deleteRole.isPending ? (
                <span className='flex items-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                  {t('rolePage.deleting')}
                </span>
              ) : (
                t('rolePage.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
