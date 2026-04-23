import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type CategoryProduct, useUpdateCategoryProduct } from '@/hooks/useCategoryProduct'

type FormValues = {
  name: string
}

export function UpdateCategoryProduct({ category }: { category: CategoryProduct }) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const nameId = useId()

  const { register, handleSubmit, reset } = useForm<FormValues>()

  useEffect(() => {
    if (!open) return

    reset({
      name: category.name,
    })
  }, [open, category, reset])

  const mutation = useUpdateCategoryProduct(category.id, reset, setOpen)

  return (
    <>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        onClick={() => setOpen(true)}
        className='cursor-pointer'
        aria-label={t('categoryProductUpdate.triggerAria', { name: category.name })}
      >
        <Pencil className='h-4 w-4' aria-hidden />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='rounded-xl sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('categoryProductUpdate.title')}</DialogTitle>
            <DialogDescription>
              {t('categoryProductUpdate.description')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor={nameId}>{t('categoryProductUpdate.nameLabel')}</Label>
              <Input id={nameId} autoComplete='off' {...register('name', { required: true })} />
            </div>

            <DialogFooter className='gap-2 sm:gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
                className='cursor-pointer rounded-xl'
              >
                {t('categoryProductUpdate.cancel')}
              </Button>

              <Button
                type='submit'
                disabled={mutation.isPending}
                className='inline-flex cursor-pointer items-center gap-2 rounded-xl'
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 shrink-0 animate-spin' aria-hidden />
                    {t('categoryProductUpdate.saving')}
                  </>
                ) : (
                  t('categoryProductUpdate.save')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
