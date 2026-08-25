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
import { useAdminMutation } from '@/hooks/useAdmin'
import { useRoles } from '@/hooks/useRoles'
import { useState } from 'react'

export const UpdateAdminRole = ({
  id,
  currentRoleId,
  currentRoleName,
  /** Backend menolak 403 kalau admin mengubah role akun sendiri. */
  isSelf,
  selfHint,
}: {
  id: string
  currentRoleId: string | null
  currentRoleName: string
  isSelf: boolean
  selfHint: string
}) => {
  const { updateRole } = useAdminMutation()
  const { data: roles = [], isLoading } = useRoles()
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(currentRoleId)

  const selectedName = roles.find((r) => r.id === selectedId)?.name ?? currentRoleName

  const handleConfirm = () => {
    if (selectedId) updateRole.mutate({ id, roleId: selectedId })
    setOpen(false)
  }

  return (
    <>
      <Select
        value={currentRoleId ?? undefined}
        onValueChange={(value) => {
          setSelectedId(value)
          setOpen(true)
        }}
        disabled={updateRole.isPending || isLoading || isSelf}
      >
        <SelectTrigger
          className='h-8 w-36 text-[10px] font-black uppercase ring-offset-0 focus:ring-0'
          title={isSelf ? selfHint : undefined}
        >
          <SelectValue placeholder={currentRoleName} />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan Role</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengubah role menjadi {selectedName}? Ini akan
              mengubah hak akses akun terkait.
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
