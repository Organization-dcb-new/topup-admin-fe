import { useTranslation } from 'react-i18next'
import { Ban, Loader2, Play } from 'lucide-react'

import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { formatRelative } from '@/components/Maintenance/maintenance-status'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { formatMaintenanceInstant } from '@/helpers/maintenance-datetime'
import { useNow } from '@/hooks/useNow'
import { useRetained } from '@/hooks/useRetained'
import { cn } from '@/lib/utils'
import { TRANSACTION_STOP_DEFAULT_MESSAGE } from '@/schemas/transaction-stop'
import type { UpdateTransactionStopPayload } from '@/types/transaction-stop'

export type TransactionStopConfirm =
  | { kind: 'stop'; payload: UpdateTransactionStopPayload }
  | { kind: 'resume' }

interface TransactionStopConfirmDialogProps {
  /** What to confirm; null closes the dialog. */
  target: TransactionStopConfirm | null
  onClose: () => void
  pending: boolean
  onConfirm: (target: TransactionStopConfirm) => void
}

const TONES = {
  stop: { tile: 'bg-linear-to-br from-rose-500 to-brand-purple', bar: 'bg-linear-to-r from-rose-500 to-brand-purple', button: 'bg-rose-600 hover:bg-rose-700', icon: Ban },
  resume: { tile: 'bg-linear-to-br from-emerald-400 to-brand-cyan', bar: 'bg-linear-to-r from-emerald-400 to-brand-cyan', button: 'bg-emerald-600 hover:bg-emerald-700', icon: Play },
} as const

/** States what stopping or reopening does before it happens; a stop also recaps message and reopen time. */
export function TransactionStopConfirmDialog({ target, onClose, pending, onConfirm }: TransactionStopConfirmDialogProps) {
  const { t, i18n } = useTranslation()
  const now = useNow()
  // Keeps the content while the dialog animates closed.
  const shown = useRetained(target)
  if (!shown) return null

  const kind = shown.kind
  const tone = TONES[kind]
  const Icon = tone.icon
  const locale = i18n.resolvedLanguage
  const payload = shown.kind === 'stop' ? shown.payload : undefined
  const resumeIso = payload?.resume_at ?? null
  const resumeMs = resumeIso ? Date.parse(resumeIso) : Number.NaN

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent
        showCloseButton={false}
        className='gap-0 overflow-hidden rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-md'
      >
        <div className={cn('h-1', tone.bar)} aria-hidden />
        <div className='space-y-6 p-6 sm:p-7'>
          <div className='flex items-start gap-4'>
            <span className={cn('grid size-12 shrink-0 place-items-center text-white hud-clip-sm', tone.tile)}>
              <Icon className='size-5' aria-hidden />
            </span>
            <div className='min-w-0 space-y-1'>
              <p className={hudEyebrowClass}>{t(`transactionStopPage.confirm.${kind}.eyebrow`)}</p>
              <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
                {t(`transactionStopPage.confirm.${kind}.title`)}
              </DialogTitle>
              <DialogDescription className='text-sm leading-relaxed text-slate-500'>
                {t(`transactionStopPage.confirm.${kind}.description`)}
              </DialogDescription>
            </div>
          </div>

          {payload && (
            <dl className='space-y-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm'>
              <div className='space-y-0.5'>
                <dt className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>
                  {t('transactionStopPage.confirm.stop.messageLabel')}
                </dt>
                <dd className={cn('leading-relaxed whitespace-pre-line', payload.message ? 'text-slate-800' : 'text-slate-500')}>
                  {payload.message || TRANSACTION_STOP_DEFAULT_MESSAGE}
                </dd>
              </div>
              <div className='space-y-0.5'>
                <dt className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>
                  {t('transactionStopPage.confirm.stop.resumeLabel')}
                </dt>
                <dd className='font-medium tabular-nums text-slate-800'>
                  {resumeIso
                    ? t('transactionStopPage.confirm.stop.resumeAt', {
                        date: formatMaintenanceInstant(resumeIso, { locale, dateStyle: 'medium' }),
                        when: Number.isFinite(resumeMs) ? formatRelative(resumeMs, now, locale) : '',
                      })
                    : t('transactionStopPage.confirm.stop.resumeManual')}
                </dd>
              </div>
            </dl>
          )}

          {/* Cancel first in the DOM so it, not the action, gets the initial focus. */}
          <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
            <button
              type='button'
              onClick={onClose}
              disabled={pending}
              className='inline-flex h-11 items-center justify-center bg-slate-100 px-5 text-sm font-medium whitespace-nowrap text-slate-600 hud-clip-sm transition-colors duration-200 hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/50 disabled:opacity-50'
            >
              {t('transactionStopPage.confirm.cancel')}
            </button>
            <button
              type='button'
              disabled={pending || target === null}
              onClick={() => target && onConfirm(target)}
              className={cn(
                'inline-flex h-11 items-center justify-center gap-2 px-5 font-display text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap text-white hud-clip-sm transition-[background-color,transform,opacity] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/90 active:scale-[0.985] disabled:opacity-70 sm:min-w-40',
                tone.button
              )}
            >
              {pending ? <Loader2 className='size-4 shrink-0 animate-spin' aria-hidden /> : <Icon className='size-4 shrink-0' aria-hidden />}
              {t(`transactionStopPage.confirm.${kind}.confirm`)}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
