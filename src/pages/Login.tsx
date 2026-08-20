import { useId, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import {
  Lock,
  Loader2,
  Eye,
  EyeOff,
  User,
  Languages,
  ArrowRight,
  TriangleAlert,
} from 'lucide-react'

import { AuthLoadingScreen } from '@/components/Auth/AuthLoadingScreen'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useLogin, useLoginForm } from '@/hooks/useLogin'
import { resolveApiError } from '@/lib/api-error'
import { AUTH_QUERY_KEY, useAuthUser } from '@/lib/auth'
import { queryClient } from '@/lib/query-client'
import { cn } from '@/lib/utils'

const ERROR_BOX_CLASS =
  'nb-frame flex items-center gap-1.5 bg-[#ffe0db] px-2 py-1 text-xs font-black uppercase text-[#8f1d10]'

export default function LoginPage() {
  const { t, i18n } = useTranslation('common')
  const emailId = useId()
  const passwordId = useId()
  const emailErrorId = useId()
  const passwordErrorId = useId()
  const capsHintId = useId()
  const form = useLoginForm()
  const location = useLocation()
  const { mutate: loginMutate, isPending, isSuccess } = useLogin()
  const { isAuthenticated, isMfaRequired, isLoading } = useAuthUser()
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)

  useDocumentTitle(t('loginPage.tabTitle'))

  /** Halaman yang tadinya dituju sebelum RoleGuard melempar ke sini. */
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  /**
   * Digate saat render, bukan lewat useEffect. Versi sebelumnya merender form
   * penuh dulu lalu memanggil window.location.href, sehingga kartu login selalu
   * berkedip sekejap sebelum halaman dimuat ulang seluruhnya.
   */
  if (isLoading) return <AuthLoadingScreen />
  if (isAuthenticated) return <Navigate to={from} replace />
  if (isMfaRequired) return <Navigate to='/verify-otp' replace state={{ from }} />

  const onSubmit = (values: {
    email_or_username: string
    password: string
  }) => {
    loginMutate(values, {
      onSuccess: async () => {
        toast.success(t('loginPage.loginSuccess'))
        /**
         * Tidak menavigasi manual: setelah cache segar, gate render di atas
         * yang memilih tujuan. Navigasi manual ke `from` akan salah untuk akun
         * ber-2FA karena mereka harus mampir ke /verify-otp dulu.
         */
        await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
      },
      onError: (err: unknown) => {
        toast.error(resolveApiError(err, t, 'loginPage.loginError'))
      },
    })
  }

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'id' : 'en'
    i18n.changeLanguage(nextLang)
  }

  const trackCapsLock = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(event.getModifierState('CapsLock'))
  }

  /** register() sudah menyediakan onBlur-nya sendiri, jadi harus dikomposisikan. */
  const passwordField = form.register('password')
  const errors = form.formState.errors
  /** Tetap terkunci sampai perpindahan halaman terjadi, supaya tidak terkirim dua kali. */
  const isBusy = isPending || isSuccess

  return (
    <div className='nb nb-surface relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12'>
      {/* Bentuk dekoratif */}
      <div className='pointer-events-none absolute inset-0 hidden md:block' aria-hidden>
        <div className='nb-frame nb-sd absolute left-[8%] top-[15%] h-24 w-24 rotate-12 bg-[#ff9ed2]' />
        <div className='nb-frame nb-round nb-sd absolute bottom-[18%] left-[14%] h-16 w-16 bg-[#6fe3f5]' />
        <div className='nb-frame nb-sd absolute bottom-[12%] right-[10%] h-28 w-28 -rotate-12 bg-[#c9f24d]' />
        <div className='nb-frame nb-sd-sm absolute right-[16%] top-[22%] h-12 w-12 rotate-45 bg-[#ff9d3d]' />
      </div>

      {/* Ganti bahasa */}
      <div className='absolute right-4 top-4 z-20 md:right-6 md:top-6'>
        <button
          type='button'
          onClick={toggleLanguage}
          aria-label={t('authShared.switchLanguage')}
          className='nb-frame nb-sd-sm nb-press flex items-center gap-2 bg-[#ff9ed2] px-3 py-2 text-xs font-black uppercase tracking-[0.2em]'
        >
          <Languages className='h-4 w-4' strokeWidth={2.5} aria-hidden />
          <span aria-hidden>{i18n.language === 'en' ? 'ID' : 'EN'}</span>
        </button>
      </div>

      {/* Kartu login */}
      <div className='relative z-10 w-full max-w-md duration-300 animate-in fade-in slide-in-from-bottom-3'>
        <span className='nb-frame nb-sd-sm absolute -top-2 left-5 z-20 -rotate-2 bg-[#c9f24d] px-3 py-1 text-xs font-black uppercase tracking-[0.25em]'>
          Admin
        </span>

        <div className='nb-frame nb-frame-thick nb-sd-lg mt-3 bg-white'>
          {/* Strip warna */}
          <div className='flex h-3 w-full border-b-4 border-[#111]' aria-hidden>
            <div className='flex-1 bg-[#c9f24d]' />
            <div className='flex-1 border-l-4 border-[#111] bg-[#6fe3f5]' />
            <div className='flex-1 border-l-4 border-[#111] bg-[#ff9ed2]' />
            <div className='flex-1 border-l-4 border-[#111] bg-[#ff9d3d]' />
          </div>

          <div className='px-5 py-7 sm:px-8 sm:py-9'>
            {/* Judul */}
            <div className='mb-8 flex items-start gap-4'>
              <div className='nb-frame nb-sd-sm flex h-14 w-14 shrink-0 -rotate-3 items-center justify-center bg-[#6fe3f5]'>
                <Lock className='h-7 w-7' strokeWidth={2.5} aria-hidden />
              </div>
              <div className='min-w-0'>
                <h1 className='text-2xl font-black uppercase leading-[1.05] tracking-tight sm:text-3xl'>
                  {t('loginPage.title')}
                </h1>
                <p className='mt-2 inline-block bg-[#ffd84d] px-1.5 py-0.5 text-sm font-bold'>
                  {t('loginPage.subtitle')}
                </p>
              </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Email / username */}
              <div className='space-y-2'>
                <label
                  htmlFor={emailId}
                  className='block text-xs font-black uppercase tracking-[0.18em]'
                >
                  {t('loginPage.emailOrUsernameLabel')}
                </label>
                <div
                  className={cn(
                    'nb-field nb-frame nb-sd-sm flex bg-white',
                    errors.email_or_username && 'nb-invalid'
                  )}
                >
                  <div className='flex w-12 shrink-0 items-center justify-center border-r-[3px] border-[#111] bg-[#ff9ed2]'>
                    <User className='h-5 w-5' strokeWidth={2.5} aria-hidden />
                  </div>
                  <input
                    id={emailId}
                    autoComplete='username'
                    className='h-12 w-full min-w-0 bg-transparent px-3 text-base font-semibold outline-none placeholder:font-medium placeholder:text-[#5f5f5f]'
                    placeholder={t('loginPage.emailOrUsernamePlaceholder')}
                    aria-invalid={!!errors.email_or_username}
                    aria-describedby={
                      errors.email_or_username ? emailErrorId : undefined
                    }
                    {...form.register('email_or_username')}
                  />
                </div>
                {errors.email_or_username && (
                  <p id={emailErrorId} className={ERROR_BOX_CLASS} role='alert'>
                    <TriangleAlert className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
                    {errors.email_or_username.message}
                  </p>
                )}
              </div>

              {/* Kata sandi */}
              <div className='space-y-2'>
                <label
                  htmlFor={passwordId}
                  className='block text-xs font-black uppercase tracking-[0.18em]'
                >
                  {t('loginPage.passwordLabel')}
                </label>
                <div
                  className={cn(
                    'nb-field nb-frame nb-sd-sm flex bg-white',
                    errors.password && 'nb-invalid'
                  )}
                >
                  <div className='flex w-12 shrink-0 items-center justify-center border-r-[3px] border-[#111] bg-[#6fe3f5]'>
                    <Lock className='h-5 w-5' strokeWidth={2.5} aria-hidden />
                  </div>
                  <input
                    id={passwordId}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='current-password'
                    className='h-12 w-full min-w-0 bg-transparent px-3 text-base font-semibold outline-none placeholder:font-medium placeholder:text-[#5f5f5f]'
                    placeholder='••••••••'
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      cn(
                        errors.password ? passwordErrorId : '',
                        capsLockOn ? capsHintId : ''
                      ).trim() || undefined
                    }
                    {...passwordField}
                    onKeyUp={trackCapsLock}
                    onKeyDown={trackCapsLock}
                    onBlur={(event) => {
                      setCapsLockOn(false)
                      void passwordField.onBlur(event)
                    }}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? t('loginPage.hidePassword')
                        : t('loginPage.showPassword')
                    }
                    aria-pressed={showPassword}
                    className='nb-focus flex w-12 shrink-0 items-center justify-center border-l-[3px] border-[#111] bg-[#ffd84d] transition-colors hover:bg-[#ff9d3d]'
                  >
                    {showPassword ? (
                      <EyeOff className='h-5 w-5' strokeWidth={2.5} aria-hidden />
                    ) : (
                      <Eye className='h-5 w-5' strokeWidth={2.5} aria-hidden />
                    )}
                  </button>
                </div>
                {capsLockOn && (
                  <p
                    id={capsHintId}
                    className='nb-frame flex items-center gap-1.5 bg-[#ffd84d] px-2 py-1 text-xs font-black uppercase'
                  >
                    <TriangleAlert className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
                    {t('loginPage.capsLockOn')}
                  </p>
                )}
                {errors.password && (
                  <p id={passwordErrorId} className={ERROR_BOX_CLASS} role='alert'>
                    <TriangleAlert className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type='submit'
                disabled={isBusy}
                className='nb-frame nb-sd nb-press flex h-14 w-full items-center justify-center gap-2 bg-[#c9f24d] text-base font-black uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg'
              >
                {isBusy ? (
                  <>
                    <Loader2 className='h-5 w-5 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                    {t('loginPage.processing')}
                  </>
                ) : (
                  <>
                    {t('loginPage.submit')}
                    <ArrowRight className='h-5 w-5 shrink-0' strokeWidth={3} aria-hidden />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
