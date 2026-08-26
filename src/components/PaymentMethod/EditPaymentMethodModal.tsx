import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PaymentMethodFormDialog } from './PaymentMethodFormDialog'
import { useUpdatePaymentMethod } from '@/hooks/usePaymentMethod'
import type { PaymentMethod } from '@/types/payment-method'

export function EditPaymentMethodModal({
  paymentMethod,
}: {
  paymentMethod: PaymentMethod
}) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const mutation = useUpdatePaymentMethod(paymentMethod.id)

  return (
    <>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground'
        onClick={() => setOpen(true)}
        aria-label={t('paymentMethodForm.editAria', { name: paymentMethod.name })}
      >
        <Pencil className='h-4 w-4' aria-hidden />
      </Button>

      <PaymentMethodFormDialog
        open={open}
        onOpenChange={setOpen}
        mode='edit'
        isPending={mutation.isPending}
        initialValues={{
          name: paymentMethod.name,
          code: paymentMethod.code,
          type: paymentMethod.type,
          provider: paymentMethod.provider,
          icon_url: paymentMethod.icon_url,
          fee_percentage: paymentMethod.fee_percentage,
          fee_fixed: paymentMethod.fee_fixed,
          min_amount: paymentMethod.min_amount,
          max_amount: paymentMethod.max_amount,
          sort_order: paymentMethod.sort_order,
          is_active: paymentMethod.is_active,
        }}
        onSubmit={(values, done) =>
          mutation.mutate(values, { onSuccess: done })
        }
      />
    </>
  )
}
