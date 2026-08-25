import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'

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
import { useDeleteRole } from '@/hooks/useRoles'
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

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('rolePage.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('rolePage.deleteBody', { name: role.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('rolePage.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRole.mutate(role.id)}
              className='bg-destructive text-white hover:bg-destructive/90'
            >
              {t('rolePage.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
