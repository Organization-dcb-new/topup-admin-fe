import { useTranslation } from 'react-i18next'
import { Fingerprint, Package, UserRound } from 'lucide-react'

import { formatCurrency, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { TransactionDetail, TransactionRowState } from '@/types/transaction'
import { DetailField, DetailPanel, EmptyValue } from './detail-parts'
import { ProviderStatusChip } from './TransactionParts'
import { accountFields, humanizeKey } from './transaction-meta'

interface PanelProps {
  detail: TransactionDetail
  order?: number
}

/** The product bought; margin and provider status only exist on the list row, so they come along from there. */
export function TransactionItemPanel({ detail, row, order }: PanelProps & { row?: TransactionRowState }) {
  const { t } = useTranslation('common')
  const item = detail.order_item
  const sku = item?.product_sku || detail.sku
  const voucher = item?.voucher_code
  const orderTotal = detail.order?.total_amount
  // Unpaid payments carry a zero margin, which is noise rather than a number.
  const margin = row?.margin === 0 && detail.status !== 'PAID' ? undefined : row?.margin

  return (
    <DetailPanel
      icon={Package}
      title={t('transactionDetailPage.item.title')}
      order={order}
      footer={row ? undefined : t('transactionDetailPage.item.fromListHint')}
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
        {voucher && (
          <DetailField label={t('transactionDetailPage.item.voucher')} copy={voucher} mono>
            {voucher}
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
          <ProviderStatusChip status={row?.status_provider} />
        </DetailField>
      </dl>
    </DetailPanel>
  )
}

/** Who paid, and the game account the top-up went to. */
export function TransactionCustomerPanel({ detail, order }: PanelProps) {
  const { t } = useTranslation('common')
  const email = detail.order?.customer_email || detail.email
  const ip = detail.order?.ip_address
  const fields = accountFields(detail.order?.meta_data)

  return (
    <DetailPanel
      icon={UserRound}
      title={t('transactionDetailPage.customer.title')}
      order={order}
      footer={fields.length ? undefined : t('transactionDetailPage.customer.noAccount')}
    >
      <dl>
        <DetailField label={t('transactionDetailPage.customer.email')} copy={email || undefined}>
          {email || <EmptyValue />}
        </DetailField>
        {fields.map((field) => (
          <DetailField key={field.key} label={humanizeKey(field.key)} copy={field.value} mono>
            {field.value}
          </DetailField>
        ))}
        <DetailField label={t('transactionDetailPage.customer.ip')} copy={ip || undefined} mono>
          {ip || <EmptyValue />}
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
