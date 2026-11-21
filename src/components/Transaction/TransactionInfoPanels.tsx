import { useTranslation } from 'react-i18next'
import { Fingerprint, Package, UserRound } from 'lucide-react'

import { formatCurrency, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { TransactionDetail, TransactionRowState } from '@/types/transaction'
import { DetailField, DetailPanel, EmptyValue } from './detail-parts'
import { CopyValueButton, ProviderStatusChip } from './TransactionParts'
import { RevealButton, type RevealControls } from './TransactionReveal'
import { accountFields, humanizeKey } from './transaction-meta'

interface PanelProps {
  detail: TransactionDetail
  order?: number
}

/** A value the API masked and the admin hasn't revealed. */
function MaskedValue() {
  const { t } = useTranslation('common')
  return <span className='font-sans text-xs italic text-slate-400'>{t('transactionDetailPage.reveal.masked')}</span>
}

/** The product bought. Margin and provider status come with the detail; older backends only sent them on the list row. */
export function TransactionItemPanel({ detail, row, order, reveal }: PanelProps & { row?: TransactionRowState; reveal: RevealControls }) {
  const { t } = useTranslation('common')
  const item = detail.order_item
  const sku = item?.product_sku || detail.sku
  const voucher = item?.voucher_code
  // Revealed: every code the order got. Otherwise the API's `••••1234` (or the real code from older backends).
  const vouchers = reveal.data ? reveal.data.voucher_codes.filter(Boolean) : voucher ? [voucher] : []
  const voucherHidden = reveal.masked && !reveal.data
  const orderTotal = detail.order?.total_amount
  const rawMargin = item?.margin ?? row?.margin
  // Unpaid payments carry a zero margin, which is noise rather than a number.
  const margin = rawMargin === 0 && detail.status !== 'PAID' ? undefined : rawMargin
  const providerStatus = item?.status_provider ?? row?.status_provider
  const fromBackend = item?.status_provider !== undefined

  return (
    <DetailPanel
      icon={Package}
      title={t('transactionDetailPage.item.title')}
      order={order}
      footer={row || fromBackend ? undefined : t('transactionDetailPage.item.fromListHint')}
    >
      <dl>
        <DetailField label={t('transactionDetailPage.item.product')}>{item?.product_name || <EmptyValue />}</DetailField>
        <DetailField label={t('transactionDetailPage.item.sku')} copy={sku || undefined} mono>
          {sku || <EmptyValue />}
        </DetailField>
        <DetailField label={t('transactionDetailPage.item.quantity')}>{formatNumber(item?.quantity ?? 0)}</DetailField>
        <DetailField label={t('transactionDetailPage.item.unitPrice')}>{formatCurrency(item?.unit_price ?? 0)}</DetailField>
        <DetailField label={t('transactionDetailPage.item.subtotal')}>{formatCurrency(item?.subtotal ?? 0)}</DetailField>
        {!!orderTotal && orderTotal !== detail.amount && (
          <DetailField label={t('transactionDetailPage.item.orderTotal')}>{formatCurrency(orderTotal)}</DetailField>
        )}
        {vouchers.length === 1 && (
          <DetailField label={t('transactionDetailPage.item.voucher')} copy={voucherHidden ? undefined : vouchers[0]} mono>
            <span className='inline-flex flex-wrap items-center justify-end gap-2'>
              {vouchers[0]}
              <RevealButton controls={reveal} />
            </span>
          </DetailField>
        )}
        {vouchers.length > 1 && (
          <DetailField label={t('transactionDetailPage.item.vouchers', { count: vouchers.length })} mono>
            <span className='flex flex-col items-end gap-1'>
              {vouchers.map((code, index) => (
                <span key={`${index}-${code}`} className='inline-flex items-center gap-1'>
                  {code}
                  <CopyValueButton value={code} label={t('transactionDetailPage.item.voucher')} className='-my-1' />
                </span>
              ))}
            </span>
          </DetailField>
        )}
        <DetailField label={t('transactionDetailPage.item.paid')} emphasis>
          {formatCurrency(detail.amount)}
        </DetailField>
        <DetailField label={t('transactionDetailPage.item.margin')}>
          {margin === undefined ? (
            <EmptyValue />
          ) : (
            <span className={cn('font-semibold tabular-nums', margin < 0 ? 'text-rose-600' : 'text-emerald-600')}>{formatCurrency(margin)}</span>
          )}
        </DetailField>
        <DetailField label={t('transactionDetailPage.item.providerStatus')}>
          <ProviderStatusChip status={providerStatus} />
        </DetailField>
      </dl>
    </DetailPanel>
  )
}

/** Who paid, and the game account the top-up went to. Masked by the API until revealed. */
export function TransactionCustomerPanel({ detail, order, reveal }: PanelProps & { reveal: RevealControls }) {
  const { t } = useTranslation('common')
  const shown = reveal.data
  const hidden = reveal.masked && !shown
  const email = shown ? shown.customer_email : detail.order?.customer_email || detail.email
  const ip = shown ? shown.client_ip : detail.order?.ip_address
  const fields = accountFields(shown ? shown.meta_data : detail.order?.meta_data)

  const footer = shown
    ? t('transactionDetailPage.reveal.shownNote')
    : fields.length
      ? undefined
      : hidden
        ? t(reveal.canReveal ? 'transactionDetailPage.reveal.accountHidden' : 'transactionDetailPage.reveal.accountHiddenNoAccess')
        : t('transactionDetailPage.customer.noAccount')

  return (
    <DetailPanel
      icon={UserRound}
      title={t('transactionDetailPage.customer.title')}
      order={order}
      action={<RevealButton controls={reveal} />}
      footer={footer}
    >
      <dl>
        <DetailField label={t('transactionDetailPage.customer.email')} copy={!hidden && email ? email : undefined}>
          {email || <EmptyValue />}
        </DetailField>
        {fields.map((field) => (
          <DetailField key={field.key} label={humanizeKey(field.key)} copy={field.value} mono>
            {field.value}
          </DetailField>
        ))}
        <DetailField label={t('transactionDetailPage.customer.ip')} copy={ip || undefined} mono>
          {ip || (hidden ? <MaskedValue /> : <EmptyValue />)}
        </DetailField>
      </dl>
    </DetailPanel>
  )
}

/** Every identifier support may be asked about, ready to copy. */
export function TransactionReferencePanel({ detail, order }: PanelProps) {
  const { t } = useTranslation('common')
  const refs = [
    { key: 'transactionId', value: detail.id },
    { key: 'orderNumber', value: detail.order?.order_number },
    { key: 'orderId', value: detail.order_id },
    { key: 'providerRef', value: detail.order?.tid },
    { key: 'paymentMethodId', value: detail.payment_method_id },
  ]

  return (
    <DetailPanel icon={Fingerprint} title={t('transactionDetailPage.refs.title')} order={order}>
      <dl>
        {refs.map((ref) => (
          <DetailField key={ref.key} label={t(`transactionDetailPage.refs.${ref.key}`)} copy={ref.value || undefined} mono stacked>
            {ref.value || <EmptyValue />}
          </DetailField>
        ))}
      </dl>
    </DetailPanel>
  )
}
