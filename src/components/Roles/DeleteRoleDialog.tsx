import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { DangerDialog } from '@/components/Auth/DangerDialog'
import { roleErrorKey, useDeleteRole } from '@/hooks/useRoles'
import type { Role } from '@/types/role'

interface DeleteRoleDialogProps {
  role: Pick<Role, 'id' | 'name'> | null
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function DeleteRoleDialog({ role, onOpenChange, onDeleted }: DeleteRoleDialogProps) {
  const { t } = useTranslation()
  const deleteRole = useDeleteRole()
  const error = deleteRole.error ? roleErrorKey(deleteRole.error) : null

  return (
    <DangerDialog
      open={!!role}
      onOpenChange={(open) => {
        if (!open) deleteRole.reset()
        onOpenChange(open)
      }}
      eyebrow={t('rolesPage.deleteEyebrow')}
      title={t('rolesPage.deleteTitle', { name: role?.name ?? '' })}
      description={t('rolesPage.deleteDescription')}
      confirmLabel={t('rolesPage.delete')}
      cancelLabel={t('rolesPage.cancel')}
      pending={deleteRole.isPending}
      error={error && <AuthAlert>{error.detail ?? t(error.key)}</AuthAlert>}
      onConfirm={() => {
        if (!role) return
        deleteRole.mutate(role.id, {
          onSuccess: () => {
            toast.success(t('rolesPage.deleted', { name: role.name }))
            deleteRole.reset()
            onOpenChange(false)
            onDeleted?.()
          },
        })
      }}
    />
  )
}
