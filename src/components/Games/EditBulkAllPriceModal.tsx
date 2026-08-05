import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AlertTriangle, DollarSign, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBulkUpdateAllProductPrice } from '@/hooks/useProduct'
import { useTranslation } from 'react-i18next'

interface FormValues {
  additional_percent: number
}

const BULK_ALL_MAX_PERCENT = 40

export default function EditBulkAllPriceModal() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      additional_percent: 0,
    },
  })

  const bulkMutation = useBulkUpdateAllProductPrice(() => {
    setOpen(false)
  })

  const percent = Number(watch('additional_percent')) || 0
  const isOverLimit = percent > BULK_ALL_MAX_PERCENT || percent < 0

  const onSubmit = (data: FormValues) => {
    bulkMutation.mutate(data.additional_percent)
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      reset({ additional_percent: 0 })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='inline-flex cursor-pointer items-center gap-2 rounded-xl text-xs font-medium shadow-xs hover:bg-muted'
        >
          <DollarSign className='h-4 w-4 text-primary' aria-hidden />
          <span>{t('bulkAllPriceModal.triggerBtn')}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className='rounded-xl sm:max-w-md'>
        <DialogHeader className='space-y-1 text-left'>
          <DialogTitle className='text-lg font-semibold tracking-tight'>
            {t('bulkAllPriceModal.title')}
          </DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            {t('bulkAllPriceModal.description', { max: String(BULK_ALL_MAX_PERCENT) })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300'>
            <AlertTriangle className='h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5' aria-hidden />
            <span>{t('bulkAllPriceModal.warningBanner')}</span>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='bulk-all-price-pct' className='text-sm font-medium'>
              {t('bulkAllPriceModal.percentLabel')}
            </Label>
            <Input
              id='bulk-all-price-pct'
              type='number'
              step='0.01'
              min={0}
              max={BULK_ALL_MAX_PERCENT}
              className='rounded-lg font-mono tabular-nums'
              {...register('additional_percent', {
                required: t('bulkAllPriceModal.percentRequired'),
                min: { value: 0, message: t('bulkAllPriceModal.percentMin') },
                max: { value: BULK_ALL_MAX_PERCENT, message: t('bulkAllPriceModal.percentMax') },
                valueAsNumber: true,
              })}
            />
            {errors.additional_percent && (
              <p className='text-xs text-destructive'>{errors.additional_percent.message}</p>
            )}
            {isOverLimit && !errors.additional_percent && (
              <p className='text-xs text-amber-600 dark:text-amber-500'>{t('bulkAllPriceModal.overLimit')}</p>
            )}
          </div>

          <DialogFooter className='gap-2 sm:gap-3 sm:justify-end'>
            <Button
              type='button'
              variant='outline'
              className='cursor-pointer rounded-lg'
              onClick={() => setOpen(false)}
              disabled={bulkMutation.isPending}
            >
              {t('bulkAllPriceModal.cancel')}
            </Button>
            <Button
              type='submit'
              className='inline-flex cursor-pointer items-center gap-2 rounded-lg font-semibold'
              disabled={bulkMutation.isPending || isOverLimit}
            >
              {bulkMutation.isPending ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                  {t('bulkAllPriceModal.updating')}
                </>
              ) : (
                t('bulkAllPriceModal.applyAll')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
