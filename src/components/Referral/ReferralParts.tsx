import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Check, Copy } from 'lucide-react'

import { Can } from '@/components/Auth/Can'
import { Switch } from '@/components/ui/switch'
import { PERM } from '@/constants/permissions'
import { useUpdateReferralCode } from '@/hooks/useReferral'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { cn } from '@/lib/utils'
import type { ReferralCode } from '@/types/referral'

interface ReferralTicketProps {
  code: string
  percent: number
  active?: boolean
  size?: 'md' | 'lg'
}

/** The code as a tear-off ticket: code on the left, commission on the stub. */
export function ReferralTicket({ code, percent, active = true, size = 'md' }: ReferralTicketProps) {
  const { t, i18n } = useTranslation()
  const shownPercent = (Number.isFinite(percent) ? percent : 0).toLocaleString(i18n.resolvedLanguage, {
    maximumFractionDigits: 2,
  })

  return (
    <div
      className={cn(
        'flex items-stretch overflow-hidden rounded-lg border border-dashed transition-colors duration-300',
        active ? 'border-brand-purple/35 bg-brand-purple/[0.04]' : 'border-slate-300 bg-slate-50'
      )}
    >
      <div className='min-w-0 flex-1 px-4 py-3'>
        <p className='font-display text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400'>
          {t('referralPage.codeShort')}
        </p>
        <p
          className={cn(
            'truncate font-mono font-bold tracking-[0.15em] transition-colors duration-300',
            size === 'lg' ? 'text-2xl' : 'text-xl',
            active ? 'text-slate-900' : 'text-slate-400'
          )}
        >
          {code || '——'}
        </p>
      </div>
      <div
        className={cn(
          'relative grid shrink-0 place-items-center border-l border-dashed px-3 py-3 text-center text-white transition-colors duration-300',
          size === 'lg' ? 'w-32' : 'w-24',
          active ? 'border-brand-purple/35 bg-linear-to-br from-brand-purple to-brand-cyan' : 'border-slate-300 bg-slate-300'
        )}
      >
        {/* Punched holes where the stub tears off. */}
        <span className='absolute -left-2 -top-2 size-4 rounded-full bg-white' aria-hidden />
        <span className='absolute -bottom-2 -left-2 size-4 rounded-full bg-white' aria-hidden />
        <div>
          <p className={cn('font-display font-bold leading-none', size === 'lg' ? 'text-3xl' : 'text-2xl')}>
            {shownPercent}%
          </p>
          <p className='mt-1 font-display text-[9px] font-semibold uppercase tracking-[0.2em] text-white/85'>
            {t('referralPage.commission')}
          </p>
        </div>
      </div>
    </div>
  )
}

export function StatusChip({ active }: { active: boolean }) {
  const { t } = useTranslation()
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] hud-clip-sm transition-colors duration-300',
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
      )}
    >
      <span className={cn('size-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-slate-400')} aria-hidden />
      {active ? t('referralPage.statusActive') : t('referralPage.statusInactive')}
    </span>
  )
}

/** Status chip, plus an on/off switch for admins allowed to change it. */
export function ReferralStatusToggle({ referral }: { referral: ReferralCode }) {
  const { t } = useTranslation()
  const update = useUpdateReferralCode()

  return (
    <div className='flex items-center gap-2'>
      <StatusChip active={referral.is_active} />
      <Can permission={PERM.referralUpdate}>
        <Switch
          checked={referral.is_active}
          disabled={update.isPending}
          onCheckedChange={(checked) => update.mutate({ id: referral.id, payload: { is_active: checked } })}
          aria-label={t('referralPage.toggleStatus', { name: referral.name })}
          className='data-[state=checked]:bg-brand-purple'
        />
      </Can>
    </div>
  )
}

export function CopyCodeButton({ code, className }: { code: string; className?: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await copyTextToClipboard(code)
    } catch {
      toast.error(t('referralPage.copyFailed'))
      return
    }
    setCopied(true)
    toast.success(t('referralPage.copied', { code }))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type='button'
      onClick={copy}
      aria-label={t('referralPage.copy')}
      title={t('referralPage.copy')}
      className={cn(
        'grid size-8 place-items-center text-slate-400 hud-clip-sm transition-colors hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40',
        className
      )}
    >
      {copied ? <Check className='size-4 text-emerald-600' aria-hidden /> : <Copy className='size-4' aria-hidden />}
    </button>
  )
}
