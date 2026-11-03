import { useEffect, useEffectEvent, type ReactNode, type Ref } from 'react'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  ArrowBigUpDash,
  ArrowRight,
  CircleAlert,
  Loader2,
  Timer,
  type LucideIcon,
} from 'lucide-react'

import brandMark from '@/assets/brand/pakargaming-mark.webp'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { cn } from '@/lib/utils'
import { hudOtpSlotClass } from './hud-styles'

/** How long the handoff screen plays before navigating away, per variant. */
const HANDOFF_MS = { granted: 1000, mfa: 750 }

interface HudCardProps {
  className?: string
  bodyClassName?: string
  children: ReactNode
}

/** White notched card with a hairline border, a brand-colour top bar and HUD corner brackets. */
export function HudCard({ className, bodyClassName, children }: HudCardProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <span className='absolute -left-2 -top-2 size-6 border-l-[3px] border-t-[3px] border-brand-purple' aria-hidden />
      <span className='absolute -bottom-2 -right-2 size-6 border-b-[3px] border-r-[3px] border-brand-cyan' aria-hidden />

      {/* drop-shadow instead of box-shadow: clip-path would cut a box-shadow off. */}
      <div className='drop-shadow-[0_24px_40px_rgba(74,20,140,0.13)]'>
        <div className='bg-slate-200/80 p-px hud-clip'>
          <div className='bg-white hud-clip'>
            <div className='relative h-1 overflow-hidden bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden>
              <span className='absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/80 to-transparent animate-hud-trace' />
            </div>
            <div className={cn('px-5 py-7 sm:px-8 sm:py-9', bodyClassName)}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface AuthPanelHeaderProps {
  eyebrow: string
  icon: LucideIcon
  title: ReactNode
  description: ReactNode
  /** Changing this replays the title animation, e.g. when switching between OTP and recovery. */
  contentKey?: string
}

export function AuthPanelHeader({
  eyebrow,
  icon: Icon,
  title,
  description,
  contentKey,
}: AuthPanelHeaderProps) {
  return (
    <header className='vt-panel-header mb-7'>
      <div className='mb-5 flex items-center justify-between'>
        <span className='font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-purple'>
          {eyebrow}
        </span>
        <span className='flex gap-1' aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className='h-1 w-4 bg-brand-cyan animate-hud-signal'
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </span>
      </div>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <Icon key={contentKey} className='size-5 animate-in fade-in zoom-in-50 duration-500 ease-hud' aria-hidden />
        </span>
        <div
          key={contentKey}
          className='min-w-0 space-y-1 animate-in fade-in slide-in-from-left-2 duration-500 ease-hud'
        >
          <h1 className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-[1.7rem]'>
            {title}
          </h1>
          <p className='text-sm leading-relaxed text-slate-500'>{description}</p>
        </div>
      </div>
    </header>
  )
}

interface RevealProps {
  /** Position in the entrance sequence; each step starts 70ms after the previous one. */
  order: number
  className?: string
  children: ReactNode
}

/** Staggered entrance for form rows. The delay is inline so it doesn't also delay hover transitions. */
export function Reveal({ order, className, children }: RevealProps) {
  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both',
        className
      )}
      style={{ animationDelay: `${order * 70}ms` }}
    >
      {children}
    </div>
  )
}

export function AuthAlert({ children }: { children: ReactNode }) {
  return (
    <div
      role='alert'
      className='flex items-start gap-3 rounded-md border border-rose-200 border-l-[3px] border-l-rose-500 bg-rose-50 px-3.5 py-3 text-sm leading-relaxed text-rose-700 animate-in fade-in slide-in-from-top-2 duration-300 ease-hud'
    >
      <AlertTriangle className='mt-0.5 size-4 shrink-0 text-rose-500' aria-hidden />
      <p className='min-w-0'>{children}</p>
    </div>
  )
}

interface OtpCodeInputProps {
  id?: string
  inputRef?: Ref<HTMLInputElement>
  value: string
  onChange: (value: string) => void
  onComplete: (value: string) => void
  invalid: boolean
  describedBy?: string
}

/** Six digit slots in two groups of three, auto-submitting through `onComplete`. */
export function OtpCodeInput({
  id,
  inputRef,
  value,
  onChange,
  onComplete,
  invalid,
  describedBy,
}: OtpCodeInputProps) {
  return (
    <InputOTP
      ref={inputRef}
      id={id}
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      autoFocus
      aria-invalid={invalid}
      aria-describedby={describedBy}
      containerClassName='justify-center gap-2 sm:gap-3'
    >
      {[0, 3].map((start) => (
        <InputOTPGroup key={start} className='gap-1 min-[380px]:gap-1.5 sm:gap-2'>
          {[0, 1, 2].map((offset) => (
            <InputOTPSlot
              key={offset}
              index={start + offset}
              aria-invalid={invalid}
              className={hudOtpSlotClass}
            />
          ))}
        </InputOTPGroup>
      ))}
    </InputOTP>
  )
}

interface FieldMessageProps {
  id?: string
  tone: 'error' | 'warning'
  children: ReactNode
}

export function FieldMessage({ id, tone, children }: FieldMessageProps) {
  const Icon = tone === 'error' ? CircleAlert : ArrowBigUpDash
  return (
    <p
      id={id}
      role={tone === 'error' ? 'alert' : undefined}
      className={cn(
        'flex items-center gap-1.5 text-xs font-medium animate-in fade-in slide-in-from-top-1 duration-200 ease-hud',
        tone === 'error' ? 'text-rose-600' : 'text-amber-600'
      )}
    >
      <Icon className='size-3.5 shrink-0' aria-hidden />
      {children}
    </p>
  )
}

interface AuthSubmitButtonProps {
  pending: boolean
  pendingLabel: string
  /** Seconds left on a rate-limit lockout; the button stays disabled and counts down. */
  cooldown: number
  disabled?: boolean
  children: ReactNode
}

export function AuthSubmitButton({
  pending,
  pendingLabel,
  cooldown,
  disabled,
  children,
}: AuthSubmitButtonProps) {
  const { t } = useTranslation()
  const state = pending ? 'pending' : cooldown > 0 ? 'cooldown' : 'idle'

  return (
    // The shadow lives on the wrapper because the button's clip-path would cut off its own.
    <div className='group/submit drop-shadow-[0_6px_14px_rgba(156,39,176,0.25)] transition-[filter] duration-300 ease-hud hover:drop-shadow-[0_10px_22px_rgba(156,39,176,0.4)] has-disabled:drop-shadow-none'>
      <Button
        type='submit'
        disabled={disabled || state !== 'idle'}
        aria-busy={pending}
        className='relative h-12 w-full overflow-hidden rounded-none bg-linear-to-r from-brand-purple via-brand-purple-deep to-brand-purple bg-[length:200%_100%] bg-left font-display text-sm font-bold uppercase tracking-[0.2em] text-white hud-clip-sm transition-[background-position,transform,opacity] duration-500 ease-hud hover:bg-right active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/90 disabled:opacity-50'
      >
        {/* Cyan notch echoing the logo's second colour. */}
        <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
        <span
          className='pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-hud group-hover/submit:translate-x-[320%]'
          aria-hidden
        />
        <span
          key={state}
          className='relative flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300 ease-hud'
        >
          {state === 'pending' && (
            <>
              <Loader2 className='size-4 animate-spin' aria-hidden />
              {pendingLabel}
            </>
          )}
          {state === 'cooldown' && (
            <>
              <Timer className='size-4' aria-hidden />
              {t('authLayout.retryIn', { seconds: cooldown })}
            </>
          )}
          {state === 'idle' && (
            <>
              {children}
              <ArrowRight
                className='size-4 transition-transform duration-300 ease-hud group-hover/submit:translate-x-1'
                aria-hidden
              />
            </>
          )}
        </span>
      </Button>
    </div>
  )
}

export function SessionCheck() {
  const { t } = useTranslation()
  return (
    // Delayed fade so fast session checks never flash the loader.
    <div
      role='status'
      aria-live='polite'
      className='flex flex-col items-center gap-4 py-12 animate-in fade-in duration-500 delay-150 fill-mode-both'
    >
      <span className='relative grid size-14 place-items-center' aria-hidden>
        <span className='absolute inset-0 rounded-full border-2 border-slate-100' />
        <span className='absolute inset-0 animate-spin rounded-full border-2 border-transparent border-r-brand-cyan border-t-brand-purple' />
        <img src={brandMark} alt='' className='h-6 w-auto' />
      </span>
      <p className='font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500'>
        {t('authLayout.checkingSession')}
      </p>
    </div>
  )
}

interface HandoffStatusProps {
  variant: 'granted' | 'mfa'
  /** Fires once the handoff has played; navigate away from here. */
  onDone: () => void
}

export function HandoffStatus({ variant, onDone }: HandoffStatusProps) {
  const { t } = useTranslation()
  const duration = HANDOFF_MS[variant]
  const finish = useEffectEvent(onDone)

  useEffect(() => {
    const id = setTimeout(() => finish(), duration)
    return () => clearTimeout(id)
  }, [duration])

  const granted = variant === 'granted'

  return (
    <div role='status' aria-live='polite' className='flex flex-col items-center py-4 text-center'>
      <div className='relative'>
        <span
          className={cn(
            'absolute inset-2 rounded-full blur-xl animate-hud-glow',
            granted ? 'bg-emerald-400/35' : 'bg-brand-cyan/35'
          )}
          aria-hidden
        />
        <svg viewBox='0 0 52 52' className='relative size-20' aria-hidden>
          <circle cx='26' cy='26' r='24' fill='white' strokeWidth='2' className='stroke-slate-100' />
          <circle
            cx='26'
            cy='26'
            r='24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            pathLength={1}
            strokeDasharray='1'
            strokeDashoffset='1'
            className={cn(
              'origin-center -rotate-90 animate-[hud-draw_0.6s_cubic-bezier(0.22,1,0.36,1)_forwards]',
              granted ? 'text-emerald-500' : 'text-brand-cyan'
            )}
          />
          <path
            d={granted ? 'M16 27l7 7 13-15' : 'M17 26h17M28 19l7 7-7 7'}
            fill='none'
            stroke='currentColor'
            strokeWidth='3'
            strokeLinecap='round'
            strokeLinejoin='round'
            pathLength={1}
            strokeDasharray='1'
            strokeDashoffset='1'
            className={cn(
              'animate-[hud-draw_0.45s_cubic-bezier(0.22,1,0.36,1)_0.35s_forwards]',
              granted ? 'text-emerald-500' : 'text-brand-purple'
            )}
          />
        </svg>
      </div>

      <p
        className={cn(
          'mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.35em] animate-in fade-in slide-in-from-bottom-1 duration-500 delay-200 ease-hud fill-mode-both',
          granted ? 'text-emerald-600' : 'text-brand-purple'
        )}
      >
        {granted ? t('authLayout.accessGranted') : t('authLayout.credentialsVerified')}
      </p>
      <h2 className='mt-2 font-display text-2xl font-bold text-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300 ease-hud fill-mode-both'>
        {granted ? t('authLayout.accessGrantedTitle') : t('authLayout.mfaNextTitle')}
      </h2>
      <p className='mt-1 text-sm text-slate-500 animate-in fade-in duration-500 delay-[400ms] fill-mode-both'>
        {granted ? t('authLayout.accessGrantedBody') : t('authLayout.mfaNextBody')}
      </p>

      <div className='mt-7 h-1.5 w-full overflow-hidden rounded-full bg-slate-100' aria-hidden>
        <div
          className='h-full origin-left rounded-full bg-linear-to-r from-brand-purple to-brand-cyan animate-[hud-progress_linear_forwards]'
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  )
}
