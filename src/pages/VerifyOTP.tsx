import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Loader2, ShieldCheck } from 'lucide-react'

import { authStorage, useAuthUser } from '@/lib/auth'
import { api } from '@/api/axios'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

const VerifyOtpPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isMfaRequired, isAuthenticated, isLoading } = useAuthUser()
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isLoading && !isMfaRequired) {
      navigate(isAuthenticated ? '/' : '/login')
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
      const res = await api.post(endpoint, { code }, { withCredentials: true })
      return res.data
    },
    onSuccess: (_data) => {
      if (isRecoveryMode) {
        toast.success('Pemulihan berhasil. Silakan login kembali.')
        authStorage.clearToken()
        queryClient.invalidateQueries({ queryKey: ['auth-me'] })
      } else {
        toast.success('Verifikasi berhasil')
        queryClient.invalidateQueries({ queryKey: ['auth-me'] })
      }
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } }
      toast.error(e?.response?.data?.message || t('verifyOtpPage.verifyError'))
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
        Loading...
      </div>
    )

  return (
    <div className='relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-linear-to-br from-primary/5 via-gray-50 to-violet-500/10 px-4 py-10'>
      <div
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]'
        aria-hidden
      />
      <Card className='relative w-full max-w-md rounded-2xl border border-border/80 bg-card/95 shadow-lg shadow-gray-900/5 ring-1 ring-gray-900/5 backdrop-blur-sm'>
        <CardHeader className='space-y-4 pb-2 text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary'>
            <ShieldCheck className='h-6 w-6' aria-hidden />
          </div>
          <div className='space-y-1.5'>
            <CardTitle className='text-2xl font-semibold tracking-tight text-gray-900'>
              {isRecoveryMode
                ? t('verifyOtpPage.recoveryTitle')
                : t('verifyOtpPage.otpTitle')}
            </CardTitle>
            <CardDescription className='text-base text-muted-foreground'>
              {isRecoveryMode
                ? t('verifyOtpPage.recoverySubtitle')
                : t('verifyOtpPage.otpSubtitle')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className='grid gap-6 pb-8'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex flex-col items-center space-y-6'>
              <FormField
                control={form.control}
                name='code'
                render={({ field }: { field: any }) => (
                  <FormItem className='flex w-full flex-col items-center'>
                    <FormLabel className='sr-only'>
                      {t('verifyOtpPage.otpLabel')}
                    </FormLabel>
                    <FormControl>
                      {isRecoveryMode ? (
                        <Input
                          {...field}
                          className='h-12 rounded-lg text-center font-mono text-base font-semibold uppercase tracking-widest'
                          placeholder={t('verifyOtpPage.recoveryPlaceholder')}
                          autoComplete='one-time-code'
                          autoFocus
                        />
                      ) : (
                        <InputOTP
                          maxLength={6}
                          disabled={isPending}
                          {...field}
                          onComplete={(value: string) => {
                            if (!isPending) mutate(value)
                          }}>
                          <InputOTPGroup className='gap-2'>
                            <InputOTPSlot
                              index={0}
                              className='h-12 w-12 rounded-lg text-lg font-semibold'
                            />
                            <InputOTPSlot
                              index={1}
                              className='h-12 w-12 rounded-lg text-lg font-semibold'
                            />
                            <InputOTPSlot
                              index={2}
                              className='h-12 w-12 rounded-lg text-lg font-semibold'
                            />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup className='gap-2'>
                            <InputOTPSlot
                              index={3}
                              className='h-12 w-12 rounded-lg text-lg font-semibold'
                            />
                            <InputOTPSlot
                              index={4}
                              className='h-12 w-12 rounded-lg text-lg font-semibold'
                            />
                            <InputOTPSlot
                              index={5}
                              className='h-12 w-12 rounded-lg text-lg font-semibold'
                            />
                          </InputOTPGroup>
                        </InputOTP>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isRecoveryMode && (
                <Button
                  type='submit'
                  className='h-11 w-full rounded-xl text-base font-medium'
                  disabled={isPending}>
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

          <div className='flex flex-col gap-3 border-t border-border/60 pt-4 text-center text-sm text-muted-foreground'>
            <button
              type='button'
              onClick={() => {
                setIsRecoveryMode(!isRecoveryMode)
                form.reset()
              }}
              className='font-medium text-primary hover:underline'>
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
                onClick={() => {
                  authStorage.clearToken()
                  navigate('/login')
                }}>
                {t('verifyOtpPage.backToLogin')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VerifyOtpPage
