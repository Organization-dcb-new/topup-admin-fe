import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Shield, ShieldAlert, ShieldCheck, ShieldOff, UserCog, type LucideIcon } from 'lucide-react'

import type { RoleOption } from '@/hooks/useRoles'
import { cn } from '@/lib/utils'

const ROLE_STYLES: Record<string, { icon: LucideIcon; chip: string }> = {
  dev: { icon: ShieldAlert, chip: 'bg-brand-purple/10 text-brand-purple' },
  admin: { icon: ShieldCheck, chip: 'bg-cyan-50 text-cyan-700' },
  noc: { icon: Shield, chip: 'bg-slate-100 text-slate-600' },
}
const CUSTOM_ROLE = { icon: UserCog, chip: 'bg-amber-50 text-amber-700' }

function roleStyle(slug: string) {
  return ROLE_STYLES[slug] ?? CUSTOM_ROLE
}

const chipClass =
  'inline-flex items-center gap-1.5 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] hud-clip-sm'

export function AdminAvatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan font-display font-bold uppercase text-white hud-clip-sm',
        size === 'lg' ? 'size-12 text-lg' : 'size-11 text-base'
      )}
      aria-hidden
    >
      {name.trim().charAt(0) || '?'}
    </span>
  )
}

export function RoleChip({ slug, name }: { slug: string; name?: string }) {
  const style = roleStyle(slug)
  const Icon = style.icon
  return (
    <span className={cn(chipClass, style.chip)}>
      <Icon className='size-3' aria-hidden />
      {name || slug}
    </span>
  )
}

export function TwoFactorChip({ enabled }: { enabled: boolean }) {
  const { t } = useTranslation()
  const Icon = enabled ? ShieldCheck : ShieldOff
  return (
    <span className={cn(chipClass, enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600')}>
      <Icon className='size-3' aria-hidden />
      {enabled ? t('adminPage.twoFactorOn') : t('adminPage.twoFactorOff')}
    </span>
  )
}

interface RolePickerProps {
  options: RoleOption[]
  value: string
  onChange: (slug: string) => void
  /** Marked as the admin's role today. */
  current?: string
  label: string
}

/** Roles as a radio list, so the description of each is visible before choosing. */
export function RolePicker({ options, value, onChange, current, label }: RolePickerProps) {
  const { t } = useTranslation()
  const name = useId()

  return (
    <div role='radiogroup' aria-label={label} className='grid gap-2 sm:grid-cols-2'>
      {options.map((option) => {
        const selected = option.slug === value
        const style = roleStyle(option.slug)
        const Icon = style.icon
        return (
          <label
            key={option.slug}
            className={cn(
              'relative flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-purple/40',
              selected ? 'border-brand-purple bg-brand-purple/[0.05]' : 'border-slate-200 hover:bg-slate-50'
            )}
          >
            <input
              type='radio'
              name={name}
              value={option.slug}
              checked={selected}
              onChange={() => onChange(option.slug)}
              className='sr-only'
            />
            <span className={cn('mt-0.5 grid size-7 shrink-0 place-items-center hud-clip-sm', style.chip)}>
              <Icon className='size-3.5' aria-hidden />
            </span>
            <span className='min-w-0 flex-1'>
              <span className='flex items-center gap-2'>
                <span className='truncate text-sm font-semibold text-slate-900'>{option.name}</span>
                {current === option.slug && (
                  <span className='shrink-0 font-display text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
                    {t('adminPage.currentRole')}
                  </span>
                )}
              </span>
              {option.description && (
                <span className='mt-0.5 line-clamp-2 block text-xs leading-snug text-slate-500'>{option.description}</span>
              )}
            </span>
            <span
              className={cn(
                'grid size-4 shrink-0 place-items-center rounded-full border transition-colors',
                selected ? 'border-brand-purple bg-brand-purple text-white' : 'border-slate-300'
              )}
              aria-hidden
            >
              {selected && <Check className='size-2.5' strokeWidth={3} />}
            </span>
          </label>
        )
      })}
    </div>
  )
}
