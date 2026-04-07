import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/axios'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type PriceType = 'fee' | 'percent'

interface FormValues {
  id: string
  type: PriceType
  additional_fee: number
  additional_percent: number
}

interface Props {
  productId: string
  basePrice: number
  productName: string
}

export default function UpdateProductPriceModal({ productId, basePrice, productName }: Props) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const typeId = useId()
  const feeId = useId()
  const percentId = useId()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      id: productId,
      type: 'fee',
      additional_fee: 0,
      additional_percent: 0,
    },
  })

  const type = watch('type')
  const fee = watch('additional_fee') || 0
  const percent = watch('additional_percent') || 0

  const isFeeOverLimit = type === 'fee' && fee > 1_000_000
  const isPercentOverLimit = type === 'percent' && percent > 40
  const isOverLimit = isFeeOverLimit || isPercentOverLimit

  useEffect(() => {
    if (!open) return

    reset({
      id: productId,
      type: 'fee',
      additional_fee: 0,
      additional_percent: 0,
    })
  }, [open, productId, reset])

  useEffect(() => {
    if (type === 'fee') setValue('additional_percent', 0)
    else setValue('additional_fee', 0)
  }, [type, setValue])

  const mutation = useMutation({
    mutationFn: (data: FormValues) => api.patch('/products/price', data),
    onSuccess: () => {
      toast.success('Harga berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setOpen(false)
    },
    onError: () => {
      toast.error('Gagal memperbarui harga')
    },
  })

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data)
  }

  const sellingPrice = type === 'fee' ? basePrice + fee : basePrice + basePrice * (percent / 100)

  const selectClass = cn(
    'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs',
    'ring-offset-background focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
  )

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="cursor-pointer"
        aria-label={`Ubah harga ${productName}`}
      >
        <Pencil className="h-4 w-4" aria-hidden />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah harga jual</DialogTitle>
            <DialogDescription>
              Produk: <span className="font-medium text-foreground">{productName}</span>. Pilih tambahan
              nominal (fee) atau persen di atas harga dasar. Pratinjau di bawah sebelum menyimpan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('id')} />

            <div className="space-y-2">
              <Label htmlFor={typeId} className="text-sm font-medium">
                Jenis tambahan
              </Label>
              <select id={typeId} {...register('type', { required: true })} className={selectClass}>
                <option value="fee">Biaya tambahan (rupiah)</option>
                <option value="percent">Persen markup</option>
              </select>
            </div>

            {type === 'fee' && (
              <div className="space-y-2">
                <Label htmlFor={feeId} className="text-sm font-medium">
                  Biaya tambahan (Rp)
                </Label>
                <Input
                  id={feeId}
                  type="number"
                  className="rounded-lg font-mono tabular-nums"
                  {...register('additional_fee', {
                    required: true,
                    min: 0,
                    max: 1_000_000,
                    valueAsNumber: true,
                  })}
                  aria-invalid={!!errors.additional_fee}
                />
                {errors.additional_fee && (
                  <p className="text-xs text-destructive">Nilai biaya tidak valid</p>
                )}
                {isFeeOverLimit && (
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    Maksimum biaya tambahan Rp 1.000.000
                  </p>
                )}
              </div>
            )}

            {type === 'percent' && (
              <div className="space-y-2">
                <Label htmlFor={percentId} className="text-sm font-medium">
                  Persen tambahan (%)
                </Label>
                <Input
                  id={percentId}
                  type="number"
                  step="0.01"
                  className="rounded-lg font-mono tabular-nums"
                  {...register('additional_percent', {
                    required: true,
                    min: 0,
                    max: 40,
                    valueAsNumber: true,
                  })}
                  aria-invalid={!!errors.additional_percent}
                />
                {errors.additional_percent && (
                  <p className="text-xs text-destructive">Nilai persen tidak valid</p>
                )}
                {isPercentOverLimit && (
                  <p className="text-xs text-amber-600 dark:text-amber-500">Maksimum markup 40%</p>
                )}
              </div>
            )}

            <div className="space-y-2 rounded-lg border border-border/80 bg-muted/30 p-4 text-sm">
              <div className="flex items-center justify-between gap-4 text-muted-foreground">
                <span>Harga dasar</span>
                <span className="font-mono tabular-nums text-foreground">
                  Rp {basePrice?.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-2 font-semibold text-foreground">
                <span>Harga jual (perkiraan)</span>
                <span className="font-mono tabular-nums">
                  Rp {sellingPrice?.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || isOverLimit}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                    Menyimpan…
                  </>
                ) : (
                  'Simpan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
