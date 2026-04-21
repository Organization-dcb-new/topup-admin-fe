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
import { useEffect, useId } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Lock, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { t } = useTranslation()
  const emailId = useId()
  const passwordId = useId()
  const form = useLoginForm()
  const queryClient = useQueryClient()
  const { mutate: loginMutate, isPending } = useLogin()
  const { isAuthenticated, isMfaRequired, isLoading } = useAuthUser()

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
        toast.success('Login berhasil')
        queryClient.invalidateQueries({ queryKey: ['auth-me'] })
      },
      onError: (err: unknown) => {
        const e = err as { response?: { data?: { message?: string } } }
        toast.error(e?.response?.data?.message || t('loginPage.loginError'))
      },
    })
  }

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-primary/5 via-gray-50 to-violet-500/10 px-4 py-10'>
      <div
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]'
        aria-hidden
      />
      <Card className='relative w-full max-w-md rounded-2xl border border-border/80 bg-card/95 shadow-lg shadow-gray-900/5 ring-1 ring-gray-900/5 backdrop-blur-sm'>
        <CardHeader className='space-y-4 pb-2 text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary'>
            <Lock className='h-6 w-6' aria-hidden />
          </div>
          <div className='space-y-1.5'>
            <CardTitle className='text-2xl font-semibold tracking-tight text-gray-900'>
              {t('loginPage.title')}
            </CardTitle>
            <CardDescription className='text-base text-muted-foreground'>
              {t('loginPage.subtitle')}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className='pb-8 pt-2'>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
            <div className='space-y-2'>
              <Label htmlFor={emailId} className='text-sm font-medium'>
                {t('loginPage.emailOrUsernameLabel')}
              </Label>
              <Input
                id={emailId}
                autoComplete='username'
                className='h-11 rounded-lg'
                placeholder={t('loginPage.emailOrUsernamePlaceholder')}
                aria-invalid={!!form.formState.errors.email_or_username}
                {...form.register('email_or_username')}
              />
              {form.formState.errors.email_or_username && (
                <p className='text-sm text-destructive' role='alert'>
                  {form.formState.errors.email_or_username.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor={passwordId} className='text-sm font-medium'>
                {t('loginPage.passwordLabel')}
              </Label>
              <Input
                id={passwordId}
                type='password'
                autoComplete='current-password'
                className='h-11 rounded-lg'
                placeholder='••••••••'
                aria-invalid={!!form.formState.errors.password}
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className='text-sm text-destructive' role='alert'>
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type='submit'
              className='h-11 w-full rounded-xl text-base font-medium'
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
