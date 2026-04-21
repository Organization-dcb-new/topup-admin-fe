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
import { useState } from 'react'

export const UpdateAdminRole = ({
  id,
  currentRole,
}: {
  id: string
  currentRole: string
}) => {
  const { updateRole } = useAdminMutation()
  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(currentRole)

  const handleConfirm = () => {
    updateRole.mutate({ id, role: selectedRole })
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
        disabled={updateRole.isPending}
      >
        <SelectTrigger className='w-25 h-8 text-[10px] font-black uppercase ring-offset-0 focus:ring-0'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='admin'>ADMIN</SelectItem>
          <SelectItem value='noc'>NOC</SelectItem>
        </SelectContent>
      </Select>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perikatan Role</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengubah role menjadi {selectedRole.toUpperCase()}?
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
