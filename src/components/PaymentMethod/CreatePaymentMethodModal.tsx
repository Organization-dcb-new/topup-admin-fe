import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Plus, UploadCloud } from 'lucide-react'
import { useCreatePaymentMethodSubmit, type PaymentMethodPayload } from '@/hooks/usePaymentMethod'
import { handleFileAutoUpload } from '@/helpers/upload'
import type { FormValuesPaymentMethodCreate } from '@/types/payment-method'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import {
  pmAddBtn,
  pmBtn,
  pmDialog,
  pmDialogDesc,
  pmDialogHeader,
  pmDialogIcon,
  pmDialogTitle,
  pmDrop,
  pmError,
  pmField,
  pmLabel,
  pmProgress,
} from './styles'

export default function ModalAddPaymentMethod() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormValuesPaymentMethodCreate>()

  const applyOpen = (next: boolean) => {
    setOpen(next)
    if (!next) {
      reset()
      setPreview(null)
      setUploadProgress(0)
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const mutation = useCreatePaymentMethodSubmit({ setOpen: applyOpen })

  const onSubmit = (payload: PaymentMethodPayload) => {
    mutation.mutate(payload)
  }

  const handleFile = (file: File) => {
    handleFileAutoUpload({
      file,
      setPreview,
      setIsUploading,
      setUploadProgress,
      setValue : setValue as any,
      fieldName: 'icon_url',
    })
  }

  return (
    <>
      <button type='button' className={cn(pmAddBtn, 'bg-[#c9f24d]')} onClick={() => applyOpen(true)}>
        <Plus className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
        {t('paymentMethodCreate.trigger')}
      </button>

      <Dialog open={open} onOpenChange={applyOpen}>
        <DialogContent
          className={cn(pmDialog, 'max-h-[min(90vh,46rem)] overflow-y-auto sm:max-w-3xl')}
          showCloseButton={false}
        >
          <div className={cn(pmDialogHeader, 'bg-[#c9f24d]')}>
            <DialogHeader className='gap-2 text-left'>
              <div className='flex items-center gap-2.5'>
                <span className={pmDialogIcon}>
                  <Plus className='h-4 w-4' strokeWidth={3} aria-hidden />
                </span>
                <DialogTitle className={pmDialogTitle}>
                  {t('paymentMethodCreate.title')}
                </DialogTitle>
              </div>
              <DialogDescription className={pmDialogDesc}>
                {t('paymentMethodCreate.description')}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5 px-5 py-5'>
            <div className='flex w-full flex-col gap-5 md:flex-row'>
              {/* Left */}
              <div className='flex w-full flex-col gap-4'>
                {/* Name */}
                <div className='space-y-1.5'>
                  <Label className={pmLabel}>{t('paymentMethodCreate.nameLabel')}</Label>
                  <Input
                    {...register('name', { required: t('paymentMethodCreate.nameRequired') })}
                    placeholder={t('paymentMethodCreate.namePlaceholder')}
                    aria-invalid={!!errors.name}
                    className={cn(pmField, errors.name && 'nb-invalid')}
                  />
                  {errors.name && (
                    <p className={pmError} role='alert'>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Code */}
                <div className='space-y-1.5'>
                  <Label className={pmLabel}>{t('paymentMethodCreate.codeLabel')}</Label>
                  <Input
                    {...register('code', { required: t('paymentMethodCreate.codeRequired') })}
                    placeholder={t('paymentMethodCreate.codePlaceholder')}
                    aria-invalid={!!errors.code}
                    className={cn(pmField, errors.code && 'nb-invalid')}
                  />
                  {errors.code && (
                    <p className={pmError} role='alert'>
                      {errors.code.message}
                    </p>
                  )}
                </div>

                {/* Type */}
                <div className='space-y-1.5'>
                  <Label className={pmLabel}>{t('paymentMethodCreate.typeLabel')}</Label>
                  <Input
                    {...register('type', { required: t('paymentMethodCreate.typeRequired') })}
                    placeholder={t('paymentMethodCreate.typePlaceholder')}
                    aria-invalid={!!errors.type}
                    className={cn(pmField, errors.type && 'nb-invalid')}
                  />
                  {errors.type && (
                    <p className={pmError} role='alert'>
                      {errors.type.message}
                    </p>
                  )}
                </div>

                {/* Provider */}
                <div className='space-y-1.5'>
                  <Label className={pmLabel}>{t('paymentMethodCreate.providerLabel')}</Label>
                  <Input
                    {...register('provider', { required: t('paymentMethodCreate.providerRequired') })}
                    placeholder={t('paymentMethodCreate.providerPlaceholder')}
                    aria-invalid={!!errors.provider}
                    className={cn(pmField, errors.provider && 'nb-invalid')}
                  />
                  {errors.provider && (
                    <p className={pmError} role='alert'>
                      {errors.provider.message}
                    </p>
                  )}
                </div>

                {/* Drag & Drop Icon */}
                <div className='space-y-2'>
                  <Label className={pmLabel}>{t('paymentMethodCreate.iconLabel')}</Label>
                  <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const file = e.dataTransfer.files[0]
                      if (file) handleFile(file)
                    }}
                    aria-busy={isUploading}
                    className={cn(pmDrop, isUploading && 'pointer-events-none opacity-60')}
                  >
                    {preview ? (
                      <img src={preview} className='h-full w-full object-contain p-2' />
                    ) : (
                      <div className='flex flex-col items-center gap-2 text-center'>
                        <span className='nb-frame nb-frame-thin nb-sd-sm flex h-12 w-12 items-center justify-center bg-[#6fe3f5]'>
                          <UploadCloud className='h-6 w-6' strokeWidth={2.5} aria-hidden />
                        </span>
                        <span className='max-w-[16rem] text-xs font-bold leading-relaxed text-[#111]/70'>
                          {t('paymentMethodCreate.iconDropHint')}
                        </span>
                      </div>
                    )}

                    {isUploading && (
                      <div className='absolute inset-0 flex items-center justify-center bg-[#f5f1e8]/95 text-xs font-black uppercase tracking-[0.12em]'>
                        {t('paymentMethodCreate.uploading', { percent: uploadProgress })}
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
                      if (file) handleFile(file)
                    }}
                  />

                  {isUploading && <Progress value={uploadProgress} className={pmProgress} />}
                </div>
              </div>

              {/* Right */}
              <div className='flex w-full flex-col gap-4'>
                {/* Fee Percentage */}
                <div className='space-y-1.5'>
                  <Label className={pmLabel}>{t('paymentMethodCreate.feePercentLabel')}</Label>
                  <Input
                    type='number'
                    {...register('fee_percentage', {
                      valueAsNumber: true,
                      required: t('paymentMethodCreate.feePercentRequired'),
                    })}
                    aria-invalid={!!errors.fee_percentage}
                    className={cn(pmField, errors.fee_percentage && 'nb-invalid')}
                  />
                  {errors.fee_percentage && (
                    <p className={pmError} role='alert'>
                      {errors.fee_percentage.message}
                    </p>
                  )}
                </div>

                {/* Fee Fixed */}
                <div className='space-y-1.5'>
                  <Label className={pmLabel}>{t('paymentMethodCreate.feeFixedLabel')}</Label>
                  <Input
                    type='number'
                    {...register('fee_fixed', {
                      valueAsNumber: true,
                      required: t('paymentMethodCreate.feeFixedRequired'),
                    })}
                    aria-invalid={!!errors.fee_fixed}
                    className={cn(pmField, errors.fee_fixed && 'nb-invalid')}
                  />
                  {errors.fee_fixed && (
                    <p className={pmError} role='alert'>
                      {errors.fee_fixed.message}
                    </p>
                  )}
                </div>

                {/* Min Amount */}
                <div className='space-y-1.5'>
                  <Label className={pmLabel}>{t('paymentMethodCreate.minAmountLabel')}</Label>
                  <Input
                    type='number'
                    {...register('min_amount', {
                      valueAsNumber: true,
                      required: t('paymentMethodCreate.minAmountRequired'),
                    })}
                    aria-invalid={!!errors.min_amount}
                    className={cn(pmField, errors.min_amount && 'nb-invalid')}
                  />
                  {errors.min_amount && (
                    <p className={pmError} role='alert'>
                      {errors.min_amount.message}
                    </p>
                  )}
                </div>

                {/* Max Amount */}
                <div className='space-y-1.5'>
                  <Label className={pmLabel}>{t('paymentMethodCreate.maxAmountLabel')}</Label>
                  <Input
                    type='number'
                    {...register('max_amount', {
                      valueAsNumber: true,
                      required: t('paymentMethodCreate.maxAmountRequired'),
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

                {/* Sort Order */}
                <div className='space-y-1.5'>
                  <Label className={pmLabel}>{t('paymentMethodCreate.sortOrderLabel')}</Label>
                  <Input
                    type='number'
                    {...register('sort_order', {
                      valueAsNumber: true,
                      required: t('paymentMethodCreate.sortOrderRequired'),
                    })}
                    aria-invalid={!!errors.sort_order}
                    className={cn(pmField, errors.sort_order && 'nb-invalid')}
                  />
                  {errors.sort_order && (
                    <p className={pmError} role='alert'>
                      {errors.sort_order.message}
                    </p>
                  )}
                </div>

                {/* Config */}
                <div className='space-y-1.5'>
                  <Label className={pmLabel}>{t('paymentMethodCreate.configLabel')}</Label>
                </div>
              </div>
            </div>

            <DialogFooter className='gap-2 border-t-4 border-[#111] pt-5 sm:pt-5'>
              <button
                type='button'
                className={cn(pmBtn, 'bg-white')}
                onClick={() => setOpen(false)}
              >
                {t('paymentMethodCreate.cancel')}
              </button>
              <button
                type='submit'
                className={cn(pmBtn, 'bg-[#c9f24d]')}
                disabled={mutation.isPending || isUploading}
              >
                {mutation.isPending
                  ? t('paymentMethodCreate.saving')
                  : t('paymentMethodCreate.create')}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
