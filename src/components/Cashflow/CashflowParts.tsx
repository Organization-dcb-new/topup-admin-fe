import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Check, Copy } from 'lucide-react'

import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CashflowDirection } from './cashflow-meta'

const DIRECTION_STYLE: Record<CashflowDirection, { icon: typeof ArrowDownLeft; tile: string }> = {
  in: { icon: ArrowDownLeft, tile: 'bg-emerald-50 text-emerald-600' },
  out: { icon: ArrowUpRight, tile: 'bg-amber-50 text-amber-600' },
  other: { icon: ArrowLeftRight, tile: 'bg-slate-100 text-slate-500' },
}

export function DirectionTile({ direction, size = 'md' }: { direction: CashflowDirection; size?: 'md' | 'lg' }) {
  const style = DIRECTION_STYLE[direction]
  const Icon = style.icon
  return (
    <span className={cn('grid shrink-0 place-items-center hud-clip-sm', style.tile, size === 'lg' ? 'size-12' : 'size-9')} aria-hidden>
      <Icon className={size === 'lg' ? 'size-5' : 'size-4'} />
    </span>
  )
}

/** Money in reads `+Rp…` in green, money out `−Rp…` in ink; the sign carries the direction for colour-blind readers. */
export function SignedAmount({ direction, amount, className }: { direction: CashflowDirection; amount: number; className?: string }) {
  const sign = direction === 'in' ? '+' : direction === 'out' ? '−' : ''
  return (
    <span className={cn('tabular-nums', direction === 'in' ? 'text-emerald-700' : 'text-slate-900', className)}>
      {sign}
      {formatCurrency(Math.abs(amount))}
    </span>
  )
}

export function CopyIdButton({ value, label }: { value: string; label: string }) {
  const { t } = useTranslation('common')
  const [copied, setCopied] = useState(false)
  const text = t('cashflowPage.copy', { label })

  const copy = async () => {
    try {
      await copyTextToClipboard(value)
    } catch {
      toast.error(t('cashflowPage.copyFailed'))
      return
    }
    setCopied(true)
    toast.success(t('cashflowPage.copied', { label }))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type='button'
      onClick={() => void copy()}
      aria-label={text}
      title={text}
      className='grid size-7 shrink-0 place-items-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'
    >
      {copied ? <Check className='size-3.5 text-emerald-600' aria-hidden /> : <Copy className='size-3.5' aria-hidden />}
    </button>
  )
}
