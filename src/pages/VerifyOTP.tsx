import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Loader2, ShieldCheck, KeyRound } from 'lucide-react'

import { apiLogout, normalizeRecoveryCode, useAuthUser } from '@/lib/auth'
import { apiErrorMessage } from '@/lib/api-error'
import { api } from '@/api/axios'
import { AuthLayout } from '@/components/Auth/AuthLayout'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'

const OTP_SLOT_CLASS = 'h-12 w-11 rounded-lg text-lg font-semibold'

const VerifyOtpPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isMfaRequired, isAuthenticated, isLoading } = useAuthUser()
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  const queryClient = useQueryClient()

  // `replace`: mendarat di sini tanpa OTP yang tertunda selalu berarti salah
  // alamat, jadi jangan tinggalkan jejak riwayat yang memantulkan user balik
  // ke sini saat menekan Back. Sama seperti perlakuan di halaman login.
  useEffect(() => {
    if (!isLoading && !isMfaRequired) {
      navigate(isAuthenticated ? '/' : '/login', { replace: true })
    }
  }, [isMfaRequired, isAuthenticated, isLoading, navigate])

  const form = useForm({
    defaultValues: {
      code: '',
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (code: string) => {
      const endpoint = isRecoveryMode ? '/admin/recover' : '/admin/verify-otp'
      const payload = isRecoveryMode ? normalizeRecoveryCode(code) : code
      const res = await api.post(endpoint, { code: payload })
      return res.data
    },
    onSuccess: async () => {
      if (isRecoveryMode) {
        toast.success(t('verifyOtpPage.recoverySuccess'))
        // Sesi tetap ditinggalkan walau permintaan logout gagal;
        // status sebenarnya diverifikasi ulang lewat /admin/me
        await apiLogout().catch(() => {})
        queryClient.invalidateQueries({ queryKey: ['auth-me'] })
      } else {
        toast.success(t('verifyOtpPage.verifySuccess'))
        queryClient.invalidateQueries({ queryKey: ['auth-me'] })
      }
    },
    onError: (err: unknown) => {
      toast.error(apiErrorMessage(err, t('verifyOtpPage.verifyError')))
      form.reset()
    },
  })

  const onSubmit = (values: { code: string }) => {
    if (isPending) return
    mutate(values.code)
  }

  if (isLoading)
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' aria-hidden />
      </div>
    )

  // Status sesi sudah pasti dan ujungnya BUKAN halaman ini: efek di atas sedang
  // memindahkan user. Tanpa ini kerangka AuthLayout-nya tetap ter-paint satu
  // frame — kedipan yang sama seperti di halaman login.
  if (!isMfaRequired) return null

  return (
    <AuthLayout
      icon={
        isRecoveryMode ? (
          <KeyRound className='h-5 w-5' aria-hidden />
        ) : (
          <ShieldCheck className='h-5 w-5' aria-hidden />
        )
      }
      title={
        isRecoveryMode
          ? t('verifyOtpPage.recoveryTitle')
          : t('verifyOtpPage.otpTitle')
      }
      subtitle={
        isRecoveryMode
          ? t('verifyOtpPage.recoverySubtitle')
          : t('verifyOtpPage.otpSubtitle')
      }
    >
      <div className='grid gap-6'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col items-center space-y-5'
          >
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem className='flex w-full flex-col items-center'>
                  <FormLabel className='sr-only'>
                    {t('verifyOtpPage.otpLabel')}
                  </FormLabel>
                  <FormControl>
                    {isRecoveryMode ? (
                      <Input
                        {...field}
                        className='h-11 rounded-lg text-center font-mono text-base font-semibold uppercase tracking-widest'
                        placeholder={t('verifyOtpPage.recoveryPlaceholder')}
                        autoComplete='one-time-code'
                        autoFocus
                      />
                    ) : (
                      <InputOTP
                        maxLength={6}
                        disabled={isPending}
                        autoFocus
                        {...field}
                        onComplete={(value: string) => {
                          if (!isPending) mutate(value)
                        }}
                      >
                        <InputOTPGroup className='gap-2'>
                          <InputOTPSlot index={0} className={OTP_SLOT_CLASS} />
                          <InputOTPSlot index={1} className={OTP_SLOT_CLASS} />
                          <InputOTPSlot index={2} className={OTP_SLOT_CLASS} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup className='gap-2'>
                          <InputOTPSlot index={3} className={OTP_SLOT_CLASS} />
                          <InputOTPSlot index={4} className={OTP_SLOT_CLASS} />
                          <InputOTPSlot index={5} className={OTP_SLOT_CLASS} />
                        </InputOTPGroup>
                      </InputOTP>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isRecoveryMode && isPending && (
              <p
                className='flex items-center gap-2 text-sm text-muted-foreground'
                role='status'
              >
                <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                {t('verifyOtpPage.processing')}
              </p>
            )}

            {isRecoveryMode && (
              <Button
                type='submit'
                className='h-11 w-full rounded-lg text-base font-medium transition-all duration-200 active:scale-98'
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2
                      className='mr-2 h-4 w-4 shrink-0 animate-spin'
                      aria-hidden
                    />
                    {t('verifyOtpPage.processing')}
                  </>
                ) : (
                  t('verifyOtpPage.verifyRecovery')
                )}
              </Button>
            )}
          </form>
        </Form>

        <div className='flex flex-col gap-2.5 border-t border-border/60 pt-4 text-center text-sm text-muted-foreground'>
          <button
            type='button'
            onClick={() => {
              setIsRecoveryMode(!isRecoveryMode)
              form.reset()
            }}
            className='cursor-pointer font-medium text-primary transition-colors duration-200 hover:underline'
          >
            {isRecoveryMode
              ? t('verifyOtpPage.useOtp')
              : t('verifyOtpPage.useRecovery')}
          </button>

          <div>
            {t('verifyOtpPage.trouble')}{' '}
            <Button
              type='button'
              variant='link'
              className='h-auto p-0 font-medium text-primary'
              onClick={async () => {
                // Sesi tetap ditinggalkan walau permintaan logout gagal;
        // status sebenarnya diverifikasi ulang lewat /admin/me
        await apiLogout().catch(() => {})
                // Buang cache auth-me agar Login tidak membaca status
                // MFA-pending lama lalu melempar balik ke halaman ini
                queryClient.removeQueries({ queryKey: ['auth-me'] })
                navigate('/login')
              }}
            >
              {t('verifyOtpPage.backToLogin')}
            </Button>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

export default VerifyOtpPage
