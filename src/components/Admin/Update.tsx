import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'

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
import { Badge } from '@/components/ui/badge'
import { useAdminMutation } from '@/hooks/useAdmin'
import { useRoles } from '@/hooks/useRoles'
import { cn } from '@/lib/utils'

export const UpdateAdminRole = ({
  id,
  email,
  currentRoleId,
  currentRoleName,
  roleSlug,
  /** Backend menolak 403 kalau admin mengubah role akun sendiri. */
  isSelf,
  selfHint,
}: {
  id: string
  email: string
  currentRoleId: string | null
  currentRoleName: string
  roleSlug: string
  isSelf: boolean
  selfHint: string
}) => {
  const { t } = useTranslation('common')
  const { updateRole } = useAdminMutation()
  const { data: roles = [], isLoading, isError } = useRoles()
  const [open, setOpen] = useState(false)
  // Sengaja tidak diturunkan dari prop: instance komponen ini bisa dipakai
  // ulang untuk admin lain, dan nilai turunan prop tidak pernah ikut berganti.
  const [pendingRoleId, setPendingRoleId] = useState<string | null>(null)

  const pendingRoleName =
    roles.find((role) => role.id === pendingRoleId)?.name ?? currentRoleName

  // Baris sendiri tidak bisa diubah — tampilkan peran sebagai label dengan
  // alasannya tertulis, bukan sebagai dropdown mati tanpa penjelasan.
  if (isSelf) {
    return (
      <div className='flex min-w-0 flex-col gap-0.5'>
        <Badge
          variant='outline'
          title={currentRoleName}
          className={cn('max-w-40 truncate border-border text-xs font-medium')}
        >
          {currentRoleName}
        </Badge>
        <span className='text-[11px] text-muted-foreground'>{selfHint}</span>
      </div>
    )
  }

  const rolesUnavailable = isError || (!isLoading && roles.length === 0)

  return (
    <>
      <div className='flex min-w-0 flex-col gap-0.5'>
        <Select
          // `undefined` membuat Radix beralih ke mode tak terkendali; string
          // kosong tetap terkendali dan memunculkan placeholder, sehingga nama
          // peran yang sudah diketahui tetap terbaca selama daftar dimuat.
          value={isLoading || !currentRoleId ? '' : currentRoleId}
          onValueChange={(value) => {
            setPendingRoleId(value)
            setOpen(true)
          }}
          disabled={updateRole.isPending || isLoading || rolesUnavailable}
        >
          <SelectTrigger
            size='sm'
            aria-label={t('adminUpdate.roleAriaLabel', { email })}
            className='w-full min-w-36 max-w-56 text-xs font-medium'
          >
            <SelectValue placeholder={currentRoleName || roleSlug} />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {rolesUnavailable && (
          <span className='max-w-56 text-[11px] text-destructive'>
            {t('adminPage.rolesUnavailable')}
          </span>
        )}
      </div>

      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setPendingRoleId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('adminUpdate.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('adminUpdate.confirmDescription', { role: pendingRoleName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateRole.isPending}>
              {t('adminUpdate.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={updateRole.isPending || !pendingRoleId}
              aria-busy={updateRole.isPending}
              onClick={(event) => {
                // AlertDialogAction adalah Dialog.Close: tanpa preventDefault
                // dialog menutup sebelum mutasi selesai dan seluruh umpan
                // balik in-flight tidak pernah sempat tampil.
                event.preventDefault()
                if (!pendingRoleId) return
                updateRole.mutate(
                  { id, roleId: pendingRoleId },
                  { onSuccess: () => setOpen(false) },
                )
              }}
            >
              {updateRole.isPending ? (
                <span className='flex items-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                  {t('adminUpdate.saving')}
                </span>
              ) : (
                t('adminUpdate.confirm')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
