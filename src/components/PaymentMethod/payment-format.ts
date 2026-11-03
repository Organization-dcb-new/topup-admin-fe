import type { TFunction } from 'i18next'

import { formatCurrency } from '@/lib/format'
import type { PaymentMethod } from '@/types/payment-method'

type FeeFields = Pick<PaymentMethod, 'fee_percentage' | 'fee_fixed'>
type LimitFields = Pick<PaymentMethod, 'min_amount' | 'max_amount'>

function formatPercent(value: number) {
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`
}

/** "0.7% + Rp1,000", "Rp2,500", "0.7%" or "Free". */
export function formatFee({ fee_percentage, fee_fixed }: FeeFields, t: TFunction) {
  const parts = []
  if (fee_percentage) parts.push(formatPercent(fee_percentage))
  if (fee_fixed) parts.push(formatCurrency(fee_fixed))
  return parts.length ? parts.join(' + ') : t('paymentMethodPage.feeFree')
}

/** What the customer pays on top of `amount`. */
export function feeFor({ fee_percentage, fee_fixed }: FeeFields, amount: number) {
  return Math.round((amount * (fee_percentage || 0)) / 100 + (fee_fixed || 0))
}

/** A zero maximum means there is no upper limit. */
export function formatLimit({ min_amount, max_amount }: LimitFields, t: TFunction) {
  if (!min_amount && !max_amount) return t('paymentMethodPage.limitNone')
  if (!max_amount) return t('paymentMethodPage.limitFrom', { min: formatCurrency(min_amount) })
  return `${formatCurrency(min_amount)} – ${formatCurrency(max_amount)}`
}
