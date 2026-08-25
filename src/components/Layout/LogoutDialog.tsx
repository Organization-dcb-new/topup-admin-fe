import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Loader2, LogOut } from 'lucide-react'

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
import { apiLogout } from '@/lib/auth'
import { apiErrorMessage } from '@/lib/api-error'

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mutate: doLogout, isPending } = useMutation({
    mutationFn: apiLogout,
    onSuccess: () => {
      // Navigasi SPA (bukan reload) supaya toast sukses sempat terlihat.
      // Karena tidak ada reload, seluruh cache harus dibuang manual — kalau
      // tidak, data admin sebelumnya masih tersaji saat akun lain login
      // di tab yang sama.
      queryClient.clear()
      onOpenChange(false)
      navigate('/login', { replace: true })
      toast.success(t('authToasts.logoutSuccess'))
    },
    onError: (err: unknown) => {
      toast.error(apiErrorMessage(err, t('authToasts.logoutError')))
    },
  })

  return (
    <AlertDialog
      open={open}
      // Cegah dialog tertutup di tengah proses logout
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next)
      }}
    >
      <AlertDialogContent className='rounded-2xl sm:max-w-md'>
        <AlertDialogHeader className='items-center gap-3 text-center sm:items-start sm:text-left'>
          <span
            className='flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive'
            aria-hidden
          >
            <LogOut className='h-5 w-5' />
          </span>
          <div className='space-y-1.5'>
            <AlertDialogTitle>{t('sidebar.confirmLogoutTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('sidebar.confirmLogoutDescription')}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className='mt-2 gap-2 sm:gap-2'>
          <AlertDialogCancel disabled={isPending} className='rounded-xl'>
            {t('sidebar.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            className='rounded-xl bg-destructive text-white transition-all duration-200 hover:bg-destructive/90 active:scale-[0.98]'
            onClick={(e) => {
              // Dialog hanya boleh tertutup setelah request selesai
              e.preventDefault()
              doLogout()
            }}
          >
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 shrink-0 animate-spin' aria-hidden />
                {t('authToasts.loggingOut')}
              </>
            ) : (
              t('sidebar.logout')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
