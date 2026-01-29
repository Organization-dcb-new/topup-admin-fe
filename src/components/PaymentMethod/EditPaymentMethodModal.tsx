import { useEffect, useRef, useState } from 'react'
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
import { Pencil, UploadCloud } from 'lucide-react'
import type { FormValuesPaymentMethodEdit, PaymentMethod } from '@/types/payment-method'
import { useEditPaymentMethod } from '@/hooks/usePaymentMethod'
import { handleFileAutoUpload } from '@/helpers/upload'

export type PropsEditPaymentMethodModal = {
  paymentMethod: PaymentMethod
}

export function EditPaymentMethodModal({ paymentMethod }: PropsEditPaymentMethodModal) {
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
      setValue: setValue as any,
      fieldName: 'icon_url',
    })
  }

  const updatePaymentMethodMutation = useEditPaymentMethod(paymentMethod.id, setOpen)

  return (
    <div>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="cursor-pointer">
        <Pencil className="h-4 w-4" />
      </Button>
      <Dialog
        open={open}
        onOpenChange={() => {
          setOpen(false)
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit((v) => updatePaymentMethodMutation.mutate(v))}
            className="space-y-4"
          >
            {/* hidden icon_url */}
            <input type="hidden" {...register('icon_url', { required: 'Icon is required' })} />

            <div className="flex flex-row gap-5 w-full">
              {/* LEFT */}
              <div className="w-full flex gap-3 flex-col">
                {/* Name */}
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input {...register('name', { required: 'Name is required' })} />
                </div>

                {/* Code */}
                <div className="space-y-1">
                  <Label>Code</Label>
                  <Input {...register('code', { required: 'Code is required' })} />
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Input
                    {...register('type', { required: 'Type is required' })}
                    placeholder="ewallet / va / qris"
                  />
                </div>

                {/* Provider */}
                <div className="space-y-1">
                  <Label>Provider</Label>
                  <Input
                    {...register('provider', { required: 'Provider is required' })}
                    placeholder="midtrans / xendit"
                  />
                </div>

                {/* Icon Upload */}
                <div className="space-y-2">
                  <Label>Icon</Label>

                  <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const file = e.dataTransfer.files[0]
                      if (file) handleFile(file)
                    }}
                    className={`relative flex h-40 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition
            ${isUploading ? 'pointer-events-none opacity-60' : 'hover:border-primary'}
            ${errors.icon_url ? 'border-destructive' : ''}
          `}
                  >
                    {preview ? (
                      <img src={preview} className="h-full w-full rounded-lg object-contain" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <UploadCloud className="h-6 w-6" />
                        <span className="text-sm">Click or Drop image</span>
                      </div>
                    )}

                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                        Uploading {uploadProgress}%
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
                    <p className="text-xs text-destructive">{errors.icon_url.message}</p>
                  )}
                </div>
              </div>

              {/* RIGHT */}
              <div className="w-full flex gap-3 flex-col">
                {/* Fee Percentage */}
                <div className="space-y-1">
                  <Label>Fee Percentage (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('fee_percentage', {
                      valueAsNumber: true,
                      min: 0,
                    })}
                  />
                </div>

                {/* Fee Fixed */}
                <div className="space-y-1">
                  <Label>Fee Fixed</Label>
                  <Input
                    type="number"
                    {...register('fee_fixed', {
                      valueAsNumber: true,
                      min: 0,
                    })}
                  />
                </div>

                {/* Min Amount */}
                <div className="space-y-1">
                  <Label>Min Amount</Label>
                  <Input
                    type="number"
                    {...register('min_amount', {
                      valueAsNumber: true,
                      min: 0,
                    })}
                  />
                </div>

                {/* Max Amount */}
                <div className="space-y-1">
                  <Label>Max Amount</Label>
                  <Input
                    type="number"
                    {...register('max_amount', {
                      valueAsNumber: true,
                      validate: (v, f) => v >= f.min_amount || 'Max must be ≥ Min',
                    })}
                  />
                </div>

                {/* Sort Order */}
                <div className="space-y-1">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    {...register('sort_order', {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                className="cursor-pointer"
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button
                className="cursor-pointer"
                type="submit"
                disabled={updatePaymentMethodMutation.isPending || isUploading}
              >
                {updatePaymentMethodMutation.isPending ? 'Saving...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
