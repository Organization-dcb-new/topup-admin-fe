import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'

import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useRetained } from '@/hooks/useRetained'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { formatPaymentChannel } from '@/lib/dashboard'
import type { CashflowItem } from '@/types/cashflow'
import { directionOf, parseNotes } from './cashflow-meta'
import { CopyIdButton, DirectionTile, SignedAmount } from './CashflowParts'

interface CashflowDetailDialogProps {
  item: CashflowItem | null
  onOpenChange: (open: boolean) => void
}

export function CashflowDetailDialog({ item, onOpenChange }: CashflowDetailDialogProps) {
  // Keep the last entry on screen while the dialog animates closed.
  const shown = useRetained(item)

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {shown && <CashflowDetail key={shown.id} item={shown} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function CashflowDetail({ item, onClose }: { item: CashflowItem; onClose: () => void }) {
  const { t } = useTranslation('common')
  const direction = directionOf(item.type)
  const note = parseNotes(item.notes)

  return (
    // min-w-0: DialogContent is a grid, and long IDs would otherwise widen its track past the screen.
    <div className='min-w-0 space-y-6 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <DirectionTile direction={direction} size='lg' />
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{t('cashflowPage.detail.eyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {direction === 'other' ? item.type : t(`cashflowPage.kind.${direction}`)}
          </DialogTitle>
          <DialogDescription className='text-sm text-slate-500'>
            {formatBackendDateTime(item.created_at, 'EEEE, dd MMM yyyy, HH:mm:ss')}
          </DialogDescription>
        </div>
      </div>

      <div className='rounded-lg border border-slate-200 px-4 py-3'>
        <p className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>
          {direction === 'in' ? t('cashflowPage.detail.amountIn') : t('cashflowPage.detail.amountOut')}
        </p>
        <SignedAmount direction={direction} amount={item.amount} className='block font-display text-3xl font-bold' />
      </div>

      <dl className='divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm'>
        {note.method && (
          <Row label={t('cashflowPage.detail.method')}>
            <span className='font-medium text-slate-800'>{formatPaymentChannel(note.method)}</span>
          </Row>
        )}
        {note.provider && (
          <Row label={t('cashflowPage.detail.provider')}>
            <span className='font-medium text-slate-800'>{note.provider}</span>
          </Row>
        )}
        {note.sku && (
          <Row label={t('cashflowPage.detail.sku')}>
            <span className='min-w-0 flex-1 truncate font-mono text-xs text-slate-700'>{note.sku}</span>
          </Row>
        )}
        {note.tid && (
          <Row label={t('cashflowPage.detail.tid')}>
            <span className='min-w-0 flex-1 truncate font-mono text-xs text-slate-700' title={note.tid}>{note.tid}</span>
            <CopyIdButton value={note.tid} label={t('cashflowPage.detail.tid')} />
          </Row>
        )}
        <Row label={t('cashflowPage.detail.orderId')}>
          <span className='min-w-0 flex-1 truncate font-mono text-xs text-slate-700' title={item.order_id}>{item.order_id}</span>
          <CopyIdButton value={item.order_id} label={t('cashflowPage.detail.orderId')} />
        </Row>
        <Row label={t('cashflowPage.detail.paymentId')}>
          {item.payment_id ? (
            <>
              <span className='min-w-0 flex-1 truncate font-mono text-xs text-slate-700' title={item.payment_id}>{item.payment_id}</span>
              <CopyIdButton value={item.payment_id} label={t('cashflowPage.detail.paymentId')} />
            </>
          ) : (
            <span className='text-slate-400'>—</span>
          )}
        </Row>
        <Row label={t('cashflowPage.detail.entryId')}>
          <span className='min-w-0 flex-1 truncate font-mono text-xs text-slate-500' title={item.id}>{item.id}</span>
          <CopyIdButton value={item.id} label={t('cashflowPage.detail.entryId')} />
        </Row>
      </dl>

      {item.notes && (
        <div className='space-y-1.5'>
          <p className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{t('cashflowPage.detail.notes')}</p>
          <p className='whitespace-pre-wrap break-words rounded-md bg-slate-50 px-3 py-2 font-mono text-xs leading-relaxed text-slate-600'>
            {item.notes}
          </p>
        </div>
      )}

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        {/* Read-only dialog: start on Close instead of the first copy button. */}
        <button
          type='button'
          autoFocus
          onClick={onClose}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'
        >
          {t('cashflowPage.detail.close')}
        </button>
        {item.payment_id && (
          <Link
            to={`/transactions/${item.payment_id}`}
            onClick={onClose}
            className='group inline-flex h-10 items-center justify-center gap-1.5 px-4 font-display text-xs font-semibold uppercase tracking-[0.15em] text-brand-purple ring-1 ring-inset ring-brand-purple/30 hud-clip-sm transition-colors hover:bg-brand-purple/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'
          >
            {t('cashflowPage.detail.openTransaction')}
            <ArrowRight className='size-3.5 transition-transform duration-300 ease-hud group-hover:translate-x-0.5' aria-hidden />
          </Link>
        )}
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='flex items-center gap-3 px-3 py-2.5'>
      <dt className='w-28 shrink-0 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>{label}</dt>
      <dd className='flex min-w-0 flex-1 items-center gap-1'>{children}</dd>
    </div>
  )
}
