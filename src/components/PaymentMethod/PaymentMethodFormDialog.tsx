import { useId, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { CreditCard } from 'lucide-react'

import { AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useCreatePaymentMethod, useUpdatePaymentMethod } from '@/hooks/usePaymentMethod'
import { useRetained } from '@/hooks/useRetained'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { paymentMethodSchema, type PaymentMethodFormInput, type PaymentMethodFormValues } from '@/schemas/payment'
import type { PaymentMethod } from '@/types/payment-method'
import { feeFor } from './payment-format'

const SAMPLE_AMOUNT = 100_000

interface PaymentMethodFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  method?: PaymentMethod
  /** Existing values offered as suggestions, so spellings stay consistent. */
  suggestions: { types: string[]; providers: string[] }
  nextSortOrder?: number
}

export function PaymentMethodFormDialog({ open, onOpenChange, method, suggestions, nextSortOrder = 1 }: PaymentMethodFormDialogProps) {
  const target = useRetained(open ? (method ?? 'new') : null)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-2xl'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {/* The retained target keeps the form filled while the dialog animates out; Radix unmounts it afterwards, so every opening still starts fresh. */}
        {target && (
          <PaymentMethodForm
            key={target === 'new' ? 'new' : target.id}
            method={target === 'new' ? undefined : target}
            suggestions={suggestions}
            nextSortOrder={nextSortOrder}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface PaymentMethodFormProps {
  method?: PaymentMethod
  suggestions: { types: string[]; providers: string[] }
  nextSortOrder: number
  onDone: () => void
}

function PaymentMethodForm({ method, suggestions, nextSortOrder, onDone }: PaymentMethodFormProps) {
  const { t } = useTranslation('common')
  const ids = useId()
  const isEdit = !!method
  const create = useCreatePaymentMethod(onDone)
  const update = useUpdatePaymentMethod(onDone)
  const pending = create.isPending || update.isPending
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<PaymentMethodFormInput, unknown, PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: method?.name ?? '',
      code: method?.code ?? '',
      type: method?.type ?? '',
      provider: method?.provider ?? '',
      icon_url: method?.icon_url ?? '',
      fee_percentage: method?.fee_percentage ?? 0,
      fee_fixed: method?.fee_fixed ?? 0,
      min_amount: method?.min_amount ?? 10_000,
      max_amount: method?.max_amount ?? 0,
      sort_order: method?.sort_order ?? nextSortOrder,
      is_active: method?.is_active ?? true,
      config: '{}',
    },
  })
  const [icon, feePct, feeFixed, isActive] = useWatch({ control, name: ['icon_url', 'fee_percentage', 'fee_fixed', 'is_active'] })
  const sampleFee = feeFor({ fee_percentage: Number(feePct) || 0, fee_fixed: Number(feeFixed) || 0 }, SAMPLE_AMOUNT)

  const onSubmit = (v: PaymentMethodFormValues) => {
    const base = {
      name: v.name,
      code: v.code,
      type: v.type,
      provider: v.provider,
      icon_url: v.icon_url,
      fee_percentage: v.fee_percentage,
      fee_fixed: v.fee_fixed,
      min_amount: v.min_amount,
      max_amount: v.max_amount,
      sort_order: v.sort_order,
    }
    if (method) update.mutate({ id: method.id, payload: { ...base, is_active: v.is_active } })
    else create.mutate({ ...base, config: JSON.stringify(JSON.parse(v.config)) })
  }

  const field = (name: 'name' | 'code' | 'type' | 'provider', extra?: string) => ({
    id: `${ids}-${name}`,
    'aria-invalid': !!errors[name],
    autoComplete: 'off',
    className: cn(hudInputClass, extra),
    ...register(name),
  })
  const numberField = (name: 'fee_percentage' | 'fee_fixed' | 'min_amount' | 'max_amount' | 'sort_order') => ({
    id: `${ids}-${name}`,
    type: 'number',
    inputMode: 'decimal' as const,
    min: name === 'sort_order' ? undefined : 0,
    step: 'any',
    'aria-invalid': !!errors[name],
    className: cn(hudInputClass, 'tabular-nums'),
    ...register(name),
  })
  const message = (key: keyof PaymentMethodFormValues) => {
    const m = errors[key]?.message
    return m ? <FieldMessage tone='error'>{t(m)}</FieldMessage> : null
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <CreditCard className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{isEdit ? t('paymentMethodPage.form.editEyebrow') : t('paymentMethodPage.form.addEyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {isEdit ? t('paymentMethodPage.form.editTitle') : t('paymentMethodPage.form.addTitle')}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>{t('paymentMethodPage.form.description')}</DialogDescription>
        </div>
      </div>

      <section className='grid gap-5 sm:grid-cols-[8rem_minmax(0,1fr)]'>
        <div className='space-y-2'>
          <p id={`${ids}-icon`} className={hudLabelClass}>{t('paymentMethodPage.form.iconLabel')}</p>
          <ImageDropzone
            value={icon ?? ''}
            onChange={(url) => setValue('icon_url', url, { shouldDirty: true })}
            onUploadingChange={setUploading}
            aspectClassName='aspect-square'
            fit='contain'
            labelledBy={`${ids}-icon`}
            hint={t('imageDropzone.formatsShort')}
          />
        </div>
        <div className='grid content-start gap-4 sm:grid-cols-2'>
          <div className='space-y-2 sm:col-span-2'>
            <Label htmlFor={`${ids}-name`} className={hudLabelClass}>{t('paymentMethodPage.form.nameLabel')}</Label>
            <Input autoFocus placeholder='QRIS' {...field('name')} />
            {message('name')}
          </div>
          <div className='space-y-2'>
            <Label htmlFor={`${ids}-code`} className={hudLabelClass}>{t('paymentMethodPage.form.codeLabel')}</Label>
            <Input spellCheck={false} placeholder='qris' {...field('code', 'font-mono text-sm')} />
            {message('code')}
          </div>
          <div className='space-y-2'>
            <Label htmlFor={`${ids}-type`} className={hudLabelClass}>{t('paymentMethodPage.form.typeLabel')}</Label>
            <Input list={`${ids}-types`} placeholder='EWALLET' {...field('type')} />
            <datalist id={`${ids}-types`}>
              {suggestions.types.map((v) => <option key={v} value={v} />)}
            </datalist>
            {message('type')}
          </div>
          <div className='space-y-2 sm:col-span-2'>
            <Label htmlFor={`${ids}-provider`} className={hudLabelClass}>{t('paymentMethodPage.form.providerLabel')}</Label>
            <Input list={`${ids}-providers`} placeholder='Tripay' {...field('provider')} />
            <datalist id={`${ids}-providers`}>
              {suggestions.providers.map((v) => <option key={v} value={v} />)}
            </datalist>
            {message('provider')}
          </div>
        </div>
      </section>

      <section className='space-y-3'>
        <p className={hudLabelClass}>{t('paymentMethodPage.form.feeSection')}</p>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-1.5'>
            <Label htmlFor={`${ids}-fee_percentage`} className='text-xs font-medium text-slate-500'>{t('paymentMethodPage.form.feePercentLabel')}</Label>
            <div className='relative'>
              <Input {...numberField('fee_percentage')} className={cn(hudInputClass, 'pr-9 tabular-nums')} />
              <span className='pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-slate-400'>%</span>
            </div>
            {message('fee_percentage')}
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor={`${ids}-fee_fixed`} className='text-xs font-medium text-slate-500'>{t('paymentMethodPage.form.feeFixedLabel')}</Label>
            <div className='relative'>
              <span className='pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-slate-400'>Rp</span>
              <Input {...numberField('fee_fixed')} className={cn(hudInputClass, 'pl-10 tabular-nums')} />
            </div>
            {message('fee_fixed')}
          </div>
        </div>
        <p className='rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600'>
          {t('paymentMethodPage.form.feeExample', { amount: formatCurrency(SAMPLE_AMOUNT), fee: formatCurrency(sampleFee) })}
        </p>
      </section>

      <section className='space-y-3'>
        <p className={hudLabelClass}>{t('paymentMethodPage.form.limitSection')}</p>
        <div className='grid gap-4 sm:grid-cols-3'>
          <div className='space-y-1.5'>
            <Label htmlFor={`${ids}-min_amount`} className='text-xs font-medium text-slate-500'>{t('paymentMethodPage.form.minLabel')}</Label>
            <Input {...numberField('min_amount')} />
            {message('min_amount')}
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor={`${ids}-max_amount`} className='text-xs font-medium text-slate-500'>{t('paymentMethodPage.form.maxLabel')}</Label>
            <Input {...numberField('max_amount')} />
            {message('max_amount') ?? <p className='text-[11px] text-slate-400'>{t('paymentMethodPage.form.maxHint')}</p>}
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor={`${ids}-sort_order`} className='text-xs font-medium text-slate-500'>{t('paymentMethodPage.form.orderLabel')}</Label>
            <Input {...numberField('sort_order')} inputMode='numeric' />
            {message('sort_order')}
          </div>
        </div>
      </section>

      {isEdit ? (
        <label
          className={cn(
            'flex cursor-pointer items-center justify-between gap-4 rounded-md border px-4 py-3 transition-colors',
            isActive ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
          )}
        >
          <span className='min-w-0'>
            <span className='block text-sm font-medium text-slate-800'>{t('paymentMethodPage.form.activeLabel')}</span>
            <span className='block text-xs text-slate-500'>{t('paymentMethodPage.form.activeHint')}</span>
          </span>
          <Switch
            checked={!!isActive}
            onCheckedChange={(checked) => setValue('is_active', checked, { shouldDirty: true })}
            className='data-[state=checked]:bg-emerald-500'
          />
        </label>
      ) : (
        <section className='space-y-2'>
          <Label htmlFor={`${ids}-config`} className={hudLabelClass}>{t('paymentMethodPage.form.configLabel')}</Label>
          <Textarea
            id={`${ids}-config`}
            rows={3}
            spellCheck={false}
            aria-invalid={!!errors.config}
            className='resize-y rounded-md border-slate-200 bg-slate-950 font-mono text-xs leading-relaxed text-slate-100'
            {...register('config')}
          />
          {message('config') ?? <p className='text-xs text-slate-500'>{t('paymentMethodPage.form.configHint')}</p>}
        </section>
      )}

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onDone}
          disabled={pending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('paymentMethodPage.form.cancel')}
        </button>
        <div className='sm:min-w-52'>
          <AuthSubmitButton pending={pending} pendingLabel={t('paymentMethodPage.form.saving')} cooldown={0} disabled={uploading}>
            {isEdit ? t('paymentMethodPage.form.save') : t('paymentMethodPage.form.create')}
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  )
}
