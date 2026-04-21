import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Loader2, Pencil, UploadCloud } from 'lucide-react'
import type { FormValuesPaymentMethodEdit, PaymentMethod } from '@/types/payment-method'
import { useEditPaymentMethod } from '@/hooks/usePaymentMethod'
import { handleFileAutoUpload } from '@/helpers/upload'
import { useTranslation } from 'react-i18next'

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
      <Button
        variant='ghost'
        size='icon'
        type='button'
        onClick={() => setOpen(true)}
        className='h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground'
        aria-label={t('paymentMethodEdit.triggerAria', { name: paymentMethod.name })}
      >
        <Pencil className='h-4 w-4' aria-hidden />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='rounded-xl sm:max-w-3xl'>
          <DialogHeader className='space-y-1 text-left'>
            <DialogTitle className='text-lg font-semibold tracking-tight'>{t('paymentMethodEdit.title')}</DialogTitle>
            <p className='text-sm text-muted-foreground'>
              {t('paymentMethodEdit.description')}
            </p>
          </DialogHeader>

          <form
            onSubmit={handleSubmit((v) => updatePaymentMethodMutation.mutate(v))}
            className='space-y-4'
          >
            <input type='hidden' {...register('icon_url', { required: t('paymentMethodEdit.iconRequired') })} />

            <div className='flex w-full flex-col gap-5 md:flex-row'>
              <div className='flex w-full flex-col gap-3'>
                <div className='space-y-1'>
                  <Label htmlFor={`pm-edit-name-${paymentMethod.id}`}>{t('paymentMethodEdit.nameLabel')}</Label>
                  <Input
                    id={`pm-edit-name-${paymentMethod.id}`}
                    {...register('name', { required: t('paymentMethodEdit.nameRequired') })}
                  />
                </div>

                <div className='space-y-1'>
                  <Label htmlFor={`pm-edit-code-${paymentMethod.id}`}>{t('paymentMethodEdit.codeLabel')}</Label>
                  <Input
                    id={`pm-edit-code-${paymentMethod.id}`}
                    {...register('code', { required: t('paymentMethodEdit.codeRequired') })}
                  />
                </div>

                <div className='space-y-1'>
                  <Label htmlFor={`pm-edit-type-${paymentMethod.id}`}>{t('paymentMethodEdit.typeLabel')}</Label>
                  <Input
                    id={`pm-edit-type-${paymentMethod.id}`}
                    {...register('type', { required: t('paymentMethodEdit.typeRequired') })}
                    placeholder={t('paymentMethodEdit.typePlaceholder')}
                  />
                </div>

                <div className='space-y-1'>
                  <Label htmlFor={`pm-edit-provider-${paymentMethod.id}`}>{t('paymentMethodEdit.providerLabel')}</Label>
                  <Input
                    id={`pm-edit-provider-${paymentMethod.id}`}
                    {...register('provider', { required: t('paymentMethodEdit.providerRequired') })}
                    placeholder={t('paymentMethodEdit.providerPlaceholder')}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>{t('paymentMethodEdit.iconLabel')}</Label>

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
                    className={`relative flex h-40 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition ${
                      isUploading ? 'pointer-events-none opacity-60' : 'hover:border-primary'
                    } ${errors.icon_url ? 'border-destructive' : 'border-border/80'}`}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt=''
                        className='h-full w-full rounded-lg object-contain'
                      />
                    ) : (
                      <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                        <UploadCloud className='h-6 w-6' aria-hidden />
                        <span className='text-sm'>{t('paymentMethodEdit.iconDropHint')}</span>
                      </div>
                    )}

                    {isUploading && (
                      <div className='absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white'>
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

                  {isUploading && <Progress value={uploadProgress} />}

                  {errors.icon_url && (
                    <p className='text-xs text-destructive'>{errors.icon_url.message}</p>
                  )}
                </div>
              </div>

              <div className='flex w-full flex-col gap-3'>
                <div className='space-y-1'>
                  <Label htmlFor={`pm-edit-fee-pct-${paymentMethod.id}`}>{t('paymentMethodEdit.feePercentLabel')}</Label>
                  <Input
                    id={`pm-edit-fee-pct-${paymentMethod.id}`}
                    type='number'
                    step='0.01'
                    {...register('fee_percentage', {
                      valueAsNumber: true,
                      min: 0,
                    })}
                  />
                </div>

                <div className='space-y-1'>
                  <Label htmlFor={`pm-edit-fee-fixed-${paymentMethod.id}`}>{t('paymentMethodEdit.feeFixedLabel')}</Label>
                  <Input
                    id={`pm-edit-fee-fixed-${paymentMethod.id}`}
                    type='number'
                    {...register('fee_fixed', {
                      valueAsNumber: true,
                      min: 0,
                    })}
                  />
                </div>

                <div className='space-y-1'>
                  <Label htmlFor={`pm-edit-min-${paymentMethod.id}`}>{t('paymentMethodEdit.minAmountLabel')}</Label>
                  <Input
                    id={`pm-edit-min-${paymentMethod.id}`}
                    type='number'
                    {...register('min_amount', {
                      valueAsNumber: true,
                      min: 0,
                    })}
                  />
                </div>

                <div className='space-y-1'>
                  <Label htmlFor={`pm-edit-max-${paymentMethod.id}`}>{t('paymentMethodEdit.maxAmountLabel')}</Label>
                  <Input
                    id={`pm-edit-max-${paymentMethod.id}`}
                    type='number'
                    {...register('max_amount', {
                      valueAsNumber: true,
                      validate: (v, f) => v >= f.min_amount || t('paymentMethodEdit.maxMinValidation'),
                    })}
                  />
                </div>

                <div className='space-y-1'>
                  <Label htmlFor={`pm-edit-sort-${paymentMethod.id}`}>{t('paymentMethodEdit.sortOrderLabel')}</Label>
                  <Input
                    id={`pm-edit-sort-${paymentMethod.id}`}
                    type='number'
                    {...register('sort_order', {
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>{t('paymentMethodEdit.statusLabel')}</Label>
                  <input type='hidden' {...register('is_active')} />

                  <div className='flex items-center justify-between rounded-lg border border-border/80 px-3 py-2'>
                    <span className='text-sm font-medium'>
                      {watch('is_active') ? t('paymentMethodEdit.statusActive') : t('paymentMethodEdit.statusInactive')}
                    </span>

                    <Switch
                      checked={watch('is_active')}
                      onCheckedChange={(v) => setValue('is_active', v)}
                      disabled={isUploading || updatePaymentMethodMutation.isPending}
                    />
                  </div>

                  <p className='text-xs text-muted-foreground'>
                    {watch('is_active')
                      ? t('paymentMethodEdit.statusActiveHint')
                      : t('paymentMethodEdit.statusInactiveHint')}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button type='button' variant='outline' className='rounded-lg' onClick={() => setOpen(false)}>
                {t('paymentMethodEdit.cancel')}
              </Button>
              <Button
                type='submit'
                className='rounded-lg font-semibold'
                disabled={updatePaymentMethodMutation.isPending || isUploading}
              >
                {updatePaymentMethodMutation.isPending ? (
                  <span className='flex items-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                    {t('paymentMethodEdit.saving')}
                  </span>
                ) : (
                  t('paymentMethodEdit.save')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
