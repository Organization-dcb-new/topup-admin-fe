import { useTranslation } from 'react-i18next'
import { BadgeCheck, KeyRound, MailWarning, type LucideIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Customer } from '@/types/customer'

const chipClass =
  'inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.14em] hud-clip-sm'

interface CustomerAvatarProps {
  customer: Pick<Customer, 'name' | 'email' | 'avatar_url'>
  size?: 'md' | 'lg'
}

/** The Google picture when there is one, the name's initial otherwise (or while it loads). */
export function CustomerAvatar({ customer, size = 'md' }: CustomerAvatarProps) {
  const initial = (customer.name.trim() || customer.email.trim()).charAt(0) || '?'
  return (
    <Avatar className={cn('rounded-none hud-clip-sm', size === 'lg' ? 'size-14' : 'size-10')} aria-hidden>
      {customer.avatar_url && (
        // Google's image host refuses hotlinked requests that carry a referrer.
        <AvatarImage src={customer.avatar_url} alt='' referrerPolicy='no-referrer' className='object-cover' />
      )}
      <AvatarFallback
        className={cn(
          'rounded-none bg-linear-to-br from-brand-purple to-brand-cyan font-display font-bold uppercase text-white',
          size === 'lg' ? 'text-xl' : 'text-base'
        )}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  )
}

export function CustomerStatusChip({ active, className }: { active: boolean; className?: string }) {
  const { t } = useTranslation('common')
  return (
    <span className={cn(chipClass, active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700', className)}>
      <span className={cn('size-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-rose-500')} aria-hidden />
      {active ? t('customerPage.status.active') : t('customerPage.status.inactive')}
    </span>
  )
}

/** Google's "G", for the sign-in method chip. */
function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 48 48' className={className} aria-hidden>
      <path
        fill='#FFC107'
        d='M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z'
      />
      <path fill='#FF3D00' d='M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z' />
      <path fill='#4CAF50' d='M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z' />
      <path fill='#1976D2' d='M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z' />
    </svg>
  )
}

/**
 * Ways the account can sign in today. A Google-created account that never set a password
 * shows only Google.
 */
export function SignInMethodChips({ customer, className }: { customer: Pick<Customer, 'has_password' | 'google_linked'>; className?: string }) {
  const { t } = useTranslation('common')
  return (
    <span className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {customer.has_password && (
        <span className={cn(chipClass, 'bg-brand-purple/10 text-brand-purple')}>
          <KeyRound className='size-3' aria-hidden />
          {t('customerPage.methods.password')}
        </span>
      )}
      {customer.google_linked && (
        <span className={cn(chipClass, 'bg-white text-slate-700 ring-1 ring-inset ring-slate-200')}>
          <GoogleMark className='size-3' />
          {t('customerPage.methods.google')}
        </span>
      )}
      {!customer.has_password && !customer.google_linked && (
        <span className={cn(chipClass, 'bg-slate-100 text-slate-500')}>{t('customerPage.methods.none')}</span>
      )}
    </span>
  )
}

export function EmailVerifiedChip({ verified }: { verified: boolean }) {
  const { t } = useTranslation('common')
  const Icon = verified ? BadgeCheck : MailWarning
  return (
    <span className={cn(chipClass, verified ? 'bg-cyan-50 text-cyan-700' : 'bg-amber-50 text-amber-700')}>
      <Icon className='size-3' aria-hidden />
      {verified ? t('customerPage.detail.emailVerified') : t('customerPage.detail.emailUnverified')}
    </span>
  )
}

interface CustomerMetricProps {
  order: number
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  tone?: 'emerald' | 'amber'
}

/** One purchase-summary tile. */
export function CustomerMetric({ order, icon: Icon, label, value, hint, tone }: CustomerMetricProps) {
  return (
    <li
      className='min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'
      style={{ animationDelay: `${150 + order * 60}ms` }}
    >
      <div className='h-full bg-slate-200/80 p-px hud-clip-sm'>
        <div className='h-full bg-white p-4 hud-clip-sm'>
          <div className='flex items-center justify-between gap-2'>
            <p className='truncate font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{label}</p>
            <Icon
              className={cn(
                'size-4 shrink-0',
                tone === 'emerald' ? 'text-emerald-500' : tone === 'amber' ? 'text-amber-500' : 'text-slate-400'
              )}
              aria-hidden
            />
          </div>
          <p
            className={cn(
              'mt-2 truncate font-display text-xl font-bold tabular-nums',
              tone === 'emerald' ? 'text-emerald-600' : tone === 'amber' ? 'text-amber-600' : 'text-slate-900'
            )}
            title={value}
          >
            {value}
          </p>
          {hint && <p className='mt-0.5 truncate text-[11px] text-slate-400'>{hint}</p>}
        </div>
      </div>
    </li>
  )
}
