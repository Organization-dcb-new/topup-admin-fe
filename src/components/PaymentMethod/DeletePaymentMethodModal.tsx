import { useTranslation } from 'react-i18next'

import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog'
import { useDeletePaymentMethod } from '@/hooks/usePaymentMethod'

export function DeletePaymentMethodModal({
  id,
  name,
}: {
  id: string
  name: string
}) {
  const { t } = useTranslation('common')
  const mutation = useDeletePaymentMethod(id)

  return (
    <ConfirmDeleteDialog
      name={name}
      title={t('paymentMethodDelete.title')}
      description={t('paymentMethodDelete.description')}
      triggerAriaLabel={t('paymentMethodDelete.triggerAria', { name })}
      isPending={mutation.isPending}
      onConfirm={(done) => mutation.mutate(undefined, { onSuccess: done })}
    />
  )
}
