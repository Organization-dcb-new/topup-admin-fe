import { useId, useState, type KeyboardEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, KeyRound, LogIn, User } from 'lucide-react'

import {
  AuthAlert,
  AuthPanelHeader,
  AuthSubmitButton,
  FieldMessage,
  HandoffStatus,
  Reveal,
  SessionCheck,
} from '@/components/Auth/AuthPanel'
import { hudInputClass, hudInputIconClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCooldown } from '@/hooks/useCooldown'
import { useLogin, useLoginForm } from '@/hooks/useLogin'
import { getSafeRedirect, useAuthUser, withRedirect } from '@/lib/auth'
import { toAuthError, type AuthError } from '@/lib/auth-error'
import { cn } from '@/lib/utils'
import type { LoginFormValues } from '@/schemas/login'

type Stage =
  | { name: 'form' }
  | { name: 'submitting' }
  | { name: 'handoff'; to: string; mfa: boolean }

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = getSafeRedirect(searchParams.get('redirect'))
  const identifierId = useId()
  const passwordId = useId()
  const { isAuthenticated, isMfaRequired, isLoading } = useAuthUser()
  const form = useLoginForm()
  const { mutate: login } = useLogin()
  const cooldown = useCooldown()
  const [stage, setStage] = useState<Stage>({ name: 'form' })
  const [serverError, setServerError] = useState<AuthError | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [shaking, setShaking] = useState(false)

  const fail = (error: AuthError) => {
    setStage({ name: 'form' })
    setServerError(error)
    setShaking(true)
    if (error.retryAfter) cooldown.start(error.retryAfter)
    if (error.key === 'authErrors.invalidCredentials') {
      form.resetField('password')
      form.setFocus('password')
    }
  }

  const onSubmit = (values: LoginFormValues) => {
    setStage({ name: 'submitting' })
    setServerError(null)
    login(values, {
      onSuccess: (session) => {
        if (session.user) {
          setStage({ name: 'handoff', to: redirectTo, mfa: false })
        } else if (session.mfa_pending) {
          setStage({ name: 'handoff', to: withRedirect('/verify-otp', redirectTo), mfa: true })
        } else {
          fail({ key: 'authErrors.sessionNotStarted' })
        }
      },
      onError: (err) => fail(toAuthError(err, 'loginPage.loginError')),
    })
  }

  // Visitors who already have a session skip the form; our own login leaves through the handoff.
  if (stage.name === 'form') {
    if (isAuthenticated) return <Navigate to={redirectTo} replace />
    if (isMfaRequired) return <Navigate to={withRedirect('/verify-otp', redirectTo)} replace />
  }

  if (isLoading) return <SessionCheck />

  if (stage.name === 'handoff') {
    return (
      <HandoffStatus
        variant={stage.mfa ? 'mfa' : 'granted'}
        // The dashboard has its own shell, so crossfade into it; the OTP step reuses this one.
        onDone={() => navigate(stage.to, { replace: true, viewTransition: !stage.mfa })}
      />
    )
  }

  const { errors } = form.formState
  const submitting = stage.name === 'submitting'
  const clearServerError = () => setServerError(null)
  const syncCapsLock = (e: KeyboardEvent) => setCapsLock(e.getModifierState('CapsLock'))
  const identifierErrorId = `${identifierId}-error`
  const passwordErrorId = `${passwordId}-error`
  const capsLockId = `${passwordId}-caps`

  return (
    <>
      <AuthPanelHeader
        eyebrow={t('loginPage.eyebrow')}
        icon={LogIn}
        title={t('loginPage.title')}
        description={t('loginPage.subtitle')}
      />

      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        aria-busy={submitting}
        className={cn('vt-panel-form space-y-5', shaking && 'animate-hud-shake')}
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) setShaking(false)
        }}
      >
        {serverError && (
          <AuthAlert key={serverError.key + (serverError.detail ?? '')}>
            {serverError.detail ?? t(serverError.key)}
          </AuthAlert>
        )}

        <Reveal order={1} className='space-y-2'>
          <Label htmlFor={identifierId} className={hudLabelClass}>
            {t('loginPage.emailOrUsernameLabel')}
          </Label>
          <div className='group relative'>
            <span className={hudInputIconClass}>
              <User className='size-[18px]' aria-hidden />
            </span>
            <Input
              id={identifierId}
              autoComplete='username'
              autoCapitalize='none'
              autoCorrect='off'
              spellCheck={false}
              autoFocus
              placeholder={t('loginPage.emailOrUsernamePlaceholder')}
              aria-invalid={!!errors.email_or_username}
              aria-describedby={errors.email_or_username ? identifierErrorId : undefined}
              className={cn(hudInputClass, 'pl-11')}
              {...form.register('email_or_username', { onChange: clearServerError })}
            />
          </div>
          {errors.email_or_username?.message && (
            <FieldMessage id={identifierErrorId} tone='error'>
              {t(errors.email_or_username.message)}
            </FieldMessage>
          )}
        </Reveal>

        <Reveal order={2} className='space-y-2'>
          <Label htmlFor={passwordId} className={hudLabelClass}>
            {t('loginPage.passwordLabel')}
          </Label>
          <div className='group relative'>
            <span className={hudInputIconClass}>
              <KeyRound className='size-[18px]' aria-hidden />
            </span>
            <Input
              id={passwordId}
              type={showPassword ? 'text' : 'password'}
              autoComplete='current-password'
              placeholder={t('loginPage.passwordPlaceholder')}
              aria-invalid={!!errors.password}
              aria-describedby={
                [errors.password && passwordErrorId, capsLock && capsLockId]
                  .filter(Boolean)
                  .join(' ') || undefined
              }
              className={cn(hudInputClass, 'pl-11 pr-12')}
              onKeyDown={syncCapsLock}
              onKeyUp={syncCapsLock}
              {...form.register('password', {
                onChange: clearServerError,
                onBlur: () => setCapsLock(false),
              })}
            />
            <button
              type='button'
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? t('loginPage.hidePassword') : t('loginPage.showPassword')}
              aria-pressed={showPassword}
              aria-controls={passwordId}
              className='absolute inset-y-1 right-1 grid w-10 place-items-center rounded text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700 focus-visible:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'
            >
              <span key={String(showPassword)} className='animate-in fade-in zoom-in-75 duration-300 ease-hud'>
                {showPassword ? (
                  <EyeOff className='size-[18px]' aria-hidden />
                ) : (
                  <Eye className='size-[18px]' aria-hidden />
                )}
              </span>
            </button>
          </div>
          {errors.password?.message && (
            <FieldMessage id={passwordErrorId} tone='error'>
              {t(errors.password.message)}
            </FieldMessage>
          )}
          {capsLock && (
            <FieldMessage id={capsLockId} tone='warning'>
              {t('loginPage.capsLockOn')}
            </FieldMessage>
          )}
        </Reveal>

        <Reveal order={3} className='pt-1'>
          <AuthSubmitButton
            pending={submitting}
            pendingLabel={t('loginPage.processing')}
            cooldown={cooldown.remaining}
          >
            {t('loginPage.submit')}
          </AuthSubmitButton>
        </Reveal>
      </form>

      <Reveal order={4} className='vt-panel-note'>
        <p className='mt-6 text-center text-xs leading-relaxed text-slate-500'>
          {t('loginPage.help')}
        </p>
      </Reveal>
    </>
  )
}
