import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CategoryFormDialog } from './CategoryFormDialog'
import { useCreatePaymentCategory } from '@/hooks/usePaymentMethodCategory'

export function CreatePaymentCategoryModal() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const mutation = useCreatePaymentCategory()

  return (
    <>
      <Button
        type='button'
        className='w-full gap-2 rounded-lg font-semibold sm:w-auto'
        onClick={() => setOpen(true)}
      >
        <Plus className='h-4 w-4 shrink-0' aria-hidden />
        {t('paymentCategoryForm.trigger')}
      </Button>

      <CategoryFormDialog
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
