import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, CreditCard, Loader2, Search } from 'lucide-react'

import { hudEyebrowClass, hudInputClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAssignPaymentMethods } from '@/hooks/usePaymentMethodCategory'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/types/payment-method'
import type { PaymentMethodCategory } from '@/types/payment-method-categories'
import { useRetained } from '@/hooks/useRetained'

interface CategoryMethodsDialogProps {
  category: PaymentMethodCategory | null
  categories: PaymentMethodCategory[]
  methods: PaymentMethod[]
  isLoading: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryMethodsDialog({ category, categories, methods, isLoading, onOpenChange }: CategoryMethodsDialogProps) {
  // Keep showing the last target while the dialog animates closed.
  const shown = useRetained(category)
  const assign = useAssignPaymentMethods(() => onOpenChange(false))

  return (
    <Dialog open={!!category} onOpenChange={(next) => !assign.isPending && onOpenChange(next)}>
      <DialogContent
        showCloseButton={false}
        className='flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg'
      >
        <div className='h-1 shrink-0 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {shown && (
          <MethodsPicker
            key={shown.id}
            category={shown}
            categories={categories}
            methods={methods}
            isLoading={isLoading}
            pending={assign.isPending}
            onCancel={() => onOpenChange(false)}
            onSave={(methodIds) => assign.mutate({ categoryId: shown.id, methodIds })}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface MethodsPickerProps {
  category: PaymentMethodCategory
  categories: PaymentMethodCategory[]
  methods: PaymentMethod[]
  isLoading: boolean
  pending: boolean
  onCancel: () => void
  onSave: (methodIds: string[]) => void
}

function MethodsPicker({ category, categories, methods, isLoading, pending, onCancel, onSave }: MethodsPickerProps) {
  const { t } = useTranslation('common')
  const original = new Set(methods.filter((m) => m.category_id === category.id).map((m) => m.id))
  const [selected, setSelected] = useState(() => new Set(original))
  const [search, setSearch] = useState('')
  const nameById = new Map(categories.map((c) => [c.id, c.name]))

  const query = search.trim().toLowerCase()
  const visible = query ? methods.filter((m) => [m.name, m.code].some((v) => v.toLowerCase().includes(query))) : methods
  // The saved line-up first; sorted by the saved list so rows never jump while ticking.
  const ordered = [...visible].sort((a, b) => Number(original.has(b.id)) - Number(original.has(a.id)) || a.sort_order - b.sort_order)
  const moving = [...selected].filter((id) => {
    const owner = methods.find((m) => m.id === id)?.category_id
    return owner && owner !== category.id && nameById.has(owner)
  }).length
  const unchanged = selected.size === original.size && [...selected].every((id) => original.has(id))

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <>
      <div className='shrink-0 space-y-4 p-6 pb-4 sm:p-7 sm:pb-4'>
        <div className='space-y-1'>
          <p className={hudEyebrowClass}>{t('paymentCategoryPage.methods.eyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {t('paymentCategoryPage.methods.title', { name: category.name })}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>{t('paymentCategoryPage.methods.description')}</DialogDescription>
        </div>
        <div className='group relative'>
          <span className='pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400 group-focus-within:text-brand-purple'>
            <Search className='size-4' aria-hidden />
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('paymentCategoryPage.methods.searchPlaceholder')}
            aria-label={t('paymentCategoryPage.methods.searchPlaceholder')}
            autoComplete='off'
            className={cn(hudInputClass, 'pl-11')}
          />
        </div>
        <div className='flex items-center justify-between text-xs text-slate-500'>
          <span>{t('paymentCategoryPage.methods.selected', { count: selected.size })}</span>
          {selected.size > 0 && (
            <button type='button' onClick={() => setSelected(new Set())} className='font-medium hover:text-rose-600'>
              {t('paymentCategoryPage.methods.clear')}
            </button>
          )}
        </div>
      </div>

      <ul className='min-h-40 flex-1 overflow-y-auto border-y border-slate-100 px-3 py-2 sm:px-4' aria-label={t('paymentCategoryPage.methods.listLabel')}>
        {isLoading ? (
          <li className='flex items-center justify-center gap-2 py-10 text-sm text-slate-500'>
            <Loader2 className='size-4 animate-spin' aria-hidden />
            {t('paymentCategoryPage.methods.loading')}
          </li>
        ) : ordered.length === 0 ? (
          <li className='py-10 text-center text-sm text-slate-500'>{t('paymentCategoryPage.methods.noMatch')}</li>
        ) : (
          ordered.map((method) => {
            const checked = selected.has(method.id)
            const owner = method.category_id && method.category_id !== category.id ? nameById.get(method.category_id) : undefined
            return (
              <li key={method.id}>
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-purple/40',
                    checked ? 'bg-brand-purple/[0.06]' : 'hover:bg-slate-50'
                  )}
                >
                  <input type='checkbox' checked={checked} onChange={() => toggle(method.id)} className='sr-only' />
                  <span
                    className={cn(
                      'grid size-5 shrink-0 place-items-center rounded border transition-colors',
                      checked ? 'border-brand-purple bg-brand-purple text-white' : 'border-slate-300 bg-white'
                    )}
                    aria-hidden
                  >
                    {checked && <Check className='size-3.5' strokeWidth={3} />}
                  </span>
                  <span className='grid size-7 shrink-0 place-items-center overflow-hidden rounded bg-white ring-1 ring-slate-200'>
                    {method.icon_url ? (
                      <img src={method.icon_url} alt='' className='size-full object-contain p-0.5' />
                    ) : (
                      <CreditCard className='size-3.5 text-slate-300' aria-hidden />
                    )}
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className={cn('block truncate text-sm', method.is_active ? 'text-slate-800' : 'text-slate-400')}>{method.name}</span>
                    <span className='block truncate font-mono text-[11px] text-slate-400'>{method.code}</span>
                  </span>
                  {owner && (
                    <span className={cn('max-w-[40%] shrink-0 truncate text-[11px]', checked ? 'font-medium text-amber-700' : 'text-slate-400')} title={owner}>
                      {checked ? t('paymentCategoryPage.methods.willMove', { name: owner }) : t('paymentCategoryPage.methods.inCategory', { name: owner })}
                    </span>
                  )}
                </label>
              </li>
            )
          })
        )}
      </ul>

      <div className='shrink-0 space-y-3 p-6 pt-4 sm:p-7 sm:pt-4'>
        {moving > 0 && (
          <p className='rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800'>{t('paymentCategoryPage.methods.movingNote', { count: moving })}</p>
        )}
        <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <button
            type='button'
            onClick={onCancel}
            disabled={pending}
            className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
          >
            {t('paymentCategoryPage.methods.cancel')}
          </button>
          <button
            type='button'
            onClick={() => onSave([...selected])}
            disabled={unchanged || pending}
            className={cn(hudPrimaryButtonClass, 'justify-center disabled:pointer-events-none sm:min-w-52')}
          >
            <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
            {pending && <Loader2 className='size-4 animate-spin' aria-hidden />}
            {pending ? t('paymentCategoryPage.methods.saving') : t('paymentCategoryPage.methods.save')}
          </button>
        </div>
      </div>
    </>
  )
}
