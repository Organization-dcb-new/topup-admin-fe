import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CategoryFormDialog } from './CategoryFormDialog'
import { useUpdatePaymentCategory } from '@/hooks/usePaymentMethodCategory'
import type { PaymentMethodCategory } from '@/types/payment-method-categories'

export function EditPaymentCategoryModal({
  category,
}: {
  category: PaymentMethodCategory
}) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const mutation = useUpdatePaymentCategory(category.id)

  return (
    <>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground'
        onClick={() => setOpen(true)}
        aria-label={t('paymentCategoryForm.editAria', { name: category.name })}
      >
        <Pencil className='h-4 w-4' aria-hidden />
      </Button>

      <CategoryFormDialog
        open={open}
        onOpenChange={setOpen}
        mode='edit'
        isPending={mutation.isPending}
        initialValues={{
          name: category.name,
          slug: category.slug,
          icon_url: category.icon_url,
          sort_order: category.sort_order,
          is_active: category.is_active,
        }}
        onSubmit={(values, done) =>
          mutation.mutate(values, { onSuccess: done })
        }
      />
    </>
  )
}
