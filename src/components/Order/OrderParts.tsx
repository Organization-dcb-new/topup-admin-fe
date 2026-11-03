import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Check, CheckCircle2, CircleDashed, Copy, Eye, EyeOff, XCircle, type LucideIcon } from 'lucide-react'

import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { cn } from '@/lib/utils'
import { maskSecret, providerState, type ProviderState } from './order-utils'

const STATE_STYLE: Record<ProviderState, { icon: LucideIcon; chip: string }> = {
  accepted: { icon: CheckCircle2, chip: 'bg-emerald-50 text-emerald-700' },
  rejected: { icon: XCircle, chip: 'bg-rose-50 text-rose-700' },
  unsent: { icon: CircleDashed, chip: 'bg-slate-100 text-slate-500' },
}

/** Provider response for the order line; rejections also show the raw code underneath. */
export function ProviderStatusChip({ code, showCode = true }: { code: string; showCode?: boolean }) {
  const { t } = useTranslation('common')
  const state = providerState(code)
  const { icon: Icon, chip } = STATE_STYLE[state]

  return (
    <span className='inline-flex min-w-0 flex-col items-start gap-0.5'>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] hud-clip-sm',
          chip
        )}
      >
        <Icon className='size-3' aria-hidden />
        {t(`orderPage.provider.${state}`)}
      </span>
      {showCode && state === 'rejected' && (
        <span className='max-w-full truncate font-mono text-[10px] text-rose-600' title={code}>
          {code}
        </span>
      )}
    </span>
  )
}

export function CopyValueButton({ value, label, className }: { value: string; label: string; className?: string }) {
  const { t } = useTranslation('common')
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await copyTextToClipboard(value)
    } catch {
      toast.error(t('orderPage.copyFailed'))
      return
    }
    setCopied(true)
    toast.success(t('orderPage.copied'))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type='button'
      onClick={copy}
      aria-label={label}
      title={label}
      className={cn(
        'grid size-7 shrink-0 place-items-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40',
        className
      )}
    >
      {copied ? <Check className='size-3.5 text-emerald-600' aria-hidden /> : <Copy className='size-3.5' aria-hidden />}
    </button>
  )
}

/** Voucher codes are what the player paid for: masked until asked for. */
export function VoucherValue({ code }: { code: string }) {
  const { t } = useTranslation('common')
  const [revealed, setRevealed] = useState(false)

  return (
    <span className='flex min-w-0 items-center gap-1'>
      <span className='min-w-0 flex-1 truncate font-mono text-sm text-slate-800'>{revealed ? code : maskSecret(code)}</span>
      <button
        type='button'
        onClick={() => setRevealed((v) => !v)}
        aria-pressed={revealed}
        aria-label={revealed ? t('orderPage.hideVoucher') : t('orderPage.showVoucher')}
        title={revealed ? t('orderPage.hideVoucher') : t('orderPage.showVoucher')}
        className='grid size-7 shrink-0 place-items-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'
      >
        {revealed ? <EyeOff className='size-3.5' aria-hidden /> : <Eye className='size-3.5' aria-hidden />}
      </button>
      <CopyValueButton value={code} label={t('orderPage.copyVoucher')} />
    </span>
  )
}
