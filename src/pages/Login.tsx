import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin, useLoginForm } from '@/hooks/useLogin'
import { useAuthUser } from '@/lib/auth'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useId, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Lock, Loader2, Eye, EyeOff, User, Languages } from 'lucide-react'

export default function LoginPage() {
  const { t, i18n } = useTranslation()
  const emailId = useId()
  const passwordId = useId()
  const form = useLoginForm()
  const queryClient = useQueryClient()
  const { mutate: loginMutate, isPending } = useLogin()
  const { isAuthenticated, isMfaRequired, isLoading } = useAuthUser()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        window.location.href = '/'
      } else if (isMfaRequired) {
        window.location.href = '/verify-otp'
      }
    }
  }, [isAuthenticated, isMfaRequired, isLoading])

  const onSubmit = (values: {
    email_or_username: string
    password: string
  }) => {
    loginMutate(values, {
      onSuccess: () => {
        toast.success(t('loginPage.loginSuccess') || 'Login berhasil')
        queryClient.invalidateQueries({ queryKey: ['auth-me'] })
      },
      onError: (err: unknown) => {
        const e = err as { response?: { data?: { message?: string } } }
        toast.error(e?.response?.data?.message || t('loginPage.loginError'))
      },
    })
  }

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'id' : 'en'
    i18n.changeLanguage(nextLang)
  }

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-primary/5 via-slate-50 to-violet-500/10 px-4 py-10'>
      {/* Light Theme Background Blobs */}
      <div className='absolute inset-0 z-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-[10%] left-[10%] h-[300px] w-[300px] rounded-full bg-violet-400/10 blur-3xl animate-pulse duration-[8000ms]' />
        <div className='absolute bottom-[10%] right-[10%] h-[350px] w-[350px] rounded-full bg-primary/5 blur-3xl animate-pulse duration-[6000ms]' />
      </div>

      {/* Radial Gradient overlay matching existing layout */}
      <div
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]'
        aria-hidden
      />

      {/* Language Switcher in top right corner */}
      <div className='absolute top-4 right-4 z-20 md:top-6 md:right-6'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={toggleLanguage}
          className='flex items-center gap-2 rounded-lg bg-white/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-xs transition-all hover:bg-white hover:text-foreground'
        >
          <Languages className='h-4 w-4 text-slate-400' />
          <span>{i18n.language === 'en' ? 'ID' : 'EN'}</span>
        </Button>
      </div>

      {/* Login Card */}
      <Card className='relative w-full max-w-md rounded-2xl border border-white/50 bg-white/70 shadow-xl shadow-gray-900/5 ring-1 ring-gray-900/5 backdrop-blur-md transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-gray-900/10'>
        <CardHeader className='space-y-4 pb-2 pt-8 text-center'>
          {/* Lock circle icon matching existing style */}
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 hover:rotate-12'>
            <Lock className='h-6 w-6' aria-hidden />
          </div>
          <div className='space-y-1.5'>
            <CardTitle className='text-2xl font-semibold tracking-tight text-foreground'>
              {t('loginPage.title')}
            </CardTitle>
            <CardDescription className='text-base text-muted-foreground'>
              {t('loginPage.subtitle')}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className='pb-8 pt-4 px-6 md:px-8'>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
            {/* Username/Email Field */}
            <div className='space-y-2'>
              <Label htmlFor={emailId} className='text-sm font-medium text-foreground'>
                {t('loginPage.emailOrUsernameLabel')}
              </Label>
              <div className='relative group'>
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground group-focus-within:text-primary transition-colors'>
                  <User className='h-4.5 w-4.5' aria-hidden />
                </div>
                <Input
                  id={emailId}
                  autoComplete='username'
                  className='h-11 rounded-lg pl-10 pr-4 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all'
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

            {/* Password Field */}
            <div className='space-y-2'>
              <Label htmlFor={passwordId} className='text-sm font-medium text-foreground'>
                {t('loginPage.passwordLabel')}
              </Label>
              <div className='relative group'>
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground group-focus-within:text-primary transition-colors'>
                  <Lock className='h-4.5 w-4.5' aria-hidden />
                </div>
                <Input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  className='h-11 rounded-lg pl-10 pr-11 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all'
                  placeholder='••••••••'
                  aria-invalid={!!form.formState.errors.password}
                  {...form.register('password')}
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-1 top-1.5 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-transparent focus-visible:ring-0'
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

            {/* Submit Button */}
            <Button
              type='submit'
              className='h-11 w-full rounded-xl text-base font-medium shadow-sm transition-all duration-200 active:scale-98 hover:opacity-95'
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
        </CardContent>
      </Card>
    </div>
  )
}
