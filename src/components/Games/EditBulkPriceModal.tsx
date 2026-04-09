import { useEffect, useState } from 'react'
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
import { useProductsByGame } from '@/hooks/useProduct'
import { api } from '@/api/axios'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

interface FormValues {
  game_id: string
  additional_percent: number
}

interface Props {
  gameId: string
}

const BULK_MAX_PERCENT = 40

export default function UpdateBulkProductPriceModal({ gameId }: Props) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const {
    data: products = [],
    isPending: isLoadingProducts,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useProductsByGame(gameId, open)

  const hasProducts = products.length > 0
  const firstAdditionalPercent = products[0]?.additional_percent ?? 0

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
  const isOverLimit = percent > BULK_MAX_PERCENT

  useEffect(() => {
    if (!open || isLoadingProducts) return
    reset({
      game_id: gameId,
      additional_percent: hasProducts ? firstAdditionalPercent : 0,
    })
  }, [open, isLoadingProducts, gameId, hasProducts, firstAdditionalPercent, reset])

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      api.patch('/products/price/bulk', {
        ...data,
        type: 'percent',
      }),
    onSuccess: () => {
      toast.success(t('gameToasts.bulkPriceSuccess'))
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      queryClient.invalidateQueries({ queryKey: ['products-by-game', gameId] })
      queryClient.invalidateQueries({ queryKey: ['product-names', gameId] })
      setOpen(false)
    },
    onError: () => toast.error(t('gameToasts.bulkPriceError')),
  })

  const onSubmit = (data: FormValues) => {
    if (!hasProducts) return
    mutation.mutate(data)
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      reset({ game_id: gameId, additional_percent: 0 })
    }
  }

  const formReady = open && !isLoadingProducts && !isProductsError && hasProducts

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
          disabled={mutation.isPending}
          aria-label={t('bulkPriceModal.triggerAria')}
        >
          <DollarSign className="h-4 w-4" aria-hidden />
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-xl sm:max-w-md">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {t('bulkPriceModal.title')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t('bulkPriceModal.description', { max: String(BULK_MAX_PERCENT) })}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('game_id')} />

          {open && isLoadingProducts ? (
            <div
              className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-10 text-center"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
              <p className="text-sm text-muted-foreground">{t('bulkPriceModal.loadingProducts')}</p>
            </div>
          ) : open && isProductsError ? (
            <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-4 text-center">
              <p className="text-sm text-destructive">{t('bulkPriceModal.loadProductsError')}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => void refetchProducts()}
              >
                {t('bulkPriceModal.retry')}
              </Button>
            </div>
          ) : !hasProducts ? (
            <p className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-4 text-center text-sm text-muted-foreground">
              {t('bulkPriceModal.emptyProducts')}
            </p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor={`bulk-price-pct-${gameId}`} className="text-sm font-medium">
                {t('bulkPriceModal.percentLabel')}
              </Label>
              <Input
                id={`bulk-price-pct-${gameId}`}
                type="number"
                step="0.01"
                min={0}
                max={BULK_MAX_PERCENT}
                className="rounded-lg"
                {...register('additional_percent', {
                  required: t('bulkPriceModal.percentRequired'),
                  min: { value: 0, message: t('bulkPriceModal.percentMin') },
                  max: { value: BULK_MAX_PERCENT, message: t('bulkPriceModal.percentMax') },
                  valueAsNumber: true,
                })}
              />
              {errors.additional_percent && (
                <p className="text-xs text-destructive">{errors.additional_percent.message}</p>
              )}
              {isOverLimit && !errors.additional_percent && (
                <p className="text-xs text-amber-700">{t('bulkPriceModal.overLimit')}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('bulkPriceModal.productCount', { count: products.length })}
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
              {t('bulkPriceModal.cancel')}
            </Button>
            <Button
              type="submit"
              className="rounded-lg font-semibold"
              disabled={mutation.isPending || !formReady || isOverLimit}
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {t('bulkPriceModal.updating')}
                </span>
              ) : (
                t('bulkPriceModal.applyAll')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
