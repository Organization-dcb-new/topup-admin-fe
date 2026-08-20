import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Loader2, Pencil, UploadCloud } from 'lucide-react'
import type { FormValuesPaymentMethodEdit, PaymentMethod } from '@/types/payment-method'
import { useEditPaymentMethod } from '@/hooks/usePaymentMethod'
import { handleFileAutoUpload } from '@/helpers/upload'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import {
  pmBtn,
  pmDialog,
  pmDialogDesc,
  pmDialogHeader,
  pmDialogIcon,
  pmDialogTitle,
  pmDrop,
  pmError,
  pmField,
  pmHint,
  pmIconBtn,
  pmLabel,
  pmProgress,
  pmSwitch,
  pmSwitchRow,
} from './styles'

export type PropsEditPaymentMethodModal = {
  paymentMethod: PaymentMethod
}

export function EditPaymentMethodModal({ paymentMethod }: PropsEditPaymentMethodModal) {
  const { t } = useTranslation('common')
  const inputRef = useRef<HTMLInputElement>(null)
  const defaultPreview = useRef<string | null>(null)
  const [open, setOpen] = useState(false)

  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValuesPaymentMethodEdit>()

  useEffect(() => {
    if (!open || !paymentMethod) return

    reset({
      name: paymentMethod.name,
      code: paymentMethod.code,
      type: paymentMethod.type,
      provider: paymentMethod.provider,
      icon_url: paymentMethod.icon_url,
      fee_fixed: paymentMethod.fee_fixed,
      fee_percentage: paymentMethod.fee_percentage,
      min_amount: paymentMethod.min_amount,
      max_amount: paymentMethod.max_amount,
      sort_order: paymentMethod.sort_order,
      is_active: paymentMethod.is_active,
    })

    setPreview(paymentMethod.icon_url)
    defaultPreview.current = paymentMethod.icon_url
  }, [open, paymentMethod, reset])

  const handleFile = (file: File) => {
    handleFileAutoUpload({
      file,
      setPreview,
      setIsUploading,
      setUploadProgress,
      setValue: (_field, value, options) => {
        setValue('icon_url', value, options)
      },
      fieldName: 'icon_url',
    })
  }

  const updatePaymentMethodMutation = useEditPaymentMethod(paymentMethod.id, setOpen)

  return (
    <div>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className={cn(pmIconBtn, 'bg-[#ffd84d]')}
        aria-label={t('paymentMethodEdit.triggerAria', { name: paymentMethod.name })}
      >
        <Pencil className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn(pmDialog, 'max-h-[min(90vh,46rem)] overflow-y-auto sm:max-w-3xl')}
          showCloseButton={false}
        >
          <div className={cn(pmDialogHeader, 'bg-[#ffd84d]')}>
            <DialogHeader className='gap-2 text-left'>
              <div className='flex items-center gap-2.5'>
                <span className={pmDialogIcon}>
                  <Pencil className='h-4 w-4' strokeWidth={3} aria-hidden />
                </span>
                <DialogTitle className={pmDialogTitle}>{t('paymentMethodEdit.title')}</DialogTitle>
              </div>
              <DialogDescription className={pmDialogDesc}>
                {t('paymentMethodEdit.description')}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form
            onSubmit={handleSubmit((v) => updatePaymentMethodMutation.mutate(v))}
            className='space-y-5 px-5 py-5'
          >
            <input type='hidden' {...register('icon_url', { required: t('paymentMethodEdit.iconRequired') })} />

            <div className='flex w-full flex-col gap-5 md:flex-row'>
              <div className='flex w-full flex-col gap-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor={`pm-edit-name-${paymentMethod.id}`} className={pmLabel}>
                    {t('paymentMethodEdit.nameLabel')}
                  </Label>
                  <Input
                    id={`pm-edit-name-${paymentMethod.id}`}
                    {...register('name', { required: t('paymentMethodEdit.nameRequired') })}
                    aria-invalid={!!errors.name}
                    className={cn(pmField, errors.name && 'nb-invalid')}
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor={`pm-edit-code-${paymentMethod.id}`} className={pmLabel}>
                    {t('paymentMethodEdit.codeLabel')}
                  </Label>
                  <Input
                    id={`pm-edit-code-${paymentMethod.id}`}
                    {...register('code', { required: t('paymentMethodEdit.codeRequired') })}
                    aria-invalid={!!errors.code}
                    className={cn(pmField, errors.code && 'nb-invalid')}
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor={`pm-edit-type-${paymentMethod.id}`} className={pmLabel}>
                    {t('paymentMethodEdit.typeLabel')}
                  </Label>
                  <Input
                    id={`pm-edit-type-${paymentMethod.id}`}
                    {...register('type', { required: t('paymentMethodEdit.typeRequired') })}
                    placeholder={t('paymentMethodEdit.typePlaceholder')}
                    aria-invalid={!!errors.type}
                    className={cn(pmField, errors.type && 'nb-invalid')}
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor={`pm-edit-provider-${paymentMethod.id}`} className={pmLabel}>
                    {t('paymentMethodEdit.providerLabel')}
                  </Label>
                  <Input
                    id={`pm-edit-provider-${paymentMethod.id}`}
                    {...register('provider', { required: t('paymentMethodEdit.providerRequired') })}
                    placeholder={t('paymentMethodEdit.providerPlaceholder')}
                    aria-invalid={!!errors.provider}
                    className={cn(pmField, errors.provider && 'nb-invalid')}
                  />
                </div>

                <div className='space-y-2'>
                  <Label className={pmLabel}>{t('paymentMethodEdit.iconLabel')}</Label>

                  <div
                    role='button'
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        inputRef.current?.click()
                      }
                    }}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const file = e.dataTransfer.files[0]
                      if (file) handleFile(file)
                    }}
                    aria-busy={isUploading}
                    aria-invalid={!!errors.icon_url}
                    className={cn(
                      pmDrop,
                      isUploading && 'pointer-events-none opacity-60',
                      errors.icon_url && 'nb-invalid',
                    )}
                  >
                    {preview ? (
                      <img src={preview} alt='' className='h-full w-full object-contain p-2' />
                    ) : (
                      <div className='flex flex-col items-center gap-2 text-center'>
                        <span className='nb-frame nb-frame-thin nb-sd-sm flex h-12 w-12 items-center justify-center bg-[#6fe3f5]'>
                          <UploadCloud className='h-6 w-6' strokeWidth={2.5} aria-hidden />
                        </span>
                        <span className='max-w-[16rem] text-xs font-bold leading-relaxed text-[#111]/70'>
                          {t('paymentMethodEdit.iconDropHint')}
                        </span>
                      </div>
                    )}

                    {isUploading && (
                      <div className='absolute inset-0 flex items-center justify-center bg-[#f5f1e8]/95 text-xs font-black uppercase tracking-[0.12em]'>
                        {t('paymentMethodEdit.uploading', { percent: uploadProgress })}
                      </div>
                    )}
                  </div>

                  <Input
                    ref={inputRef}
                    type='file'
                    accept='image/*,.svg'
                    className='hidden'
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) {
                        setPreview(defaultPreview.current)
                        return
                      }
                      handleFile(file)
                      e.target.value = ''
                    }}
                  />

                  {isUploading && <Progress value={uploadProgress} className={pmProgress} />}

                  {errors.icon_url && (
                    <p className={pmError} role='alert'>
                      {errors.icon_url.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='flex w-full flex-col gap-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor={`pm-edit-fee-pct-${paymentMethod.id}`} className={pmLabel}>
                    {t('paymentMethodEdit.feePercentLabel')}
                  </Label>
                  <Input
                    id={`pm-edit-fee-pct-${paymentMethod.id}`}
                    type='number'
                    step='0.01'
                    {...register('fee_percentage', {
                      valueAsNumber: true,
                      min: 0,
                    })}
                    className={pmField}
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor={`pm-edit-fee-fixed-${paymentMethod.id}`} className={pmLabel}>
                    {t('paymentMethodEdit.feeFixedLabel')}
                  </Label>
                  <Input
                    id={`pm-edit-fee-fixed-${paymentMethod.id}`}
                    type='number'
                    {...register('fee_fixed', {
                      valueAsNumber: true,
                      min: 0,
                    })}
                    className={pmField}
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor={`pm-edit-min-${paymentMethod.id}`} className={pmLabel}>
                    {t('paymentMethodEdit.minAmountLabel')}
                  </Label>
                  <Input
                    id={`pm-edit-min-${paymentMethod.id}`}
                    type='number'
                    {...register('min_amount', {
                      valueAsNumber: true,
                      min: 0,
                    })}
                    className={pmField}
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor={`pm-edit-max-${paymentMethod.id}`} className={pmLabel}>
                    {t('paymentMethodEdit.maxAmountLabel')}
                  </Label>
                  <Input
                    id={`pm-edit-max-${paymentMethod.id}`}
                    type='number'
                    {...register('max_amount', {
                      valueAsNumber: true,
                      validate: (v, f) => v >= f.min_amount || t('paymentMethodEdit.maxMinValidation'),
                    })}
                    aria-invalid={!!errors.max_amount}
                    className={cn(pmField, errors.max_amount && 'nb-invalid')}
                  />
                  {errors.max_amount && (
                    <p className={pmError} role='alert'>
                      {errors.max_amount.message}
                    </p>
                  )}
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor={`pm-edit-sort-${paymentMethod.id}`} className={pmLabel}>
                    {t('paymentMethodEdit.sortOrderLabel')}
                  </Label>
                  <Input
                    id={`pm-edit-sort-${paymentMethod.id}`}
                    type='number'
                    {...register('sort_order', {
                      valueAsNumber: true,
                    })}
                    className={pmField}
                  />
                </div>

                <div className='space-y-2'>
                  <Label className={pmLabel}>{t('paymentMethodEdit.statusLabel')}</Label>
                  <input type='hidden' {...register('is_active')} />

                  <div className={pmSwitchRow}>
                    <span className='text-xs font-black uppercase tracking-[0.12em]'>
                      {watch('is_active')
                        ? t('paymentMethodEdit.statusActive')
                        : t('paymentMethodEdit.statusInactive')}
                    </span>

                    <Switch
                      checked={watch('is_active')}
                      onCheckedChange={(v) => setValue('is_active', v)}
                      disabled={isUploading || updatePaymentMethodMutation.isPending}
                      className={pmSwitch}
                    />
                  </div>

                  <p className={pmHint}>
                    {watch('is_active')
                      ? t('paymentMethodEdit.statusActiveHint')
                      : t('paymentMethodEdit.statusInactiveHint')}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className='gap-2 border-t-4 border-[#111] pt-5 sm:pt-5'>
              <button type='button' className={cn(pmBtn, 'bg-white')} onClick={() => setOpen(false)}>
                {t('paymentMethodEdit.cancel')}
              </button>
              <button
                type='submit'
                className={cn(pmBtn, 'bg-[#ffd84d]')}
                disabled={updatePaymentMethodMutation.isPending || isUploading}
              >
                {updatePaymentMethodMutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' strokeWidth={3} aria-hidden />
                    {t('paymentMethodEdit.saving')}
                  </>
                ) : (
                  t('paymentMethodEdit.save')
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
