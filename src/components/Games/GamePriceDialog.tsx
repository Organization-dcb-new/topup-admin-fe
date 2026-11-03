import { useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Percent } from 'lucide-react'

import { AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { PERM } from '@/constants/permissions'
import { useBulkUpdateGamePrice } from '@/hooks/useGame'
import { usePermissions } from '@/hooks/usePermissions'
import { useProductsByGame } from '@/hooks/useProduct'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { gamePriceSchema, type GamePriceFormInput, type GamePriceFormValues } from '@/schemas/game'
import type { Game } from '@/types/game'
import { formatPercent, listingBasePrice, PRICE_MAX_PERCENT, sellingFromPercent } from './game-utils'
import { useRetained } from '@/hooks/useRetained'

type PriceGame = Pick<Game, 'id' | 'name' | 'additional_percent'>

interface GamePriceDialogProps {
  game: PriceGame | null
  onOpenChange: (open: boolean) => void
}

/** One markup percentage for every product of a game. */
export function GamePriceDialog({ game, onOpenChange }: GamePriceDialogProps) {
  const shown = useRetained(game)
  return (
    <Dialog open={!!game} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {shown && <GamePriceForm key={shown.id} game={shown} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function GamePriceForm({ game, onDone }: { game: PriceGame; onDone: () => void }) {
  const { t } = useTranslation('common')
  const ids = useId()
  const { can } = usePermissions()
  const canSeeProducts = can(PERM.productView)
  const products = useProductsByGame(game.id, canSeeProducts)
  const save = useBulkUpdateGamePrice(game.id, onDone)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GamePriceFormInput, unknown, GamePriceFormValues>({
    resolver: zodResolver(gamePriceSchema),
    defaultValues: { additional_percent: game.additional_percent ?? 0 },
  })
  const raw = useWatch({ control, name: 'additional_percent' })
  const percent = Math.min(PRICE_MAX_PERCENT, Math.max(0, Number(raw) || 0))

  const list = products.data ?? []
  const sample = [...list].sort((a, b) => listingBasePrice(a) - listingBasePrice(b)).slice(0, 4)
  const noProducts = canSeeProducts && products.isSuccess && list.length === 0

  return (
    <form noValidate onSubmit={handleSubmit((v) => save.mutate(v.additional_percent))} className='space-y-6 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <Percent className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{t('gamePriceDialog.gameEyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {t('gamePriceDialog.gameTitle', { name: game.name })}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>
            {t('gamePriceDialog.gameDescription', { max: PRICE_MAX_PERCENT })}
          </DialogDescription>
        </div>
      </div>

      <div className='space-y-2'>
        <label htmlFor={`${ids}-percent`} className={hudLabelClass}>{t('gamePriceDialog.percentLabel')}</label>
        <div className='relative max-w-[12rem]'>
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
        {errors.additional_percent?.message ? (
          <FieldMessage tone='error'>{t(errors.additional_percent.message, { max: PRICE_MAX_PERCENT })}</FieldMessage>
        ) : (
          <p className='text-xs text-slate-500'>{t('gamePriceDialog.percentHint')}</p>
        )}
      </div>

      {canSeeProducts && (
        <div className='rounded-lg border border-slate-200'>
          <div className='flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5'>
            <p className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{t('gamePriceDialog.preview')}</p>
            {products.isSuccess && (
              <p className='text-xs text-slate-500'>{t('gamePriceDialog.productCount', { count: list.length })}</p>
            )}
          </div>
          {products.isLoading ? (
            <div className='space-y-2 p-4' aria-hidden>
              {Array.from({ length: 3 }, (_, i) => <div key={i} className='h-5 animate-pulse rounded bg-slate-100' />)}
            </div>
          ) : products.isError ? (
            <p className='px-4 py-4 text-sm text-rose-600'>{t('gamePriceDialog.productsError')}</p>
          ) : noProducts ? (
            <p className='px-4 py-4 text-sm text-slate-500'>{t('gamePriceDialog.noProducts')}</p>
          ) : (
            <ul className='divide-y divide-slate-100'>
              {sample.map((p) => {
                const base = listingBasePrice(p)
                return (
                  <li key={p.id} className='flex items-center justify-between gap-3 px-4 py-2 text-xs'>
                    <span className='min-w-0 truncate text-slate-700'>{p.name}</span>
                    <span className='flex shrink-0 items-center gap-1.5 tabular-nums'>
                      <span className='text-slate-400'>{formatCurrency(base)}</span>
                      <ArrowRight className='size-3 text-slate-300' aria-hidden />
                      <span className='font-semibold text-slate-900'>{formatCurrency(sellingFromPercent(base, percent))}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      <p className='text-xs text-slate-500'>
        {t('gamePriceDialog.formula', { percent: formatPercent(percent) })}
      </p>

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
          <AuthSubmitButton pending={save.isPending} pendingLabel={t('gamePriceDialog.saving')} cooldown={0} disabled={noProducts}>
            {t('gamePriceDialog.applyGame')}
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  )
}
