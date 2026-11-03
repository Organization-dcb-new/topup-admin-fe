import { useTranslation } from 'react-i18next'
import { Receipt } from 'lucide-react'

import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { formatCurrency } from '@/lib/format'
import type { TransactionDetail, TransactionRowState } from '@/types/transaction'
import { ChannelChip, CopyValueButton, PaymentStatusChip } from './TransactionParts'
import { TransactionTimeline } from './TransactionTimeline'

/** Head of the detail: what was bought, for how much, and where it stands. */
export function TransactionSummary({ detail, row }: { detail: TransactionDetail; row?: TransactionRowState }) {
  const { t } = useTranslation('common')
  const product = detail.order_item?.product_name

  return (
    <section className='bg-slate-200/80 p-px hud-clip animate-in fade-in slide-in-from-bottom-3 duration-500 ease-hud'>
      <div className='bg-white hud-clip'>
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        <div className='space-y-6 p-5 sm:p-7'>
          <div className='flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between'>
            <div className='flex min-w-0 items-start gap-4'>
              <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
                <Receipt className='size-5' aria-hidden />
              </span>
              <div className='min-w-0 space-y-2'>
                <p className={hudEyebrowClass}>{row?.app_name || t('transactionDetailPage.eyebrow')}</p>
                <h1 className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900 wrap-anywhere sm:text-3xl'>
                  {product || detail.payment_number}
                </h1>
                <div className='flex flex-wrap items-center gap-2 text-xs text-slate-500'>
                  {detail.payment_number && (
                    <span className='inline-flex min-w-0 items-center gap-0.5'>
                      <span className='truncate font-mono'>{detail.payment_number}</span>
                      <CopyValueButton value={detail.payment_number} label={t('transactionDetailPage.payment.number')} className='size-6' />
                    </span>
                  )}
                  <ChannelChip channel={detail.payment_channel} />
                </div>
              </div>
            </div>
            <div className='shrink-0 border-t border-slate-100 pt-4 sm:border-0 sm:pt-0 sm:text-right'>
              <p className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{t('transactionDetailPage.amount')}</p>
              <p className='font-display text-3xl font-bold tabular-nums text-slate-900'>{formatCurrency(detail.amount)}</p>
              <PaymentStatusChip status={detail.status} className='mt-2' />
            </div>
          </div>

          <div className='border-t border-slate-100 pt-5'>
            <TransactionTimeline detail={detail} />
          </div>
        </div>
      </div>
    </section>
  )
}
