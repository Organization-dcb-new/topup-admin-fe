import { useTranslation } from 'react-i18next'

import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog'
import { useDeletePaymentCategory } from '@/hooks/usePaymentMethodCategory'

export function DeletePaymentCategory({
  id,
  name,
}: {
  id: string
  name: string
}) {
  const { t } = useTranslation('common')
  const mutation = useDeletePaymentCategory(id)

  return (
    <ConfirmDeleteDialog
      name={name}
      title={t('paymentCategoryDelete.title')}
      description={t('paymentCategoryDelete.description')}
      triggerAriaLabel={t('paymentCategoryDelete.triggerAria', { name })}
      isPending={mutation.isPending}
      onConfirm={(done) => mutation.mutate(undefined, { onSuccess: done })}
    />
  )
}
