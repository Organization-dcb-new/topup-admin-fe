import { useId, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, KeySquare, LifeBuoy, Loader2, ShieldCheck } from 'lucide-react'

import { api } from '@/api/axios'
import {
  AuthAlert,
  AuthPanelHeader,
  AuthSubmitButton,
  HandoffStatus,
  Reveal,
  SessionCheck,
} from '@/components/Auth/AuthPanel'
import { hudInputClass, hudInputIconClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { useCooldown } from '@/hooks/useCooldown'
import {
  clearAuthSession,
  getSafeRedirect,
  refreshAuthSession,
  useAuthUser,
  withRedirect,
} from '@/lib/auth'
import { toAuthError, type AuthError } from '@/lib/auth-error'
import { cn } from '@/lib/utils'

type Mode = 'otp' | 'recovery'
type Stage = { name: 'form' } | { name: 'submitting' } | { name: 'handoff' }

const OTP_LENGTH = 6
const RECOVERY_CODE_LENGTH = 10

/** Recovery codes are 10 uppercase letters/digits and the backend compares them case-sensitively. */
function normalizeRecoveryCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, RECOVERY_CODE_LENGTH)
}

const otpSlotClass =
  'h-12 w-9 rounded-md border border-slate-200 bg-slate-50 font-display text-xl font-semibold text-slate-900 shadow-none transition-[border-color,background-color,box-shadow] duration-200 ease-hud ' +
  'min-[380px]:w-10 sm:h-14 sm:w-12 ' +
  'data-[active=true]:border-brand-purple data-[active=true]:bg-white data-[active=true]:ring-brand-purple/15 ' +
  'aria-invalid:border-rose-400 data-[active=true]:aria-invalid:ring-rose-500/15'

const VerifyOtpPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const redirectTo = getSafeRedirect(searchParams.get('redirect'))
  const codeId = useId()
  const codeInputRef = useRef<HTMLInputElement>(null)
  const { isMfaRequired, isAuthenticated, isLoading } = useAuthUser()
  const cooldown = useCooldown()
  const [mode, setMode] = useState<Mode>('otp')
  const [modeSwitched, setModeSwitched] = useState(false)
  const [code, setCode] = useState('')
  const [stage, setStage] = useState<Stage>({ name: 'form' })
  const [error, setError] = useState<AuthError | null>(null)
  const [shaking, setShaking] = useState(false)

  const { mutate: verify } = useMutation({
    mutationFn: async (vars: { mode: Mode; code: string }) => {
      const endpoint = vars.mode === 'recovery' ? '/admin/recover' : '/admin/verify-otp'
      await api.post(endpoint, { code: vars.code })
    },
  })

  const { mutate: backToLogin, isPending: isLeaving } = useMutation({
    mutationFn: () => clearAuthSession(queryClient),
  })

  const fail = (authError: AuthError) => {
    setStage({ name: 'form' })
    setError(authError)
    setShaking(true)
    if (authError.retryAfter) cooldown.start(authError.retryAfter)
    if (mode === 'otp') setCode('')
    codeInputRef.current?.focus()
  }

  const submit = (value: string) => {
    if (stage.name !== 'form' || cooldown.active) return
    setStage({ name: 'submitting' })
    setError(null)
    verify(
      { mode, code: value },
      {
        onSuccess: async (_, vars) => {
          if (vars.mode === 'recovery') {
            // Recovery turns 2FA off server-side; the admin signs in again with just the password.
            toast.success(t('verifyOtpPage.recoverySuccess'))
            await clearAuthSession(queryClient)
            setStage({ name: 'form' })
            return
          }
          const session = await refreshAuthSession(queryClient)
          if (session.user) setStage({ name: 'handoff' })
          else fail({ key: 'authErrors.sessionNotStarted' })
        },
        onError: async (err) => {
          // A wrong code and an expired 10-minute MFA session both answer 401; only the session check tells them apart.
          if (isAxiosError(err) && err.response?.status === 401) {
            const session = await refreshAuthSession(queryClient)
            if (!session.mfa_pending) {
              toast.error(t('authErrors.sessionExpired'))
              setStage({ name: 'form' })
              return
            }
          }
          fail(toAuthError(err, 'verifyOtpPage.verifyError'))
        },
      }
    )
  }

  const switchMode = () => {
    setMode((current) => (current === 'otp' ? 'recovery' : 'otp'))
    setModeSwitched(true)
    setCode('')
    setError(null)
  }

  // Send visitors without a pending 2FA step to where they belong; our own success leaves through the handoff.
  if (stage.name === 'form' && !isLoading) {
    if (isAuthenticated) return <Navigate to={redirectTo} replace />
    if (!isMfaRequired) return <Navigate to={withRedirect('/login', redirectTo)} replace />
  }

  if (isLoading) return <SessionCheck />

  if (stage.name === 'handoff') {
    return (
      <HandoffStatus
        variant='granted'
        onDone={() => navigate(redirectTo, { replace: true, viewTransition: true })}
      />
    )
  }

  const isRecovery = mode === 'recovery'
  const submitting = stage.name === 'submitting'
  const codeComplete = code.length === (isRecovery ? RECOVERY_CODE_LENGTH : OTP_LENGTH)
  const hintId = `${codeId}-hint`

  const clearErrorAndSet = (value: string) => {
    setCode(value)
    if (error) setError(null)
  }

  return (
    <>
      <AuthPanelHeader
        eyebrow={t('verifyOtpPage.eyebrow')}
        icon={isRecovery ? LifeBuoy : ShieldCheck}
        contentKey={mode}
        title={isRecovery ? t('verifyOtpPage.recoveryTitle') : t('verifyOtpPage.otpTitle')}
        description={isRecovery ? t('verifyOtpPage.recoverySubtitle') : t('verifyOtpPage.otpSubtitle')}
      />

      <form
        noValidate
        aria-busy={submitting}
        onSubmit={(e) => {
          e.preventDefault()
          if (codeComplete) submit(code)
        }}
        className={cn('vt-panel-form space-y-5', shaking && 'animate-hud-shake')}
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) setShaking(false)
        }}
      >
        {error && (
          <AuthAlert key={error.key + (error.detail ?? '')}>
            {error.detail ?? t(error.key)}
          </AuthAlert>
        )}

        {/* Keyed by mode: rises in on first load, then slides in from the side on each switch. */}
        <div
          key={mode}
          className={cn(
            'space-y-3 animate-in fade-in duration-500 ease-hud fill-mode-both',
            !modeSwitched && 'slide-in-from-bottom-2',
            modeSwitched && (isRecovery ? 'slide-in-from-right-6' : 'slide-in-from-left-6')
          )}
          style={modeSwitched ? undefined : { animationDelay: '70ms' }}
        >
          {isRecovery ? (
            <>
              <Label htmlFor={codeId} className={hudLabelClass}>
                {t('verifyOtpPage.recoveryLabel')}
              </Label>
              <div className='group relative'>
                <span className={hudInputIconClass}>
                  <KeySquare className='size-[18px]' aria-hidden />
                </span>
                <Input
                  ref={codeInputRef}
                  id={codeId}
                  value={code}
                  onChange={(e) => clearErrorAndSet(normalizeRecoveryCode(e.target.value))}
                  autoFocus
                  autoComplete='off'
                  autoCapitalize='characters'
                  autoCorrect='off'
                  spellCheck={false}
                  placeholder={t('verifyOtpPage.recoveryPlaceholder')}
                  aria-invalid={!!error}
                  aria-describedby={hintId}
                  className={cn(hudInputClass, 'pl-11 font-mono tracking-[0.3em]')}
                />
              </div>
              <p id={hintId} className='text-xs leading-relaxed text-amber-700'>
                {t('verifyOtpPage.recoveryHint')}
              </p>
            </>
          ) : (
            <>
              <Label htmlFor={codeId} className='sr-only'>
                {t('verifyOtpPage.otpLabel')}
              </Label>
              <InputOTP
                ref={codeInputRef}
                id={codeId}
                maxLength={OTP_LENGTH}
                pattern={REGEXP_ONLY_DIGITS}
                value={code}
                onChange={clearErrorAndSet}
                onComplete={submit}
                autoFocus
                aria-invalid={!!error}
                aria-describedby={hintId}
                containerClassName='justify-center gap-2 sm:gap-3'
              >
                {[0, 3].map((start) => (
                  <InputOTPGroup key={start} className='gap-1 min-[380px]:gap-1.5 sm:gap-2'>
                    {[0, 1, 2].map((offset) => (
                      <InputOTPSlot
                        key={offset}
                        index={start + offset}
                        aria-invalid={!!error}
                        className={otpSlotClass}
                      />
                    ))}
                  </InputOTPGroup>
                ))}
              </InputOTP>
              <p id={hintId} className='text-center text-xs text-slate-500'>
                {t('verifyOtpPage.otpHint')}
              </p>
            </>
          )}
        </div>

        <Reveal order={2}>
          <AuthSubmitButton
            pending={submitting}
            pendingLabel={t('verifyOtpPage.processing')}
            cooldown={cooldown.remaining}
            disabled={!codeComplete}
          >
            {isRecovery ? t('verifyOtpPage.verifyRecovery') : t('verifyOtpPage.verify')}
          </AuthSubmitButton>
        </Reveal>
      </form>

      <Reveal order={3} className='vt-panel-note'>
        <div className='mt-6 flex flex-col items-center gap-3 border-t border-slate-100 pt-5 text-sm'>
          <button
            type='button'
            onClick={switchMode}
            disabled={submitting}
            className='rounded-sm font-medium text-brand-purple underline-offset-4 transition-colors duration-200 hover:text-brand-purple-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
          >
            {isRecovery ? t('verifyOtpPage.useOtp') : t('verifyOtpPage.useRecovery')}
          </button>
          <button
            type='button'
            onClick={() => backToLogin()}
            disabled={isLeaving || submitting}
            className='group inline-flex items-center gap-1.5 rounded-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
          >
            {isLeaving ? (
              <Loader2 className='size-3.5 animate-spin' aria-hidden />
            ) : (
              <ArrowLeft
                className='size-3.5 transition-transform duration-300 ease-hud group-hover:-translate-x-0.5'
                aria-hidden
              />
            )}
            {t('verifyOtpPage.backToLogin')}
          </button>
        </div>
      </Reveal>
    </>
  )
}

export default VerifyOtpPage
