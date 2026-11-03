import { useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Tag } from 'lucide-react'

import { AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { useUpdateProductPrice } from '@/hooks/useProduct'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { productPriceSchema, type ProductPriceFormInput, type ProductPriceFormValues } from '@/schemas/product'
import type { Product, ProductPriceType } from '@/types/product'
import { markupOf, sellingPriceFor } from './product-pricing'
import { useRetained } from '@/hooks/useRetained'

const QUICK_VALUES: Record<ProductPriceType, number[]> = {
  fee: [500, 1000, 2000, 5000],
  percent: [2, 3, 5, 10],
}

interface ProductPriceDialogProps {
  product: Product | null
  onOpenChange: (open: boolean) => void
}

export function ProductPriceDialog({ product, onOpenChange }: ProductPriceDialogProps) {
  // Keep showing the last target while the dialog animates closed.
  const shown = useRetained(product)
  const update = useUpdateProductPrice(() => onOpenChange(false))

  return (
    <Dialog open={!!product} onOpenChange={(next) => !update.isPending && onOpenChange(next)}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {/* Keyed per product, so the form always starts from that product's current markup. */}
        {shown && (
          <PriceForm
            key={shown.id}
            product={shown}
            pending={update.isPending}
            onCancel={() => onOpenChange(false)}
            onSave={(type, value) =>
              update.mutate({
                id: shown.id,
                type,
                additional_fee: type === 'fee' ? value : 0,
                additional_percent: type === 'percent' ? value : 0,
              })
            }
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface PriceFormProps {
  product: Product
  pending: boolean
  onCancel: () => void
  onSave: (type: ProductPriceType, value: number) => void
}

function PriceForm({ product, pending, onCancel, onSave }: PriceFormProps) {
  const { t, i18n } = useTranslation('common')
  const ids = useId()
  const locale = i18n.language.startsWith('id') ? 'id-ID' : 'en-US'
  const current = markupOf(product)
  const initialType: ProductPriceType = current.kind === 'fee' ? 'fee' : 'percent'
  const base = product.base_price

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitted },
  } = useForm<ProductPriceFormInput, unknown, ProductPriceFormValues>({
    resolver: zodResolver(productPriceSchema),
    defaultValues: { type: initialType, value: current.kind === 'none' ? 0 : Math.max(0, current.value) },
  })
  const [type, rawValue] = useWatch({ control, name: ['type', 'value'] })
  const value = Number(rawValue)
  const valid = Number.isFinite(value) && value >= 0
  const selling = valid ? sellingPriceFor(base, type, value) : product.selling_price
  const margin = selling - base
  const unchanged = valid && Math.round(selling) === Math.round(product.selling_price) && type === initialType

  // Switching kind keeps the selling price: the value is converted to the other unit.
  const switchType = (next: ProductPriceType) => {
    if (next === type) return
    const converted =
      !valid || base <= 0
        ? 0
        : next === 'fee'
          ? Math.round((base * value) / 100)
          : Math.round((value / base) * 100 * 100) / 100
    setValue('type', next)
    setValue('value', converted, { shouldValidate: isSubmitted })
  }

  const percentText = (n: number) => `${n.toLocaleString(locale, { maximumFractionDigits: 2 })}%`

  return (
    <form noValidate onSubmit={handleSubmit((v) => onSave(v.type, v.value))} className='space-y-6 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <Tag className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{t('productsPage.price.eyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>{product.name}</DialogTitle>
          <DialogDescription className='truncate text-sm text-slate-500'>
            <span className='font-mono'>{product.sku}</span>
            {product.game?.name && <span> · {product.game.name}</span>}
          </DialogDescription>
        </div>
      </div>

      <div className='space-y-3'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <label htmlFor={`${ids}-value`} className={hudLabelClass}>{t('productsPage.price.markupLabel')}</label>
          <Segmented
            value={type}
            onChange={switchType}
            label={t('productsPage.price.typeLabel')}
            options={[
              { value: 'fee', label: t('productsPage.price.fee') },
              { value: 'percent', label: t('productsPage.price.percent') },
            ]}
          />
        </div>
        <div className='relative'>
          {type === 'fee' && (
            <span className='pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-semibold text-slate-400'>Rp</span>
          )}
          <Input
            id={`${ids}-value`}
            type='number'
            inputMode='decimal'
            min={0}
            step={type === 'fee' ? 1 : 0.01}
            autoFocus
            aria-invalid={!!errors.value}
            className={cn(hudInputClass, 'text-base font-semibold tabular-nums', type === 'fee' ? 'pl-11' : 'pr-10')}
            {...register('value')}
          />
          {type === 'percent' && (
            <span className='pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm font-semibold text-slate-400'>%</span>
          )}
        </div>
        {errors.value?.message && <FieldMessage tone='error'>{t(errors.value.message)}</FieldMessage>}
        <div className='flex flex-wrap gap-1.5'>
          {QUICK_VALUES[type].map((quick) => (
            <button
              key={quick}
              type='button'
              onClick={() => setValue('value', quick, { shouldValidate: isSubmitted })}
              aria-pressed={valid && value === quick}
              className={cn(
                'h-7 px-2.5 font-display text-[11px] font-semibold tracking-[0.05em] hud-clip-sm transition-colors',
                valid && value === quick ? 'bg-brand-purple text-white' : 'bg-slate-100 text-slate-600 hover:bg-brand-purple/10 hover:text-brand-purple'
              )}
            >
              {type === 'fee' ? `+${formatCurrency(quick)}` : `+${percentText(quick)}`}
            </button>
          ))}
        </div>
      </div>

      <dl className='grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 text-sm'>
        <PriceCell label={t('productsPage.price.base')} value={formatCurrency(base)} />
        <PriceCell label={t('productsPage.price.current')} value={formatCurrency(product.selling_price)} muted />
        <PriceCell label={t('productsPage.price.newSelling')} value={formatCurrency(selling)} strong />
        <PriceCell
          label={t('productsPage.price.margin')}
          value={`${formatCurrency(margin)}${base > 0 ? ` · ${percentText((margin / base) * 100)}` : ''}`}
          tone={margin > 0 ? 'good' : 'flat'}
        />
      </dl>
      <p className='text-xs leading-relaxed text-slate-500'>{t('productsPage.price.note')}</p>

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onCancel}
          disabled={pending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('productsPage.price.cancel')}
        </button>
        <div className='sm:min-w-52'>
          <AuthSubmitButton pending={pending} pendingLabel={t('productsPage.price.saving')} cooldown={0} disabled={unchanged}>
            {t('productsPage.price.save')}
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  )
}

function PriceCell({ label, value, strong, muted, tone }: { label: string; value: string; strong?: boolean; muted?: boolean; tone?: 'good' | 'flat' }) {
  return (
    <div className='bg-white px-4 py-3'>
      <dt className='font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400'>{label}</dt>
      <dd
        className={cn(
          'mt-0.5 truncate tabular-nums',
          strong ? 'font-display text-xl font-bold text-slate-900' : 'font-semibold',
          muted && 'text-slate-500',
          tone === 'good' && 'text-emerald-600',
          tone === 'flat' && 'text-slate-500',
          !strong && !muted && !tone && 'text-slate-800'
        )}
      >
        {value}
      </dd>
    </div>
  )
}
