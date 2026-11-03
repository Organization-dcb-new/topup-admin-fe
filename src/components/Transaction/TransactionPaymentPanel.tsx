import { useTranslation } from 'react-i18next'
import { QRCodeSVG } from 'qrcode.react'
import { CreditCard, ExternalLink, Hourglass } from 'lucide-react'

import { formatBackendDateTime } from '@/lib/backend-datetime'
import type { TransactionDetail } from '@/types/transaction'
import { DetailField, DetailPanel } from './detail-parts'
import { ChannelChip, CopyValueButton, PaymentStatusChip } from './TransactionParts'
import { isAwaitingPayment, wibToIso } from './transaction-meta'

/** How the payment was (or can still be) made. Works from whatever the gateway sent, not from the channel name. */
export function TransactionPaymentPanel({ detail, order }: { detail: TransactionDetail; order?: number }) {
  const { t, i18n } = useTranslation('common')
  const guide = (i18n.language.startsWith('id') ? detail.guide?.id : detail.guide?.en)?.trim()

  return (
    <DetailPanel icon={CreditCard} title={t('transactionDetailPage.payment.title')} order={order}>
      {isAwaitingPayment(detail.status) && <PayBox detail={detail} />}
      <dl>
        <DetailField label={t('transactionDetailPage.payment.status')}>
          <PaymentStatusChip status={detail.status} />
        </DetailField>
        <DetailField label={t('transactionDetailPage.payment.channel')}>
          <ChannelChip channel={detail.payment_channel} />
        </DetailField>
        <DetailField label={t('transactionDetailPage.payment.number')} copy={detail.payment_number || undefined} mono>
          {detail.payment_number || '—'}
        </DetailField>
        {detail.va_number && (
          <DetailField label={t('transactionDetailPage.payment.vaNumber')} copy={detail.va_number} mono>
            {detail.va_number}
          </DetailField>
        )}
        {detail.payment_url && (
          <DetailField label={t('transactionDetailPage.payment.link')}>
            <a
              href={detail.payment_url}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1 font-medium text-brand-purple underline-offset-4 hover:underline'
            >
              {t('transactionDetailPage.payment.openLink')}
              <ExternalLink className='size-3.5' aria-hidden />
            </a>
          </DetailField>
        )}
        <DetailField label={t('transactionDetailPage.payment.createdAt')}>
          {formatBackendDateTime(wibToIso(detail.created_at), 'dd MMM yyyy, HH:mm:ss')}
        </DetailField>
      </dl>
      {guide && (
        <details className='group border-t border-slate-100 py-2.5'>
          <summary className='cursor-pointer text-xs font-medium text-slate-600 transition-colors hover:text-brand-purple'>
            {t('transactionDetailPage.payment.guide')}
          </summary>
          <p className='mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-600'>{guide}</p>
        </details>
      )}
    </DetailPanel>
  )
}

/** What the customer still needs to pay with, while the payment is open. */
function PayBox({ detail }: { detail: TransactionDetail }) {
  const { t } = useTranslation('common')
  const hasQr = !!(detail.qr_code_url || detail.qr_string)
  const hasAny = hasQr || !!detail.va_number || !!detail.payment_url

  return (
    <div className='my-3 space-y-3 rounded-lg border border-amber-200 bg-amber-50/70 p-4'>
      <div className='flex items-start gap-2.5'>
        <Hourglass className='mt-0.5 size-4 shrink-0 text-amber-600' aria-hidden />
        <div className='min-w-0'>
          <p className='text-sm font-semibold text-amber-900'>{t('transactionDetailPage.payment.awaitingTitle')}</p>
          <p className='text-xs leading-relaxed text-amber-800/80'>
            {hasAny ? t('transactionDetailPage.payment.awaitingBody') : t('transactionDetailPage.payment.noInstructions')}
          </p>
        </div>
      </div>

      {hasQr && (
        <figure className='mx-auto w-fit rounded-md bg-white p-3 shadow-sm'>
          {detail.qr_code_url ? (
            <img src={detail.qr_code_url} alt={t('transactionDetailPage.payment.qrAlt')} className='size-44 object-contain' />
          ) : (
            <QRCodeSVG value={detail.qr_string} size={176} level='M' marginSize={0} title={t('transactionDetailPage.payment.qrAlt')} />
          )}
          <figcaption className='mt-2 text-center text-[11px] text-slate-500'>{t('transactionDetailPage.payment.qrHint')}</figcaption>
        </figure>
      )}

      {detail.va_number && (
        <div className='rounded-md bg-white px-3 py-2.5 shadow-sm'>
          <p className='font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400'>
            {t('transactionDetailPage.payment.vaNumber')}
          </p>
          <div className='flex items-center justify-between gap-2'>
            <span className='min-w-0 font-mono text-lg font-bold tracking-wider text-slate-900 wrap-anywhere'>{detail.va_number}</span>
            <CopyValueButton value={detail.va_number} label={t('transactionDetailPage.payment.vaNumber')} />
          </div>
        </div>
      )}

      {detail.payment_url && (
        <a
          href={detail.payment_url}
          target='_blank'
          rel='noopener noreferrer'
          className='flex h-10 items-center justify-center gap-2 bg-brand-purple px-4 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-opacity hud-clip-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 focus-visible:ring-offset-2'
        >
          {t('transactionDetailPage.payment.openPage')}
          <ExternalLink className='size-3.5' aria-hidden />
        </a>
      )}
    </div>
  )
}
