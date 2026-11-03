import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, X } from 'lucide-react'

import { formatBackendDateTime } from '@/lib/backend-datetime'
import { cn } from '@/lib/utils'
import type { TransactionDetail } from '@/types/transaction'
import { OrderStatusChip, PaymentStatusChip } from './TransactionParts'
import {
  fulfilmentStep,
  isKnownOrderStatus,
  isKnownPaymentStatus,
  paymentStep,
  wibToIso,
  type StepState,
} from './transaction-meta'

interface Step {
  key: string
  title: string
  state: StepState
  chip?: ReactNode
  hint: string
}

/** Created → paid → fulfilled, read from the payment status and the order behind it. */
export function TransactionTimeline({ detail }: { detail: TransactionDetail }) {
  const { t } = useTranslation('common')
  const orderStatus = detail.order?.status ?? ''
  const payment = paymentStep(detail.status)
  const fulfilment = fulfilmentStep(orderStatus, detail.status)

  const steps: Step[] = [
    {
      key: 'created',
      title: t('transactionDetailPage.timeline.created'),
      state: 'done',
      hint: formatBackendDateTime(wibToIso(detail.created_at), 'dd MMM yyyy, HH:mm:ss'),
    },
    {
      key: 'payment',
      title: t('transactionDetailPage.timeline.payment'),
      state: payment,
      chip: <PaymentStatusChip status={detail.status} />,
      hint: isKnownPaymentStatus(detail.status) ? t(`transactionDetailPage.timeline.paymentHint.${detail.status}`) : '',
    },
    {
      key: 'fulfilment',
      title: t('transactionDetailPage.timeline.fulfilment'),
      state: fulfilment,
      chip: fulfilment === 'upcoming' ? undefined : <OrderStatusChip status={orderStatus} />,
      hint:
        fulfilment === 'upcoming'
          ? t(payment === 'failed' ? 'transactionDetailPage.timeline.fulfilmentHint.skipped' : 'transactionDetailPage.timeline.fulfilmentHint.waiting')
          : isKnownOrderStatus(orderStatus)
            ? t(`transactionDetailPage.timeline.fulfilmentHint.${orderStatus}`)
            : '',
    },
  ]

  return (
    <ol className='grid gap-0 sm:grid-cols-3 sm:gap-4' aria-label={t('transactionDetailPage.timeline.label')}>
      {steps.map((step, index) => (
        <li key={step.key} className='relative flex gap-3 pb-5 last:pb-0 sm:flex-col sm:gap-3 sm:pb-0'>
          {index < steps.length - 1 && (
            <span
              className={cn(
                'absolute bottom-0 left-3.5 top-8 w-px sm:left-9 sm:-right-4 sm:top-3.5 sm:bottom-auto sm:h-px sm:w-auto',
                step.state === 'done' ? 'bg-emerald-300' : 'bg-slate-200'
              )}
              aria-hidden
            />
          )}
          <StepNode state={step.state} />
          <div className='min-w-0 space-y-1.5'>
            <p className='font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500'>{step.title}</p>
            {step.chip}
            {step.hint && (
              <p className={cn('text-xs leading-relaxed', step.state === 'upcoming' ? 'text-slate-400' : 'text-slate-600')}>{step.hint}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

function StepNode({ state }: { state: StepState }) {
  return (
    <span
      className={cn(
        'relative z-10 grid size-7 shrink-0 place-items-center hud-clip-sm',
        state === 'done' && 'bg-emerald-500 text-white',
        state === 'failed' && 'bg-rose-500 text-white',
        state === 'current' && 'bg-amber-100 text-amber-600',
        state === 'upcoming' && 'bg-slate-100 text-slate-300'
      )}
      aria-hidden
    >
      {state === 'done' && <Check className='size-3.5' strokeWidth={3} />}
      {state === 'failed' && <X className='size-3.5' strokeWidth={3} />}
      {state === 'current' && <span className='size-2 rounded-full bg-amber-500 animate-hud-signal' />}
      {state === 'upcoming' && <span className='size-2 rounded-full border-2 border-current' />}
    </span>
  )
}
