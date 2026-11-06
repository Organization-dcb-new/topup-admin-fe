import { useId, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Layers } from 'lucide-react'

import { AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useCreatePaymentCategory, useUpdatePaymentCategory } from '@/hooks/usePaymentMethodCategory'
import { useRetained } from '@/hooks/useRetained'
import { toSlug } from '@/lib/slug'
import { cn } from '@/lib/utils'
import { paymentCategorySchema, type PaymentCategoryFormInput, type PaymentCategoryFormValues } from '@/schemas/payment'
import type { PaymentMethodCategory } from '@/types/payment-method-categories'

interface PaymentCategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: PaymentMethodCategory
  nextSortOrder?: number
}

export function PaymentCategoryFormDialog({ open, onOpenChange, category, nextSortOrder = 1 }: PaymentCategoryFormDialogProps) {
  const target = useRetained(open ? (category ?? 'new') : null)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-xl'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {/* The retained target keeps the form filled while the dialog animates out; Radix unmounts it afterwards, so every opening still starts fresh. */}
        {target && (
          <PaymentCategoryForm
            key={target === 'new' ? 'new' : target.id}
            category={target === 'new' ? undefined : target}
            nextSortOrder={nextSortOrder}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function PaymentCategoryForm({
  category,
  nextSortOrder,
  onDone,
}: {
  category?: PaymentMethodCategory
  nextSortOrder: number
  onDone: () => void
}) {
  const { t } = useTranslation('common')
  const ids = useId()
  const isEdit = !!category
  const create = useCreatePaymentCategory(onDone)
  const update = useUpdatePaymentCategory(onDone)
  const pending = create.isPending || update.isPending
  const [uploading, setUploading] = useState(false)
  // A new category's slug follows its name until the admin edits the slug by hand.
  const slugTouched = useRef(isEdit)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitted },
  } = useForm<PaymentCategoryFormInput, unknown, PaymentCategoryFormValues>({
    resolver: zodResolver(paymentCategorySchema),
    defaultValues: {
      name: category?.name ?? '',
      slug: category?.slug ?? '',
      icon_url: category?.icon_url ?? '',
      sort_order: category?.sort_order ?? nextSortOrder,
      is_active: category?.is_active ?? true,
    },
  })
  const [icon, isActive] = useWatch({ control, name: ['icon_url', 'is_active'] })
  const nameField = register('name')
  const slugField = register('slug')

  const onSubmit = (v: PaymentCategoryFormValues) => {
    const base = { name: v.name, slug: v.slug, icon_url: v.icon_url, sort_order: v.sort_order }
    if (category) update.mutate({ id: category.id, payload: { ...base, is_active: v.is_active } })
    else create.mutate(base)
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <Layers className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{isEdit ? t('paymentCategoryPage.form.editEyebrow') : t('paymentCategoryPage.form.addEyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {isEdit ? t('paymentCategoryPage.form.editTitle') : t('paymentCategoryPage.form.addTitle')}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>{t('paymentCategoryPage.form.description')}</DialogDescription>
        </div>
      </div>

      <div className='grid gap-5 sm:grid-cols-[8rem_minmax(0,1fr)]'>
        <div className='space-y-2'>
          <p id={`${ids}-icon`} className={hudLabelClass}>{t('paymentCategoryPage.form.iconLabel')}</p>
          <ImageDropzone
            value={icon ?? ''}
            onChange={(url) => setValue('icon_url', url, { shouldDirty: true })}
            onUploadingChange={setUploading}
            aspectClassName='aspect-square'
            fit='contain'
            labelledBy={`${ids}-icon`}
            hint={t('imageDropzone.hints.icon')}
          />
        </div>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor={`${ids}-name`} className={hudLabelClass}>{t('paymentCategoryPage.form.nameLabel')}</Label>
            <Input
              id={`${ids}-name`}
              autoFocus
              autoComplete='off'
              placeholder={t('paymentCategoryPage.form.namePlaceholder')}
              aria-invalid={!!errors.name}
              className={hudInputClass}
              {...nameField}
              onChange={(e) => {
                void nameField.onChange(e)
                if (!slugTouched.current) {
                  setValue('slug', toSlug(e.target.value).replace(/-+$/, ''), { shouldValidate: isSubmitted })
                }
              }}
            />
            {errors.name?.message && <FieldMessage tone='error'>{t(errors.name.message)}</FieldMessage>}
          </div>
          <div className='grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem]'>
            <div className='space-y-2'>
              <Label htmlFor={`${ids}-slug`} className={hudLabelClass}>{t('paymentCategoryPage.form.slugLabel')}</Label>
              <Input
                id={`${ids}-slug`}
                autoComplete='off'
                spellCheck={false}
                placeholder='e-wallet'
                aria-invalid={!!errors.slug}
                className={cn(hudInputClass, 'font-mono text-sm')}
                {...slugField}
                onChange={(e) => {
                  slugTouched.current = true
                  e.target.value = toSlug(e.target.value)
                  void slugField.onChange(e)
                }}
              />
              {errors.slug?.message && <FieldMessage tone='error'>{t(errors.slug.message)}</FieldMessage>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor={`${ids}-order`} className={hudLabelClass}>{t('paymentCategoryPage.form.orderLabel')}</Label>
              <Input
                id={`${ids}-order`}
                type='number'
                inputMode='numeric'
                aria-invalid={!!errors.sort_order}
                className={cn(hudInputClass, 'tabular-nums')}
                {...register('sort_order')}
              />
            </div>
          </div>
          {errors.sort_order?.message && <FieldMessage tone='error'>{t(errors.sort_order.message)}</FieldMessage>}
        </div>
      </div>

      {isEdit && (
        <label
          className={cn(
            'flex cursor-pointer items-center justify-between gap-4 rounded-md border px-4 py-3 transition-colors',
            isActive ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
          )}
        >
          <span className='min-w-0'>
            <span className='block text-sm font-medium text-slate-800'>{t('paymentCategoryPage.form.activeLabel')}</span>
            <span className='block text-xs text-slate-500'>{t('paymentCategoryPage.form.activeHint')}</span>
          </span>
          <Switch
            checked={!!isActive}
            onCheckedChange={(checked) => setValue('is_active', checked, { shouldDirty: true })}
            className='data-[state=checked]:bg-emerald-500'
          />
        </label>
      )}

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onDone}
          disabled={pending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('paymentCategoryPage.form.cancel')}
        </button>
        <div className='sm:min-w-52'>
          <AuthSubmitButton pending={pending} pendingLabel={t('paymentCategoryPage.form.saving')} cooldown={0} disabled={uploading}>
            {isEdit ? t('paymentCategoryPage.form.save') : t('paymentCategoryPage.form.create')}
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  )
}
