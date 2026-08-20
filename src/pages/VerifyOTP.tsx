import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Loader2, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react'

import { authStorage, useAuthUser } from '@/lib/auth'
import { api } from '@/api/axios'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

const OTP_SLOT_CLASS =
  'nb-otp nb-frame nb-sd-sm h-12 w-10 bg-white text-xl font-black text-[#111] sm:h-14 sm:w-12 sm:text-2xl'

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
    onSuccess: async () => {
      if (isRecoveryMode) {
        toast.success(t('verifyOtpPage.recoverySuccess'))
        await authStorage.clearToken()
        queryClient.invalidateQueries({ queryKey: ['auth-me'] })
      } else {
        toast.success(t('verifyOtpPage.verifySuccess'))
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
      <div className='nb nb-surface flex min-h-screen items-center justify-center px-4'>
        <div className='nb-frame nb-frame-thick nb-sd-lg flex items-center gap-3 bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.2em]'>
          <Loader2 className='h-5 w-5 animate-spin' strokeWidth={3} aria-hidden />
          {t('verifyOtpPage.processing')}
        </div>
      </div>
    )

  return (
    <div className='nb nb-surface relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-12'>
      {/* Bentuk dekoratif */}
      <div className='pointer-events-none absolute inset-0 hidden md:block' aria-hidden>
        <div className='nb-frame nb-sd absolute left-[10%] top-[18%] h-20 w-20 -rotate-12 bg-[#6fe3f5]' />
        <div className='nb-frame nb-round nb-sd absolute bottom-[20%] right-[12%] h-20 w-20 bg-[#ffd84d]' />
        <div className='nb-frame nb-sd-sm absolute bottom-[16%] left-[16%] h-12 w-12 rotate-45 bg-[#ff9ed2]' />
      </div>

      <div className='relative z-10 w-full max-w-md'>
        <span className='nb-frame nb-sd-sm absolute -top-2 left-5 z-20 -rotate-2 bg-[#ff9d3d] px-3 py-1 text-xs font-black uppercase tracking-[0.25em]'>
          {isRecoveryMode ? 'Recovery' : '2FA'}
        </span>

        <div className='nb-frame nb-frame-thick nb-sd-lg mt-3 bg-white'>
          {/* Strip warna */}
          <div className='flex h-3 w-full border-b-4 border-[#111]' aria-hidden>
            <div className='flex-1 bg-[#ff9d3d]' />
            <div className='flex-1 border-l-4 border-[#111] bg-[#ffd84d]' />
            <div className='flex-1 border-l-4 border-[#111] bg-[#c9f24d]' />
            <div className='flex-1 border-l-4 border-[#111] bg-[#6fe3f5]' />
          </div>

          <div className='px-5 py-7 sm:px-8 sm:py-9'>
            {/* Judul */}
            <div className='mb-8 flex items-start gap-4'>
              <div className='nb-frame nb-sd-sm flex h-14 w-14 shrink-0 -rotate-3 items-center justify-center bg-[#c9f24d]'>
                {isRecoveryMode ? (
                  <KeyRound className='h-7 w-7' strokeWidth={2.5} aria-hidden />
                ) : (
                  <ShieldCheck className='h-7 w-7' strokeWidth={2.5} aria-hidden />
                )}
              </div>
              <div className='min-w-0'>
                <h1 className='text-2xl font-black uppercase leading-[1.05] tracking-tight sm:text-3xl'>
                  {isRecoveryMode
                    ? t('verifyOtpPage.recoveryTitle')
                    : t('verifyOtpPage.otpTitle')}
                </h1>
                <p className='mt-2 text-sm font-bold text-[#111]/70'>
                  {isRecoveryMode
                    ? t('verifyOtpPage.recoverySubtitle')
                    : t('verifyOtpPage.otpSubtitle')}
                </p>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='flex flex-col items-center space-y-6'>
                <FormField
                  control={form.control}
                  name='code'
                  render={({ field }) => (
                    <FormItem className='flex w-full flex-col items-center gap-3'>
                      <FormLabel className='sr-only'>
                        {t('verifyOtpPage.otpLabel')}
                      </FormLabel>
                      {isRecoveryMode ? (
                        <div className='nb-field nb-frame nb-sd-sm flex w-full bg-white'>
                          <div className='flex w-12 shrink-0 items-center justify-center border-r-[3px] border-[#111] bg-[#ffd84d]'>
                            <KeyRound className='h-5 w-5' strokeWidth={2.5} aria-hidden />
                          </div>
                          <FormControl>
                            <input
                              {...field}
                              className='h-12 w-full min-w-0 bg-transparent px-3 text-center font-mono text-base font-black uppercase tracking-[0.2em] outline-none placeholder:font-bold placeholder:tracking-[0.1em] placeholder:text-[#111]/40'
                              placeholder={t('verifyOtpPage.recoveryPlaceholder')}
                              autoComplete='one-time-code'
                              autoFocus
                            />
                          </FormControl>
                        </div>
                      ) : (
                        // Bungkus scroll: slot + hard shadow tetap utuh di layar sempit
                        <div className='w-full overflow-x-auto py-2'>
                          <FormControl>
                            <InputOTP
                              maxLength={6}
                              disabled={isPending}
                              containerClassName='mx-auto w-max'
                              {...field}
                              onComplete={(value: string) => {
                                if (!isPending) mutate(value)
                              }}>
                              <InputOTPGroup className='gap-1.5 sm:gap-2'>
                                <InputOTPSlot index={0} className={OTP_SLOT_CLASS} />
                                <InputOTPSlot index={1} className={OTP_SLOT_CLASS} />
                                <InputOTPSlot index={2} className={OTP_SLOT_CLASS} />
                              </InputOTPGroup>
                              <div className='mx-1 h-1.5 w-4 shrink-0 bg-[#111] sm:mx-2 sm:w-5' aria-hidden />
                              <InputOTPGroup className='gap-1.5 sm:gap-2'>
                                <InputOTPSlot index={3} className={OTP_SLOT_CLASS} />
                                <InputOTPSlot index={4} className={OTP_SLOT_CLASS} />
                                <InputOTPSlot index={5} className={OTP_SLOT_CLASS} />
                              </InputOTPGroup>
                            </InputOTP>
                          </FormControl>
                        </div>
                      )}
                      <FormMessage className='nb-frame bg-[#ff4d3d] px-2 py-1 text-xs font-black uppercase text-white' />
                    </FormItem>
                  )}
                />

                {isRecoveryMode && (
                  <button
                    type='submit'
                    disabled={isPending}
                    className='nb-frame nb-sd nb-press flex h-14 w-full items-center justify-center gap-2 bg-[#c9f24d] text-base font-black uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-60'>
                    {isPending ? (
                      <>
                        <Loader2 className='h-5 w-5 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                        {t('verifyOtpPage.processing')}
                      </>
                    ) : (
                      <>
                        {t('verifyOtpPage.verifyRecovery')}
                        <ArrowRight className='h-5 w-5 shrink-0' strokeWidth={3} aria-hidden />
                      </>
                    )}
                  </button>
                )}

                {!isRecoveryMode && isPending && (
                  <p className='flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]'>
                    <Loader2 className='h-4 w-4 animate-spin' strokeWidth={3} aria-hidden />
                    {t('verifyOtpPage.processing')}
                  </p>
                )}
              </form>
            </Form>

            {/* Aksi lain */}
            <div className='mt-8 flex flex-col items-center gap-4 border-t-[3px] border-dashed border-[#111] pt-6'>
              <button
                type='button'
                onClick={() => {
                  setIsRecoveryMode(!isRecoveryMode)
                  form.reset()
                }}
                className='nb-frame nb-sd-sm nb-press bg-[#6fe3f5] px-4 py-2 text-xs font-black uppercase tracking-[0.15em]'>
                {isRecoveryMode
                  ? t('verifyOtpPage.useOtp')
                  : t('verifyOtpPage.useRecovery')}
              </button>

              <p className='text-center text-xs font-bold uppercase tracking-wide text-[#111]/60'>
                {t('verifyOtpPage.trouble')}{' '}
                <button
                  type='button'
                  onClick={async () => {
                    await authStorage.clearToken()
                    navigate('/login')
                  }}
                  className='underline decoration-[3px] underline-offset-4 hover:bg-[#ffd84d] hover:text-[#111]'>
                  {t('verifyOtpPage.backToLogin')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyOtpPage
