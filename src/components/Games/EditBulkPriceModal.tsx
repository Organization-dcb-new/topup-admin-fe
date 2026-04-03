import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { DollarSign, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/axios'
import toast from 'react-hot-toast'
import type { Product } from '@/types/product'

interface FormValues {
  game_id: string
  additional_percent: number
}

interface Props {
  gameId: string
  product: Product[]
}

export default function UpdateBulkProductPriceModal({ gameId, product }: Props) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const firstAdditionalPercent = product[0]?.additional_percent ?? 0
  const hasProducts = product.length > 0

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      game_id: gameId,
      additional_percent: 0,
    },
  })

  const percent = Number(watch('additional_percent')) || 0
  const isOverLimit = percent > 40

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      api.patch('/products/price/bulk', {
        ...data,
        type: 'percent',
      }),
    onSuccess: () => {
      toast.success('Harga produk berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['games'] })
      setOpen(false)
    },
    onError: () => toast.error('Gagal memperbarui harga'),
  })

  const onSubmit = (data: FormValues) => {
    if (!hasProducts) return
    mutation.mutate(data)
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next && hasProducts) {
      reset({
        game_id: gameId,
        additional_percent: firstAdditionalPercent,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
          disabled={!hasProducts || mutation.isPending}
          aria-label={
            hasProducts
              ? 'Perbarui harga produk (persentase massal)'
              : 'Tidak ada produk untuk diperbarui'
          }
        >
          <DollarSign className="h-4 w-4" aria-hidden />
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-xl sm:max-w-md">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Harga massal (persentase)
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Tambahan persentase diterapkan ke produk game ini. Maksimal{' '}
            <span className="font-medium text-foreground">40%</span>.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('game_id')} />

          {!hasProducts ? (
            <p className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-4 text-center text-sm text-muted-foreground">
              Game ini belum memiliki produk. Tambahkan produk terlebih dahulu.
            </p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor={`bulk-price-pct-${gameId}`} className="text-sm font-medium">
                Tambahan persentase (%)
              </Label>
              <Input
                id={`bulk-price-pct-${gameId}`}
                type="number"
                step="0.01"
                min={0}
                max={40}
                className="rounded-lg"
                {...register('additional_percent', {
                  required: 'Persentase wajib diisi',
                  min: { value: 0, message: 'Minimal 0%' },
                  max: { value: 40, message: 'Maksimal 40%' },
                  valueAsNumber: true,
                })}
              />
              {errors.additional_percent && (
                <p className="text-xs text-destructive">{errors.additional_percent.message}</p>
              )}
              {isOverLimit && !errors.additional_percent && (
                <p className="text-xs text-amber-700">Nilai di atas 40% tidak diizinkan.</p>
              )}
              <p className="text-xs text-muted-foreground">
                {product.length} produk untuk game ini.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="rounded-lg font-semibold"
              disabled={mutation.isPending || !hasProducts || isOverLimit}
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Memperbarui…
                </span>
              ) : (
                'Terapkan ke semua produk'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
