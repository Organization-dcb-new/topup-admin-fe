import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Loader2, ShieldOff } from 'lucide-react'

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
import { OtpField } from '@/components/ui/otp-field'
import { api } from '@/api/axios'
import { apiErrorMessage } from '@/lib/api-error'

interface DeactivateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeactivateDialog({ open, onOpenChange }: DeactivateDialogProps) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  /** Kode dan galat tidak boleh tertinggal saat dialog dibuka lagi.
   *  Direset di handler, bukan di effect, agar tidak memicu render berantai. */
  const close = () => {
    setCode('')
    setError(null)
    onOpenChange(false)
  }

  const { mutate: deactivate, isPending } = useMutation({
    mutationFn: async (otp: string) => {
      const res = await api.post('/admin/deactivate', { code: otp })
      return res.data
    },
    onSuccess: () => {
      toast.success(t('setup2faPage.deactivateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['auth-me'] })
      close()
    },
    onError: (err: unknown) => {
      // Kosongkan kolom: kode TOTP yang ditolak tidak akan pernah valid lagi
      setCode('')
      setError(apiErrorMessage(err, t('setup2faPage.deactivateError')))
    },
  })

  const isComplete = code.length === 6

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return
        if (next) onOpenChange(true)
        else close()
      }}
    >
      {/* overflow-hidden: tanpa ini latar footer menembus sudut membulat kartu */}
      <AlertDialogContent className='gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-100'>
        {/* Satu poros perataan untuk seluruh isi dialog — sebelumnya header
            rata kiri, kolom OTP di tengah, dan tombol rata kanan */}
        <AlertDialogHeader className='items-center gap-4 px-6 pt-6 text-center sm:text-center'>
          <span
            className='flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive'
            aria-hidden
          >
            <ShieldOff className='h-5.5 w-5.5' />
          </span>
          <div className='space-y-1.5'>
            <AlertDialogTitle className='text-lg'>
              {t('setup2faPage.deactivateHeading')}
            </AlertDialogTitle>
            <AlertDialogDescription className='text-balance'>
              {t('setup2faPage.deactivateWarning')}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <div className='px-6 pb-6 pt-5'>
          <OtpField
            value={code}
            onChange={(next) => {
              setCode(next)
              if (error) setError(null)
            }}
            disabled={isPending}
            autoFocus
            label={t('setup2faPage.otpLabel')}
            error={error}
          />
        </div>

        {/* Aksi merusak di bawah pada mobile agar bukan yang pertama disentuh */}
        <AlertDialogFooter className='flex-col gap-2 border-t border-border bg-muted/40 px-6 py-4 sm:flex-row sm:gap-3'>
          <AlertDialogCancel
            disabled={isPending}
            className='m-0 w-full rounded-lg sm:flex-1'
          >
            {t('setup2faPage.cancelDeactivate')}
          </AlertDialogCancel>
          {/* Sengaja butuh klik eksplisit — tidak auto-submit di digit keenam */}
          <AlertDialogAction
            disabled={isPending || !isComplete}
            className='w-full rounded-lg bg-destructive text-white transition-all duration-200 hover:bg-destructive/90 active:scale-[0.99] sm:flex-1'
            onClick={(e) => {
              e.preventDefault()
              deactivate(code)
            }}
          >
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 shrink-0 animate-spin' aria-hidden />
                {t('setup2faPage.deactivating')}
              </>
            ) : (
              t('setup2faPage.deactivateButton')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
