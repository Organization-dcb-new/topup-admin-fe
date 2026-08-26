import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PaymentMethodFormDialog } from './PaymentMethodFormDialog'
import { useCreatePaymentMethod } from '@/hooks/usePaymentMethod'

export default function ModalAddPaymentMethod() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const mutation = useCreatePaymentMethod()

  return (
    <>
      <Button
        type='button'
        className='w-full gap-2 rounded-lg font-semibold sm:w-auto'
        onClick={() => setOpen(true)}
      >
        <Plus className='h-4 w-4 shrink-0' aria-hidden />
        {t('paymentMethodForm.trigger')}
      </Button>

      <PaymentMethodFormDialog
        open={open}
        onOpenChange={setOpen}
        mode='create'
        isPending={mutation.isPending}
        onSubmit={(values, done) =>
          mutation.mutate(values, { onSuccess: done })
        }
      />
    </>
  )
}
