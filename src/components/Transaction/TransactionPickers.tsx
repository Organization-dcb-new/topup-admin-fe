import { useTranslation } from 'react-i18next'
import { CreditCard, Gamepad2 } from 'lucide-react'

import { useGetGameNames } from '@/hooks/useGame'
import { useGetPaymentMethods } from '@/hooks/usePaymentMethod'
import { OptionPicker } from './TransactionParts'

/*
 * Each picker owns its query, so it only fetches once it is on screen; callers render it only for
 * admins with the matching view permission (otherwise the request just earns a "forbidden" toast).
 */

interface FieldProps {
  id?: string
  value: string
  onChange: (id: string) => void
}

export function GameField({ id, value, onChange }: FieldProps) {
  const { t } = useTranslation('common')
  const games = useGetGameNames()
  return (
    <OptionPicker
      id={id}
      icon={Gamepad2}
      options={(games.data ?? []).map((g) => ({ id: g.id, name: g.name }))}
      loading={games.isLoading}
      value={value}
      onChange={onChange}
      placeholder={t('transactionPage.filters.game')}
      allLabel={t('transactionPage.filters.allGames')}
      searchPlaceholder={t('transactionPage.filters.searchGames')}
      emptyLabel={t('transactionPage.filters.noOptions')}
    />
  )
}

export function PaymentMethodField({ id, value, onChange }: FieldProps) {
  const { t } = useTranslation('common')
  const methods = useGetPaymentMethods(1, 200)
  return (
    <OptionPicker
      id={id}
      icon={CreditCard}
      options={(methods.data?.data ?? []).map((m) => ({ id: m.id, name: m.name, hint: m.code }))}
      loading={methods.isLoading}
      value={value}
      onChange={onChange}
      placeholder={t('transactionPage.filters.paymentMethod')}
      allLabel={t('transactionPage.filters.allPaymentMethods')}
      searchPlaceholder={t('transactionPage.filters.searchPaymentMethods')}
      emptyLabel={t('transactionPage.filters.noOptions')}
    />
  )
}
