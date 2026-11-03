import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { PERM } from '@/constants/permissions'
import { useAdminMutation } from '@/hooks/useAdmin'
import { usePermissions } from '@/hooks/usePermissions'
import { useRoleOptions } from '@/hooks/useRoles'
import { useAuthUser } from '@/lib/auth'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const UpdateAdminRole = ({
  id,
  currentRole,
  currentRoleName,
}: {
  id: string
  currentRole: string
  currentRoleName?: string
}) => {
  const { t } = useTranslation()
  const { user } = useAuthUser()
  const { can } = usePermissions()
  const roleOptions = useRoleOptions()
  const { updateRole } = useAdminMutation()
  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(currentRole)

  // The backend refuses to change your own role, so don't offer it.
  const isSelf = user?.id === id
  // Keep the current role selectable even when it isn't in the list (e.g. dev, or no role.view).
  const options = roleOptions.some((option) => option.slug === currentRole)
    ? roleOptions
    : [...roleOptions, { slug: currentRole, name: currentRoleName || currentRole }]
  const selected = options.find((option) => option.slug === selectedRole)

  if (!can(PERM.adminUpdate)) return null

  const handleConfirm = () => {
    updateRole.mutate({ id, role: selectedRole, roleId: selected?.id })
    setOpen(false)
  }

  return (
    <>
      <Select
        value={currentRole}
        onValueChange={(value) => {
          setSelectedRole(value)
          setOpen(true)
        }}
        disabled={updateRole.isPending || isSelf}
      >
        <SelectTrigger
          title={isSelf ? t('adminTable.cannotChangeOwnRole') : undefined}
          className='h-8 min-w-25 text-[10px] font-black uppercase ring-offset-0 focus:ring-0'
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.slug} value={option.slug}>
              {option.name.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perikatan Role</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengubah role menjadi {(selected?.name ?? selectedRole).toUpperCase()}?
              Ini akan merubah hak akses akun terkait.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className='bg-indigo-600 hover:bg-indigo-700'>
              Ubah Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
