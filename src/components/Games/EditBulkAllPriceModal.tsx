import { useId, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ArrowRight, Percent } from 'lucide-react'

import { AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useBulkUpdateAllProductPrice } from '@/hooks/useProduct'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { gamePriceSchema, type GamePriceFormInput, type GamePriceFormValues } from '@/schemas/game'
import { PRICE_MAX_PERCENT, sellingFromPercent } from './game-utils'

const SAMPLE_BASE = 100_000

/** Sets one markup percentage on every product of every game. */
export default function EditBulkAllPriceModal() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className='inline-flex h-11 items-center gap-2 bg-white px-4 font-display text-xs font-bold uppercase tracking-[0.15em] text-slate-600 ring-1 ring-inset ring-slate-200 hud-clip-sm transition-colors hover:text-brand-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'
      >
        <Percent className='size-4' aria-hidden />
        {t('gamePriceDialog.allTrigger')}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg'
        >
          <div className='h-1 bg-linear-to-r from-amber-400 to-rose-500' aria-hidden />
          {/* The content unmounts once the dialog has closed, so every open starts blank. */}
          <BulkAllForm onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

function BulkAllForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation('common')
  const ids = useId()
  const [confirmed, setConfirmed] = useState(false)
  const save = useBulkUpdateAllProductPrice(onDone)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GamePriceFormInput, unknown, GamePriceFormValues>({
    resolver: zodResolver(gamePriceSchema),
    defaultValues: { additional_percent: 0 },
  })
  const raw = useWatch({ control, name: 'additional_percent' })
  const percent = Math.min(PRICE_MAX_PERCENT, Math.max(0, Number(raw) || 0))

  return (
    <form noValidate onSubmit={handleSubmit((v) => save.mutate(v.additional_percent))} className='space-y-6 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-amber-400 to-rose-500 text-white hud-clip-sm'>
          <Percent className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{t('gamePriceDialog.allEyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>{t('gamePriceDialog.allTitle')}</DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>
            {t('gamePriceDialog.allDescription', { max: PRICE_MAX_PERCENT })}
          </DialogDescription>
        </div>
      </div>

      <div className='flex items-start gap-3 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-inset ring-amber-200'>
        <AlertTriangle className='mt-0.5 size-4 shrink-0 text-amber-600' aria-hidden />
        <span>{t('gamePriceDialog.allWarning')}</span>
      </div>

      <div className='grid items-end gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]'>
        <div className='space-y-2'>
          <label htmlFor={`${ids}-percent`} className={hudLabelClass}>{t('gamePriceDialog.percentLabel')}</label>
          <div className='relative'>
            <Input
              id={`${ids}-percent`}
              type='number'
              inputMode='decimal'
              min={0}
              max={PRICE_MAX_PERCENT}
              step='any'
              autoFocus
              aria-invalid={!!errors.additional_percent}
              className={cn(hudInputClass, 'pr-9 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none')}
              {...register('additional_percent')}
            />
            <span className='pointer-events-none absolute inset-y-0 right-3 flex items-center font-display text-sm font-semibold text-slate-400'>%</span>
          </div>
        </div>
        <p className='flex flex-wrap items-center gap-1.5 pb-3 text-xs text-slate-500'>
          {t('gamePriceDialog.example')}
          <span className='tabular-nums text-slate-700'>{formatCurrency(SAMPLE_BASE)}</span>
          <ArrowRight className='size-3 text-slate-300' aria-hidden />
          <span className='font-semibold tabular-nums text-slate-900'>{formatCurrency(sellingFromPercent(SAMPLE_BASE, percent))}</span>
        </p>
      </div>
      {errors.additional_percent?.message && (
        <FieldMessage tone='error'>{t(errors.additional_percent.message, { max: PRICE_MAX_PERCENT })}</FieldMessage>
      )}

      <label className='flex cursor-pointer items-start gap-3 text-sm text-slate-700'>
        <input
          type='checkbox'
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className='mt-0.5 size-4 shrink-0 accent-rose-600'
        />
        {t('gamePriceDialog.allConfirm')}
      </label>

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onDone}
          disabled={save.isPending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('gamePriceDialog.cancel')}
        </button>
        <div className='sm:min-w-52'>
          <AuthSubmitButton pending={save.isPending} pendingLabel={t('gamePriceDialog.saving')} cooldown={0} disabled={!confirmed}>
            {t('gamePriceDialog.applyAll')}
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  )
}
