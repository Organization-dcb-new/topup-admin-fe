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
import {
  nbAccent,
  nbDialog,
  nbDialogButton,
  nbDialogHeader,
  nbDialogIcon,
  nbDialogTitle,
  nbHint,
  nbSelectContent,
  nbSelectItem,
  nbSelectTrigger,
} from '@/lib/nb'
import { cn } from '@/lib/utils'
import { ShieldCheck } from 'lucide-react'
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
        <SelectTrigger size='sm' className={cn(nbSelectTrigger, 'w-25 text-[10px]')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={nbSelectContent}>
          <SelectItem value='admin' className={nbSelectItem}>
            ADMIN
          </SelectItem>
          <SelectItem value='noc' className={nbSelectItem}>
            NOC
          </SelectItem>
        </SelectContent>
      </Select>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className={nbDialog}>
          <div className={cn(nbDialogHeader, nbAccent.yellow)}>
            <AlertDialogHeader className='gap-2 text-left'>
              <div className='flex items-center gap-2.5'>
                <span className={nbDialogIcon}>
                  <ShieldCheck className='h-4 w-4' strokeWidth={3} aria-hidden />
                </span>
                <AlertDialogTitle className={nbDialogTitle}>Konfirmasi ubah peran</AlertDialogTitle>
              </div>
              <AlertDialogDescription className={cn(nbHint, 'text-left')}>
                Apakah Anda yakin ingin mengubah role menjadi {selectedRole.toUpperCase()}? Ini akan
                merubah hak akses akun terkait.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>

          <AlertDialogFooter className='gap-2 px-5 py-5'>
            <AlertDialogCancel className={cn(nbDialogButton, nbAccent.white)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={cn(nbDialogButton, nbAccent.yellow, 'text-[#111]')}
            >
              Ubah Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
