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
  paymentMethodSchema,
  type PaymentMethodSchemaValues,
} from '@/schemas/payment-method'
import type { PaymentMethodFormValues } from '@/types/payment-method'

interface PaymentMethodFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initialValues?: Partial<PaymentMethodFormValues>
  isPending?: boolean
  onSubmit: (values: PaymentMethodFormValues, done: () => void) => void
}

const EMPTY: PaymentMethodFormValues = {
  name: '',
  code: '',
  type: '',
  provider: '',
  icon_url: '',
  fee_percentage: 0,
  fee_fixed: 0,
  min_amount: 0,
  max_amount: 0,
  sort_order: 0,
  is_active: true,
}

/**
 * Satu form untuk tambah dan ubah. Sebelumnya dua modal terpisah (283 + 321
 * baris) menduplikasi sepuluh dari sebelas kolom dan sudah saling menyimpang:
 * modal ubah tidak pernah merender sembilan dari sepuluh pesan galatnya,
 * dan kolom angkanya tidak wajib sehingga mengosongkannya mengirim NaN.
 */
function FormBody({
  mode,
  initialValues,
  isPending,
  onSubmit,
  onOpenChange,
}: Omit<PaymentMethodFormDialogProps, 'open'>) {
  const { t } = useTranslation('common')
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentMethodSchemaValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: { ...EMPTY, ...initialValues },
  })

  const iconUrl = watch('icon_url')
  const isActive = watch('is_active')
  const busy = isPending || isUploading

  const numberFields = [
    { name: 'fee_percentage', label: t('paymentMethodForm.feePercentLabel'), hint: t('paymentMethodForm.feePercentHint'), step: '0.01' },
    { name: 'fee_fixed', label: t('paymentMethodForm.feeFixedLabel'), step: '1' },
    { name: 'min_amount', label: t('paymentMethodForm.minLabel'), step: '1' },
    { name: 'max_amount', label: t('paymentMethodForm.maxLabel'), hint: t('paymentMethodForm.maxHint'), step: '1' },
    { name: 'sort_order', label: t('paymentMethodForm.sortLabel'), step: '1' },
  ] as const

  const textFields = [
    { name: 'name', label: t('paymentMethodForm.nameLabel'), placeholder: t('paymentMethodForm.namePlaceholder') },
    { name: 'code', label: t('paymentMethodForm.codeLabel'), placeholder: t('paymentMethodForm.codePlaceholder'), hint: t('paymentMethodForm.codeHint') },
    { name: 'type', label: t('paymentMethodForm.typeLabel'), placeholder: t('paymentMethodForm.typePlaceholder') },
    { name: 'provider', label: t('paymentMethodForm.providerLabel'), placeholder: t('paymentMethodForm.providerPlaceholder') },
  ] as const

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
            {textFields.map((field) => (
              <div key={field.name} className='space-y-1.5'>
                <Label htmlFor={`pm-${field.name}`}>{field.label}</Label>
                <Input
                  id={`pm-${field.name}`}
                  placeholder={field.placeholder}
                  disabled={busy}
                  aria-invalid={!!errors[field.name]}
                  {...register(field.name)}
                />
                {'hint' in field && field.hint && !errors[field.name] && (
                  <p className='text-xs text-muted-foreground'>{field.hint}</p>
                )}
                {errors[field.name] && (
                  <p role='alert' className='text-xs font-medium text-destructive'>
                    {errors[field.name]?.message}
                  </p>
                )}
              </div>
            ))}
          </div>

          <ImageDropzone
            label={t('paymentMethodForm.iconLabel')}
            value={iconUrl}
            onChange={(url) =>
              setValue('icon_url', url, { shouldValidate: true })
            }
            onUploadingChange={setIsUploading}
            disabled={isPending}
            error={errors.icon_url?.message}
          />
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {numberFields.map((field) => (
            <div key={field.name} className='space-y-1.5'>
              <Label htmlFor={`pm-${field.name}`}>{field.label}</Label>
              <Input
                id={`pm-${field.name}`}
                type='number'
                step={field.step}
                inputMode='decimal'
                disabled={busy}
                aria-invalid={!!errors[field.name]}
                {...register(field.name, { valueAsNumber: true })}
              />
              {'hint' in field && field.hint && !errors[field.name] && (
                <p className='text-xs text-muted-foreground'>{field.hint}</p>
              )}
              {errors[field.name] && (
                <p role='alert' className='text-xs font-medium text-destructive'>
                  {errors[field.name]?.message}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className='flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3'>
          <div className='min-w-0'>
            <Label htmlFor='pm-is_active' className='cursor-pointer'>
              {t('paymentMethodForm.statusLabel')}
            </Label>
            <p className='text-xs text-muted-foreground'>
              {t('paymentMethodForm.statusHint')}
            </p>
          </div>
          <Switch
            id='pm-is_active'
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
          {t('paymentMethodForm.cancel')}
        </Button>
        <Button type='submit' className='rounded-lg font-semibold' disabled={busy}>
          {isPending && (
            <Loader2 className='mr-2 h-4 w-4 shrink-0 animate-spin' aria-hidden />
          )}
          {mode === 'create'
            ? t('paymentMethodForm.create')
            : t('paymentMethodForm.save')}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function PaymentMethodFormDialog({
  open,
  onOpenChange,
  ...rest
}: PaymentMethodFormDialogProps) {
  const { t } = useTranslation('common')

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (rest.isPending) return
        onOpenChange(next)
      }}
    >
      <DialogContent className='flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl'>
        <DialogHeader className='shrink-0 space-y-1 border-b border-border px-6 py-4 text-left'>
          <DialogTitle>
            {rest.mode === 'create'
              ? t('paymentMethodForm.createTitle')
              : t('paymentMethodForm.editTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('paymentMethodForm.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Dipasang hanya saat terbuka: form selalu mulai dari nilai baris
            yang sedang dibuka, tanpa reset lewat effect */}
        {open && <FormBody {...rest} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  )
}
