import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Plus, UploadCloud } from 'lucide-react'
import { useCreatePaymentMethodSubmit, type PaymentMethodPayload } from '@/hooks/usePaymentMethod'
import { handleFileAutoUpload } from '@/helpers/upload'
import type { FormValuesPaymentMethodCreate } from '@/types/payment-method'
import { useTranslation } from 'react-i18next'

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
      <Button
        type="button"
        className="w-full gap-2 rounded-xl font-semibold shadow-sm sm:w-auto"
        onClick={() => applyOpen(true)}
      >
        <Plus className="h-4 w-4 shrink-0" aria-hidden />
        {t('paymentMethodCreate.trigger')}
      </Button>

      <Dialog open={open} onOpenChange={applyOpen}>
        <DialogContent className="rounded-xl sm:max-w-3xl">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {t('paymentMethodCreate.title')}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {t('paymentMethodCreate.description')}
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
            <div className="flex flex-row gap-5 w-full">
              {/* Left */}
              <div className="w-full flex gap-3 flex-col">
                {/* Name */}
                <div className="space-y-1">
                  <Label>{t('paymentMethodCreate.nameLabel')}</Label>
                  <Input
                    {...register('name', { required: t('paymentMethodCreate.nameRequired') })}
                    placeholder={t('paymentMethodCreate.namePlaceholder')}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>

                {/* Code */}
                <div className="space-y-1">
                  <Label>{t('paymentMethodCreate.codeLabel')}</Label>
                  <Input
                    {...register('code', { required: t('paymentMethodCreate.codeRequired') })}
                    placeholder={t('paymentMethodCreate.codePlaceholder')}
                  />
                  {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <Label>{t('paymentMethodCreate.typeLabel')}</Label>
                  <Input
                    {...register('type', { required: t('paymentMethodCreate.typeRequired') })}
                    placeholder={t('paymentMethodCreate.typePlaceholder')}
                  />
                  {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
                </div>

                {/* Provider */}
                <div className="space-y-1">
                  <Label>{t('paymentMethodCreate.providerLabel')}</Label>
                  <Input
                    {...register('provider', { required: t('paymentMethodCreate.providerRequired') })}
                    placeholder={t('paymentMethodCreate.providerPlaceholder')}
                  />
                  {errors.provider && (
                    <p className="text-xs text-destructive">{errors.provider.message}</p>
                  )}
                </div>
                {/* Drag & Drop Icon */}
                <div className="space-y-2">
                  <Label>{t('paymentMethodCreate.iconLabel')}</Label>
                  <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const file = e.dataTransfer.files[0]
                      if (file) handleFile(file)
                    }}
                    className={`group relative flex h-40 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition
                  ${isUploading ? 'pointer-events-none opacity-60' : 'hover:border-primary'}
                `}
                  >
                    {preview ? (
                      <img src={preview} className="h-full w-full rounded-lg object-contain" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <UploadCloud className="h-6 w-6" />
                        <span className="text-sm">{t('paymentMethodCreate.iconDropHint')}</span>
                      </div>
                    )}

                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                        <span className="text-sm">{t('paymentMethodCreate.uploading', { percent: uploadProgress })}</span>
                      </div>
                    )}
                  </div>

                  <Input
                    ref={inputRef}
                    type="file"
                    accept="image/*,.svg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFile(file)
                    }}
                  />

                  {isUploading && <Progress value={uploadProgress} />}
                </div>
              </div>

              {/* Right */}
              <div className="w-full flex gap-3 flex-col">
                {/* Fee Percentage */}
                <div className="space-y-1">
                  <Label>{t('paymentMethodCreate.feePercentLabel')}</Label>
                  <Input
                    type="number"
                    {...register('fee_percentage', {
                      valueAsNumber: true,
                      required: t('paymentMethodCreate.feePercentRequired'),
                    })}
                  />
                  {errors.fee_percentage && (
                    <p className="text-xs text-destructive">{errors.fee_percentage.message}</p>
                  )}
                </div>

                {/* Fee Fixed */}
                <div className="space-y-1">
                  <Label>{t('paymentMethodCreate.feeFixedLabel')}</Label>
                  <Input
                    type="number"
                    {...register('fee_fixed', {
                      valueAsNumber: true,
                      required: t('paymentMethodCreate.feeFixedRequired'),
                    })}
                  />
                  {errors.fee_fixed && (
                    <p className="text-xs text-destructive">{errors.fee_fixed.message}</p>
                  )}
                </div>

                {/* Min Amount */}
                <div className="space-y-1">
                  <Label>{t('paymentMethodCreate.minAmountLabel')}</Label>
                  <Input
                    type="number"
                    {...register('min_amount', {
                      valueAsNumber: true,
                      required: t('paymentMethodCreate.minAmountRequired'),
                    })}
                  />
                  {errors.min_amount && (
                    <p className="text-xs text-destructive">{errors.min_amount.message}</p>
                  )}
                </div>

                {/* Max Amount */}
                <div className="space-y-1">
                  <Label>{t('paymentMethodCreate.maxAmountLabel')}</Label>
                  <Input
                    type="number"
                    {...register('max_amount', {
                      valueAsNumber: true,
                      required: t('paymentMethodCreate.maxAmountRequired'),
                    })}
                  />
                  {errors.max_amount && (
                    <p className="text-xs text-destructive">{errors.max_amount.message}</p>
                  )}
                </div>

                {/* Sort Order */}
                <div className="space-y-1">
                  <Label>{t('paymentMethodCreate.sortOrderLabel')}</Label>
                  <Input
                    type="number"
                    {...register('sort_order', {
                      valueAsNumber: true,
                      required: t('paymentMethodCreate.sortOrderRequired'),
                    })}
                  />
                  {errors.sort_order && (
                    <p className="text-xs text-destructive">{errors.sort_order.message}</p>
                  )}
                </div>

                {/* Config */}
                <div className="space-y-1">
                  <Label>{t('paymentMethodCreate.configLabel')}</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                className="cursor-pointer"
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                {t('paymentMethodCreate.cancel')}
              </Button>
              <Button
                className="cursor-pointer"
                type="submit"
                disabled={mutation.isPending || isUploading}
              >
                {mutation.isPending ? t('paymentMethodCreate.saving') : t('paymentMethodCreate.create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
