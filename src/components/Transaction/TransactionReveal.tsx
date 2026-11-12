import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { TransactionReveal } from '@/types/transaction'

/** The detail page's hold on the real buyer data; the API sends it masked. */
export interface RevealControls {
  /** The real values, once asked for. Kept for this page view only. */
  data?: TransactionReveal
  /** The API sent masked values (older backends send the real ones). */
  masked: boolean
  /** The admin holds `transaction.reveal`. */
  canReveal: boolean
  pending: boolean
  show: () => void
  hide: () => void
}

/** "Tampilkan": asks the backend for the real values, which it logs; "Sembunyikan" drops them again. */
export function RevealButton({ controls, className }: { controls: RevealControls; className?: string }) {
  const { t } = useTranslation('common')
  if (!controls.canReveal || !controls.masked) return null
  const shown = !!controls.data

  return (
    <button
      type='button'
      onClick={shown ? controls.hide : controls.show}
      disabled={controls.pending}
      aria-pressed={shown}
      title={shown ? t('transactionDetailPage.reveal.hideHint') : t('transactionDetailPage.reveal.showHint')}
      className={cn(
        'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 font-sans text-xs font-medium normal-case tracking-normal text-slate-600 transition-colors hover:border-brand-purple/40 hover:text-brand-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-60',
        className
      )}
    >
      {controls.pending ? (
        <Loader2 className='size-3.5 animate-spin' aria-hidden />
      ) : shown ? (
        <EyeOff className='size-3.5' aria-hidden />
      ) : (
        <Eye className='size-3.5' aria-hidden />
      )}
      {shown ? t('transactionDetailPage.reveal.hide') : t('transactionDetailPage.reveal.show')}
    </button>
  )
}
