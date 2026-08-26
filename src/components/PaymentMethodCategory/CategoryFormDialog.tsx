import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'

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
import { Switch } from '@/components/ui/switch'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import {
  paymentCategorySchema,
  type PaymentCategorySchemaValues,
} from '@/schemas/payment-method'
import type { PaymentCategoryFormValues } from '@/types/payment-method-categories'

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initialValues?: Partial<PaymentCategoryFormValues>
  isPending?: boolean
  onSubmit: (values: PaymentCategoryFormValues, done: () => void) => void
}

const EMPTY: PaymentCategoryFormValues = {
  name: '',
  slug: '',
  icon_url: '',
  sort_order: 0,
  is_active: true,
}

/** Slug otomatis dari nama, hanya selama user belum menyuntingnya sendiri. */
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function FormBody({
  mode,
  initialValues,
  isPending,
  onSubmit,
  onOpenChange,
}: Omit<CategoryFormDialogProps, 'open'>) {
  const { t } = useTranslation('common')
  const [isUploading, setIsUploading] = useState(false)
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentCategorySchemaValues>({
    resolver: zodResolver(paymentCategorySchema),
    defaultValues: { ...EMPTY, ...initialValues },
  })

  const iconUrl = watch('icon_url')
  const isActive = watch('is_active')
  const busy = isPending || isUploading

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit(values, () => onOpenChange(false)),
      )}
      className='flex min-h-0 flex-col'
    >
      <div className='min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5'>
        <div className='grid gap-5 sm:grid-cols-2'>
          <div className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='pc-name'>{t('paymentCategoryForm.nameLabel')}</Label>
              <Input
                id='pc-name'
                placeholder={t('paymentCategoryForm.namePlaceholder')}
                disabled={busy}
                aria-invalid={!!errors.name}
                {...register('name', {
                  onChange: (e) => {
                    if (!slugTouched) {
                      setValue('slug', slugify(e.target.value), {
                        shouldValidate: true,
                      })
                    }
                  },
                })}
              />
              {errors.name && (
                <p role='alert' className='text-xs font-medium text-destructive'>
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='pc-slug'>{t('paymentCategoryForm.slugLabel')}</Label>
              <Input
                id='pc-slug'
                placeholder={t('paymentCategoryForm.slugPlaceholder')}
                disabled={busy}
                aria-invalid={!!errors.slug}
                {...register('slug', {
                  onChange: () => setSlugTouched(true),
                })}
              />
              {errors.slug ? (
                <p role='alert' className='text-xs font-medium text-destructive'>
                  {errors.slug.message}
                </p>
              ) : (
                <p className='text-xs text-muted-foreground'>
                  {t('paymentCategoryForm.slugHint')}
                </p>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='pc-sort'>{t('paymentCategoryForm.sortLabel')}</Label>
              <Input
                id='pc-sort'
                type='number'
                step='1'
                inputMode='numeric'
                disabled={busy}
                aria-invalid={!!errors.sort_order}
                {...register('sort_order', { valueAsNumber: true })}
              />
              {errors.sort_order ? (
                <p role='alert' className='text-xs font-medium text-destructive'>
                  {errors.sort_order.message}
                </p>
              ) : (
                <p className='text-xs text-muted-foreground'>
                  {t('paymentCategoryForm.sortHint')}
                </p>
              )}
            </div>
          </div>

          <ImageDropzone
            label={t('paymentCategoryForm.iconLabel')}
            value={iconUrl}
            onChange={(url) =>
              setValue('icon_url', url, { shouldValidate: true })
            }
            onUploadingChange={setIsUploading}
            disabled={isPending}
            error={errors.icon_url?.message}
          />
        </div>

        <div className='flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3'>
          <div className='min-w-0'>
            <Label htmlFor='pc-is_active' className='cursor-pointer'>
              {t('paymentCategoryForm.statusLabel')}
            </Label>
            <p className='text-xs text-muted-foreground'>
              {t('paymentCategoryForm.statusHint')}
            </p>
          </div>
          <Switch
            id='pc-is_active'
            checked={isActive}
            disabled={busy}
            onCheckedChange={(checked) => setValue('is_active', checked)}
          />
        </div>
      </div>

      <DialogFooter className='shrink-0 gap-2 border-t border-border px-6 py-4 sm:gap-2'>
        <Button
          type='button'
          variant='outline'
          className='rounded-lg'
          disabled={busy}
          onClick={() => onOpenChange(false)}
        >
          {t('paymentCategoryForm.cancel')}
        </Button>
        <Button type='submit' className='rounded-lg font-semibold' disabled={busy}>
          {isPending && (
            <Loader2 className='mr-2 h-4 w-4 shrink-0 animate-spin' aria-hidden />
          )}
          {mode === 'create'
            ? t('paymentCategoryForm.create')
            : t('paymentCategoryForm.save')}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  ...rest
}: CategoryFormDialogProps) {
  const { t } = useTranslation('common')

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (rest.isPending) return
        onOpenChange(next)
      }}
    >
      <DialogContent className='flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl'>
        <DialogHeader className='shrink-0 space-y-1 border-b border-border px-6 py-4 text-left'>
          <DialogTitle>
            {rest.mode === 'create'
              ? t('paymentCategoryForm.createTitle')
              : t('paymentCategoryForm.editTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('paymentCategoryForm.description')}
          </DialogDescription>
        </DialogHeader>

        {open && <FormBody {...rest} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  )
}
