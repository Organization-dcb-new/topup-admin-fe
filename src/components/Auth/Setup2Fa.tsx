import { useId, useRef, useState, type ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  KeyRound,
  LifeBuoy,
  Loader2,
  QrCode,
  ShieldCheck,
  ShieldOff,
  ShieldPlus,
} from 'lucide-react'

import { api } from '@/api/axios'
import brandMark from '@/assets/brand/pakargaming-mark.webp'
import {
  AuthAlert,
  AuthPanelHeader,
  AuthSubmitButton,
  HudCard,
  OtpCodeInput,
} from '@/components/Auth/AuthPanel'
import { hudLabelClass } from '@/components/Auth/hud-styles'
import { AnimatedHeight } from '@/components/ui/animated-height'
import { Checkbox } from '@/components/ui/checkbox'
import { useCooldown } from '@/hooks/useCooldown'
import { refreshAuthSession, useAuthUser } from '@/lib/auth'
import { toAuthError, type AuthError } from '@/lib/auth-error'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { cn } from '@/lib/utils'

interface SetupData {
  qr_url: string
  recovery_codes: string[]
}

type Step = 1 | 2 | 3

const STEPS = ['scan', 'backup', 'verify'] as const
const STEP_ICONS = [QrCode, KeyRound, ShieldCheck]
const OTP_LENGTH = 6

const secondaryButtonClass =
  'inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:border-brand-purple/40 hover:text-brand-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/30'

/** The setup key, for apps that can't scan; it is the `secret` of the otpauth:// URI behind the QR. */
function secretFromOtpauth(uri: string) {
  try {
    return new URL(uri).searchParams.get('secret') ?? ''
  } catch {
    return ''
  }
}

const Setup2FA = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { user } = useAuthUser()
  const enabled = user?.two_factor_enabled === true
  const cooldown = useCooldown()
  const codeId = useId()
  const hintId = `${codeId}-hint`
  const codeRef = useRef<HTMLInputElement>(null)
  const [setup, setSetup] = useState<SetupData | null>(null)
  const [step, setStep] = useState<Step>(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [savedCodes, setSavedCodes] = useState(false)
  const [disableOpen, setDisableOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState<AuthError | null>(null)
  const [shaking, setShaking] = useState(false)

  const view = enabled ? 'enabled' : setup ? 'wizard' : 'intro'

  const fail = (err: unknown, fallbackKey: string) => {
    // A 401 here is usually a wrong code, but re-checking the session lets the route guard
    // send the admin to login if it actually expired.
    if (isAxiosError(err) && err.response?.status === 401) void refreshAuthSession(queryClient)
    const authError = toAuthError(err, fallbackKey)
    setError(authError)
    setShaking(true)
    setCode('')
    if (authError.retryAfter) cooldown.start(authError.retryAfter)
    codeRef.current?.focus({ preventScroll: true })
  }

  const generate = useMutation({
    mutationFn: async () => {
      const res = await api.get<{ data: SetupData }>('/admin/setup-2fa')
      return res.data.data
    },
    onSuccess: (data) => {
      setSetup(data)
      setStep(1)
      setDirection('forward')
      setSavedCodes(false)
      setError(null)
    },
    onError: (err) => fail(err, 'twoFaPage.generateError'),
  })

  // A wrong code answers 401, which must not trigger the global "session expired" redirect.
  const activate = useMutation({
    mutationFn: (otp: string) => api.post('/admin/activate', { code: otp }, { skipAuthRedirect: true }),
    onSuccess: async () => {
      // Refresh first so the card goes straight to the enabled view instead of flashing the intro.
      await refreshAuthSession(queryClient)
      setSetup(null)
      setCode('')
      setError(null)
      toast.success(t('twoFaPage.activated'))
    },
    onError: (err) => fail(err, 'twoFaPage.verifyError'),
  })

  const deactivate = useMutation({
    mutationFn: (otp: string) => api.post('/admin/deactivate', { code: otp }, { skipAuthRedirect: true }),
    onSuccess: async () => {
      await refreshAuthSession(queryClient)
      setDisableOpen(false)
      setCode('')
      setError(null)
      toast.success(t('twoFaPage.deactivated'))
    },
    onError: (err) => fail(err, 'twoFaPage.verifyError'),
  })

  const submitCode = (value: string) => {
    if (value.length !== OTP_LENGTH || cooldown.active) return
    if (view === 'wizard' && !activate.isPending) activate.mutate(value)
    if (view === 'enabled' && !deactivate.isPending) deactivate.mutate(value)
  }

  const goTo = (next: Step) => {
    setDirection(next > step ? 'forward' : 'back')
    setStep(next)
    setError(null)
    setCode('')
  }

  const changeCode = (value: string) => {
    setCode(value)
    if (error) setError(null)
  }

  const header =
    view === 'wizard'
      ? {
          eyebrow: t('twoFaPage.setupEyebrow', { current: step, total: STEPS.length }),
          icon: STEP_ICONS[step - 1],
          title: t(`twoFaPage.${STEPS[step - 1]}Title`),
          description: t(`twoFaPage.${STEPS[step - 1]}Description`),
          key: `wizard-${step}`,
        }
      : view === 'enabled'
        ? {
            eyebrow: t('twoFaPage.eyebrow'),
            icon: ShieldCheck,
            title: t('twoFaPage.onTitle'),
            description: t('twoFaPage.onDescription'),
            key: 'enabled',
          }
        : {
            eyebrow: t('twoFaPage.eyebrow'),
            icon: ShieldPlus,
            title: t('twoFaPage.title'),
            description: t('twoFaPage.offDescription'),
            key: 'intro',
          }

  const errorAlert = error && (
    <AuthAlert key={error.key + (error.detail ?? '')}>{error.detail ?? t(error.key)}</AuthAlert>
  )

  const shakeProps = {
    className: cn('space-y-5', shaking && 'animate-hud-shake'),
    onAnimationEnd: (e: React.AnimationEvent) => {
      if (e.target === e.currentTarget) setShaking(false)
    },
  }

  const codeField = (
    <div className='space-y-3'>
      <OtpCodeInput
        id={codeId}
        inputRef={codeRef}
        value={code}
        onChange={changeCode}
        onComplete={submitCode}
        invalid={!!error}
        describedBy={hintId}
      />
      <p id={hintId} className='text-center text-xs text-slate-500'>
        {t('twoFaPage.verifyHint')}
      </p>
    </div>
  )

  return (
    <div className='mx-auto max-w-2xl py-2 sm:py-6'>
      <HudCard className='animate-in fade-in slide-in-from-bottom-4 duration-700 ease-hud'>
        <AuthPanelHeader
          eyebrow={header.eyebrow}
          icon={header.icon}
          title={header.title}
          description={header.description}
          contentKey={header.key}
        />

        <AnimatedHeight>
          <div key={view} className='animate-in fade-in duration-500 ease-hud'>
            {view === 'intro' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  generate.mutate()
                }}
                className='space-y-6'
              >
                <StatusChip on={false} />
                {errorAlert}
                <ul className='space-y-3'>
                  {(['benefit1', 'benefit2', 'benefit3'] as const).map((key) => (
                    <li key={key} className='flex items-start gap-3 text-sm leading-relaxed text-slate-600'>
                      <span className='mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-cyan/15 text-cyan-700'>
                        <Check className='size-3' strokeWidth={3} aria-hidden />
                      </span>
                      {t(`twoFaPage.${key}`)}
                    </li>
                  ))}
                </ul>
                <div className='sm:w-60'>
                  <AuthSubmitButton
                    pending={generate.isPending}
                    pendingLabel={t('twoFaPage.preparing')}
                    cooldown={cooldown.remaining}
                  >
                    {t('twoFaPage.start')}
                  </AuthSubmitButton>
                </div>
              </form>
            )}

            {view === 'wizard' && setup && (
              <div className='space-y-6'>
                <StepProgress step={step} />

                {/* Keyed by step: slides in from the side the admin is moving towards. */}
                <div
                  key={step}
                  className={cn(
                    'animate-in fade-in duration-500 ease-hud',
                    direction === 'forward' ? 'slide-in-from-right-4' : 'slide-in-from-left-4'
                  )}
                >
                  {step === 1 && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        goTo(2)
                      }}
                      className='space-y-6'
                    >
                      <div className='grid items-center gap-6 sm:grid-cols-[auto_1fr]'>
                        <div className='mx-auto rounded-xl border border-slate-200 bg-white p-3 shadow-sm'>
                          <QRCodeSVG
                            value={setup.qr_url}
                            size={168}
                            level='H'
                            marginSize={0}
                            imageSettings={{ src: brandMark, width: 28, height: 40, excavate: true }}
                          />
                        </div>
                        <ol className='space-y-3 text-sm leading-relaxed text-slate-600'>
                          {(['scanStep1', 'scanStep2', 'scanStep3'] as const).map((key, index) => (
                            <li key={key} className='flex gap-3'>
                              <span className='grid size-6 shrink-0 place-items-center rounded-md bg-brand-purple/10 font-display text-xs font-bold text-brand-purple'>
                                {index + 1}
                              </span>
                              <span className='pt-0.5'>{t(`twoFaPage.${key}`)}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <ManualKey secret={secretFromOtpauth(setup.qr_url)} />
                      <WizardFooter
                        backLabel={t('twoFaPage.cancel')}
                        onBack={() => {
                          setSetup(null)
                          setError(null)
                        }}
                      >
                        <AuthSubmitButton pending={false} pendingLabel='' cooldown={0}>
                          {t('twoFaPage.continue')}
                        </AuthSubmitButton>
                      </WizardFooter>
                    </form>
                  )}

                  {step === 2 && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (savedCodes) goTo(3)
                      }}
                      className='space-y-5'
                    >
                      <RecoveryCodes codes={setup.recovery_codes} email={user?.email} />
                      <label className='flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 p-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 has-[[data-state=checked]]:border-brand-purple/40 has-[[data-state=checked]]:bg-brand-purple/5'>
                        <Checkbox
                          checked={savedCodes}
                          onCheckedChange={(checked) => setSavedCodes(checked === true)}
                          className='mt-0.5 data-[state=checked]:border-brand-purple data-[state=checked]:bg-brand-purple'
                        />
                        {t('twoFaPage.savedConfirm')}
                      </label>
                      <WizardFooter backLabel={t('twoFaPage.back')} onBack={() => goTo(1)}>
                        <AuthSubmitButton pending={false} pendingLabel='' cooldown={0} disabled={!savedCodes}>
                          {t('twoFaPage.continue')}
                        </AuthSubmitButton>
                      </WizardFooter>
                    </form>
                  )}

                  {step === 3 && (
                    <form
                      noValidate
                      onSubmit={(e) => {
                        e.preventDefault()
                        submitCode(code)
                      }}
                      {...shakeProps}
                    >
                      {errorAlert}
                      {codeField}
                      <WizardFooter backLabel={t('twoFaPage.back')} onBack={() => goTo(2)}>
                        <AuthSubmitButton
                          pending={activate.isPending}
                          pendingLabel={t('twoFaPage.activating')}
                          cooldown={cooldown.remaining}
                          disabled={code.length !== OTP_LENGTH}
                        >
                          {t('twoFaPage.activate')}
                        </AuthSubmitButton>
                      </WizardFooter>
                    </form>
                  )}
                </div>
              </div>
            )}

            {view === 'enabled' && (
              <div className='space-y-6'>
                <StatusChip on />
                <p className='flex items-start gap-3 rounded-md bg-slate-50 px-3.5 py-3 text-sm leading-relaxed text-slate-600'>
                  <LifeBuoy className='mt-0.5 size-4 shrink-0 text-brand-purple' aria-hidden />
                  {t('twoFaPage.onTip')}
                </p>

                <div className='border-t border-slate-100 pt-5'>
                  {disableOpen ? (
                    <form
                      noValidate
                      onSubmit={(e) => {
                        e.preventDefault()
                        submitCode(code)
                      }}
                      {...shakeProps}
                      className={cn(shakeProps.className, 'animate-in fade-in slide-in-from-top-2 duration-300 ease-hud')}
                    >
                      <div className='rounded-md border border-rose-200 border-l-[3px] border-l-rose-500 bg-rose-50 px-3.5 py-3'>
                        <p className='text-sm font-semibold text-rose-800'>{t('twoFaPage.disableTitle')}</p>
                        <p className='mt-1 text-sm leading-relaxed text-rose-700'>{t('twoFaPage.disableBody')}</p>
                      </div>
                      {errorAlert}
                      {codeField}
                      <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        <button
                          type='button'
                          onClick={() => {
                            setDisableOpen(false)
                            setError(null)
                            setCode('')
                          }}
                          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900'
                        >
                          {t('twoFaPage.keepOn')}
                        </button>
                        <button
                          type='submit'
                          disabled={deactivate.isPending || cooldown.active || code.length !== OTP_LENGTH}
                          className='inline-flex h-12 w-full items-center justify-center gap-2 bg-rose-600 font-display text-sm font-bold uppercase tracking-[0.2em] text-white hud-clip-sm transition-[background-color,transform,opacity] duration-300 hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/90 active:scale-[0.985] disabled:opacity-50 sm:w-56'
                        >
                          {deactivate.isPending ? (
                            <Loader2 className='size-4 animate-spin' aria-hidden />
                          ) : (
                            <ShieldOff className='size-4' aria-hidden />
                          )}
                          {cooldown.active
                            ? t('authLayout.retryIn', { seconds: cooldown.remaining })
                            : deactivate.isPending
                              ? t('twoFaPage.disabling')
                              : t('twoFaPage.disable')}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type='button'
                      onClick={() => {
                        setDisableOpen(true)
                        setError(null)
                        setCode('')
                      }}
                      className='inline-flex items-center gap-2 rounded-md px-1 py-1 text-sm font-semibold text-rose-600 transition-colors hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30'
                    >
                      <ShieldOff className='size-4' aria-hidden />
                      {t('twoFaPage.disable')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </AnimatedHeight>
      </HudCard>
    </div>
  )
}

function StatusChip({ on }: { on: boolean }) {
  const { t } = useTranslation()
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-[0.15em] ring-1',
        on ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'
      )}
    >
      <span className={cn('size-1.5 rounded-full', on ? 'bg-emerald-500' : 'bg-amber-500')} aria-hidden />
      {on ? t('twoFaPage.statusOn') : t('twoFaPage.statusOff')}
    </span>
  )
}

function StepProgress({ step }: { step: Step }) {
  const { t } = useTranslation()
  return (
    <ol className='grid grid-cols-3 gap-2'>
      {STEPS.map((key, index) => {
        const n = index + 1
        return (
          <li key={key} aria-current={n === step ? 'step' : undefined}>
            <span className='block h-1 overflow-hidden rounded-full bg-slate-100'>
              <span
                className={cn(
                  'block h-full bg-linear-to-r from-brand-purple to-brand-cyan transition-[width] duration-500 ease-hud',
                  n <= step ? 'w-full' : 'w-0'
                )}
              />
            </span>
            <span
              className={cn(
                'mt-2 flex items-center gap-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] transition-colors duration-300',
                n === step ? 'text-brand-purple' : n < step ? 'text-slate-600' : 'text-slate-400'
              )}
            >
              {n < step && <Check className='size-3' strokeWidth={3} aria-hidden />}
              {t(`twoFaPage.steps.${key}`)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function WizardFooter({
  backLabel,
  onBack,
  children,
}: {
  backLabel: string
  onBack: () => void
  children: ReactNode
}) {
  return (
    <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
      <button
        type='button'
        onClick={onBack}
        className='inline-flex h-10 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/30'
      >
        <ArrowLeft className='size-4' aria-hidden />
        {backLabel}
      </button>
      <div className='sm:w-56'>{children}</div>
    </div>
  )
}

function ManualKey({ secret }: { secret: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  if (!secret) return null

  const copy = async () => {
    try {
      await copyTextToClipboard(secret)
    } catch {
      toast.error(t('twoFaPage.copyFailed'))
      return
    }
    setCopied(true)
    toast.success(t('twoFaPage.keyCopied'))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='space-y-2'>
      <p className={hudLabelClass}>{t('twoFaPage.manualKey')}</p>
      <div className='flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-1.5'>
        <code className='min-w-0 flex-1 break-all font-mono text-sm font-semibold tracking-[0.15em] text-slate-800'>
          {secret.match(/.{1,4}/g)?.join(' ')}
        </code>
        <button
          type='button'
          onClick={copy}
          aria-label={t('twoFaPage.copyKey')}
          className='grid size-8 shrink-0 place-items-center rounded-md text-slate-500 transition-colors hover:bg-white hover:text-brand-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/30'
        >
          {copied ? (
            <Check className='size-4 text-emerald-600' aria-hidden />
          ) : (
            <Copy className='size-4' aria-hidden />
          )}
        </button>
      </div>
    </div>
  )
}

function RecoveryCodes({ codes, email }: { codes: string[]; email?: string }) {
  const { t } = useTranslation()

  const copyAll = async () => {
    try {
      await copyTextToClipboard(codes.join('\n'))
      toast.success(t('twoFaPage.codesCopied'))
    } catch {
      toast.error(t('twoFaPage.copyFailed'))
    }
  }

  const download = () => {
    const lines = [
      t('twoFaPage.fileTitle'),
      ...(email ? [t('twoFaPage.fileAccount', { email })] : []),
      t('twoFaPage.fileGenerated', { date: new Date().toLocaleString() }),
      '',
      ...codes.map((code, index) => `${String(index + 1).padStart(2, '0')}. ${code}`),
      '',
      t('twoFaPage.fileNote'),
    ]
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'pakargaming-recovery-codes.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='space-y-3'>
      <ol className='grid grid-cols-2 gap-2'>
        {codes.map((code, index) => (
          <li
            key={code}
            className='flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2'
          >
            <span className='font-display text-[10px] font-semibold text-slate-400'>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className='font-mono text-sm font-semibold tracking-wider text-slate-800'>{code}</span>
          </li>
        ))}
      </ol>
      <div className='flex flex-wrap gap-2'>
        <button type='button' onClick={copyAll} className={secondaryButtonClass}>
          <Copy className='size-4' aria-hidden />
          {t('twoFaPage.copyCodes')}
        </button>
        <button type='button' onClick={download} className={secondaryButtonClass}>
          <Download className='size-4' aria-hidden />
          {t('twoFaPage.downloadCodes')}
        </button>
      </div>
    </div>
  )
}

export default Setup2FA
