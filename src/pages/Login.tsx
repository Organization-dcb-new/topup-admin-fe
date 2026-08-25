import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/Auth/AuthLayout'
import { useLogin, useLoginForm } from '@/hooks/useLogin'
import { useAuthUser } from '@/lib/auth'
import { apiErrorMessage } from '@/lib/api-error'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useId, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Loader2, Eye, EyeOff, User } from 'lucide-react'

export default function LoginPage() {
  const { t } = useTranslation()
  const emailId = useId()
  const passwordId = useId()
  const form = useLoginForm()
  const queryClient = useQueryClient()
  const { mutate: loginMutate, isPending } = useLogin()
  const { isAuthenticated, isMfaRequired, isLoading } = useAuthUser()
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  // Ref agar toast tidak dobel saat effect jalan dua kali di StrictMode (dev)
  const sessionExpiredNotified = useRef(false)
  // Toast hasil login baru ditampilkan setelah /admin/me menjawab, karena
  // respons login sendiri tidak memberi tahu apakah OTP masih diperlukan
  const justLoggedIn = useRef(false)

  useEffect(() => {
    const reason = searchParams.get('session')
    if ((reason === 'expired' || reason === 'idle') && !sessionExpiredNotified.current) {
      sessionExpiredNotified.current = true
      toast.error(
        reason === 'idle'
          ? t('loginPage.sessionIdle')
          : t('loginPage.sessionExpired'),
      )
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, t])

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (justLoggedIn.current) {
          justLoggedIn.current = false
          toast.success(t('loginPage.loginSuccess'))
        }
        navigate('/', { replace: true })
      } else if (isMfaRequired) {
        if (justLoggedIn.current) {
          justLoggedIn.current = false
          toast(t('loginPage.otpRequired'))
        }
        navigate('/verify-otp', { replace: true })
      }
    }
  }, [isAuthenticated, isMfaRequired, isLoading, navigate, t])

  const onSubmit = (values: {
    email_or_username: string
    password: string
  }) => {
    loginMutate(values, {
      onSuccess: () => {
        justLoggedIn.current = true
        queryClient.invalidateQueries({ queryKey: ['auth-me'] })
      },
      onError: (err: unknown) => {
        toast.error(apiErrorMessage(err, t('loginPage.loginError')))
      },
    })
  }

  return (
    <AuthLayout
      icon={<Lock className='h-5 w-5' aria-hidden />}
      title={t('loginPage.welcomeTitle')}
      subtitle={t('loginPage.subtitle')}
    >
      <form
        onSubmit={(e) => form.handleSubmit(onSubmit)(e)}
        className='space-y-5'
      >
        <div className='space-y-2'>
          <Label htmlFor={emailId}>{t('loginPage.emailOrUsernameLabel')}</Label>
          <div className='group relative'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground transition-colors group-focus-within:text-primary'>
              <User className='h-4.5 w-4.5' aria-hidden />
            </div>
            <Input
              id={emailId}
              autoComplete='username'
              className='h-11 rounded-lg pl-10'
              placeholder={t('loginPage.emailOrUsernamePlaceholder')}
              aria-invalid={!!form.formState.errors.email_or_username}
              {...form.register('email_or_username')}
            />
          </div>
          {form.formState.errors.email_or_username && (
            <p className='text-sm text-destructive' role='alert'>
              {form.formState.errors.email_or_username.message}
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor={passwordId}>{t('loginPage.passwordLabel')}</Label>
          <div className='group relative'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground transition-colors group-focus-within:text-primary'>
              <Lock className='h-4.5 w-4.5' aria-hidden />
            </div>
            <Input
              id={passwordId}
              type={showPassword ? 'text' : 'password'}
              autoComplete='current-password'
              className='h-11 rounded-lg pl-10 pr-11'
              placeholder='••••••••'
              aria-invalid={!!form.formState.errors.password}
              {...form.register('password')}
            />
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword
                  ? t('loginPage.hidePassword')
                  : t('loginPage.showPassword')
              }
              className='absolute right-1 top-1.5 h-8 w-8 text-muted-foreground hover:bg-transparent hover:text-foreground focus-visible:ring-0'
            >
              {showPassword ? (
                <EyeOff className='h-4.5 w-4.5' aria-hidden />
              ) : (
                <Eye className='h-4.5 w-4.5' aria-hidden />
              )}
            </Button>
          </div>
          {form.formState.errors.password && (
            <p className='text-sm text-destructive' role='alert'>
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button
          type='submit'
          className='h-11 w-full rounded-lg text-base font-medium transition-all duration-200 active:scale-98'
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 shrink-0 animate-spin' aria-hidden />
              {t('loginPage.processing')}
            </>
          ) : (
            t('loginPage.submit')
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}
