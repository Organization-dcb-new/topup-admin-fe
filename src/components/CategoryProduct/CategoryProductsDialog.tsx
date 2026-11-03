import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Loader2, Package, RefreshCw, Search } from 'lucide-react'

import { hudEyebrowClass, hudInputClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAvailableProductsByGame, useSetCategoryProducts } from '@/hooks/useCategoryProduct'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CategoryProduct } from '@/types/category-product'

interface CategoryProductsDialogProps {
  category: CategoryProduct | null
  /** Categories already loaded, to say which one a product would be moved out of. */
  categories: CategoryProduct[]
  onOpenChange: (open: boolean) => void
}

export function CategoryProductsDialog({ category, categories, onOpenChange }: CategoryProductsDialogProps) {
  const save = useSetCategoryProducts(() => onOpenChange(false))

  return (
    <Dialog open={!!category} onOpenChange={(next) => !save.isPending && onOpenChange(next)}>
      <DialogContent
        showCloseButton={false}
        className='flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg'
      >
        <div className='h-1 shrink-0 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {category && (
          <ProductsPicker
            key={category.id}
            category={category}
            categories={categories}
            pending={save.isPending}
            onCancel={() => onOpenChange(false)}
            onSave={(productIds) => save.mutate({ categoryId: category.id, productIds })}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface PickerRow {
  id: string
  name: string
  /** Base price from the provider list; unknown for members that dropped out of stock. */
  price: number | null
  /** In the category now but no longer offered by the provider. */
  unavailable: boolean
  inactive: boolean
}

interface ProductsPickerProps {
  category: CategoryProduct
  categories: CategoryProduct[]
  pending: boolean
  onCancel: () => void
  onSave: (productIds: string[]) => void
}

function ProductsPicker({ category, categories, pending, onCancel, onSave }: ProductsPickerProps) {
  const { t } = useTranslation('common')
  const { data: available = [], isLoading, isError, refetch, isFetching } = useAvailableProductsByGame(category.game_id, true)
  const members = useMemo(() => category.product ?? [], [category.product])
  const original = useMemo(() => new Set(members.map((p) => p.id)), [members])
  const [selected, setSelected] = useState(() => new Set(members.map((p) => p.id)))
  const [search, setSearch] = useState('')

  // A product sits in one category at a time; picking it here moves it out of the other one.
  const ownerByProduct = useMemo(() => {
    const owners = new Map<string, string>()
    for (const c of categories) if (c.id !== category.id) for (const p of c.product ?? []) owners.set(p.id, c.name)
    return owners
  }, [categories, category.id])

  const rows = useMemo<PickerRow[]>(() => {
    const memberById = new Map(members.map((p) => [p.id, p]))
    const offered = available.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      unavailable: false,
      inactive: memberById.get(p.id)?.is_active === false,
    }))
    const offeredIds = new Set(offered.map((p) => p.id))
    const dropped = members
      .filter((p) => !offeredIds.has(p.id))
      .map((p) => ({ id: p.id, name: p.name, price: null, unavailable: true, inactive: !p.is_active }))
    // Current line-up first, then the rest in the provider's price order. Sorted by the saved list,
    // not the live ticks, so rows never jump under the cursor.
    return [...offered.filter((p) => original.has(p.id)), ...dropped, ...offered.filter((p) => !original.has(p.id))]
  }, [available, members, original])

  const query = search.trim().toLowerCase()
  const visible = query ? rows.filter((r) => r.name.toLowerCase().includes(query)) : rows
  const unchanged = selected.size === original.size && [...selected].every((id) => original.has(id))
  const moving = [...selected].filter((id) => !original.has(id) && ownerByProduct.has(id)).length
  const allVisibleSelected = visible.length > 0 && visible.every((r) => selected.has(r.id))

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const selectVisible = () =>
    setSelected((prev) => {
      const next = new Set(prev)
      for (const r of visible) next.add(r.id)
      return next
    })

  return (
    <>
      <div className='shrink-0 space-y-4 p-6 pb-4 sm:p-7 sm:pb-4'>
        <div className='space-y-1'>
          <p className={hudEyebrowClass}>{t('categoryProductPage.products.eyebrow', { game: category.game_name })}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {t('categoryProductPage.products.title', { name: category.name })}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>{t('categoryProductPage.products.description')}</DialogDescription>
        </div>
        <div className='group relative'>
          <span className='pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400 group-focus-within:text-brand-purple'>
            <Search className='size-4' aria-hidden />
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('categoryProductPage.products.searchPlaceholder')}
            aria-label={t('categoryProductPage.products.searchPlaceholder')}
            autoComplete='off'
            className={cn(hudInputClass, 'pl-11')}
          />
        </div>
        <div className='flex items-center justify-between gap-3 text-xs text-slate-500'>
          <span>{t('categoryProductPage.products.selected', { count: selected.size })}</span>
          <div className='flex items-center gap-3'>
            {!allVisibleSelected && visible.length > 0 && (
              <button type='button' onClick={selectVisible} className='font-medium hover:text-brand-purple'>
                {query ? t('categoryProductPage.products.selectShown') : t('categoryProductPage.products.selectAll')}
              </button>
            )}
            {selected.size > 0 && (
              <button type='button' onClick={() => setSelected(new Set())} className='font-medium hover:text-rose-600'>
                {t('categoryProductPage.products.clear')}
              </button>
            )}
          </div>
        </div>
      </div>

      <ul className='min-h-40 flex-1 overflow-y-auto border-y border-slate-100 px-3 py-2 sm:px-4' aria-label={t('categoryProductPage.products.listLabel')}>
        {isLoading ? (
          <li className='flex items-center justify-center gap-2 py-10 text-sm text-slate-500'>
            <Loader2 className='size-4 animate-spin' aria-hidden />
            {t('categoryProductPage.products.loading')}
          </li>
        ) : isError ? (
          <li className='space-y-3 py-10 text-center'>
            <p className='text-sm text-rose-600'>{t('categoryProductPage.products.loadError')}</p>
            <button
              type='button'
              onClick={() => void refetch()}
              disabled={isFetching}
              className='inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:text-brand-purple disabled:opacity-60'
            >
              <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} aria-hidden />
              {t('categoryProductPage.retry')}
            </button>
          </li>
        ) : visible.length === 0 ? (
          <li className='py-10 text-center text-sm text-slate-500'>
            {rows.length ? t('categoryProductPage.products.noMatch') : t('categoryProductPage.products.empty')}
          </li>
        ) : (
          visible.map((row) => {
            const checked = selected.has(row.id)
            const owner = ownerByProduct.get(row.id)
            return (
              <li key={row.id}>
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-purple/40',
                    checked ? 'bg-brand-purple/[0.06]' : 'hover:bg-slate-50'
                  )}
                >
                  <input type='checkbox' checked={checked} onChange={() => toggle(row.id)} className='sr-only' />
                  <span
                    className={cn(
                      'grid size-5 shrink-0 place-items-center rounded border transition-colors',
                      checked ? 'border-brand-purple bg-brand-purple text-white' : 'border-slate-300 bg-white'
                    )}
                    aria-hidden
                  >
                    {checked && <Check className='size-3.5' strokeWidth={3} />}
                  </span>
                  <Package className={cn('size-4 shrink-0', checked ? 'text-brand-purple' : 'text-slate-300')} aria-hidden />
                  <span className='min-w-0 flex-1'>
                    <span className={cn('block truncate text-sm', row.unavailable || row.inactive ? 'text-slate-500' : 'text-slate-800')}>
                      {row.name}
                    </span>
                    <span className='flex flex-wrap items-center gap-x-2 text-[11px]'>
                      {row.price !== null && (
                        <span className='tabular-nums text-slate-400'>{t('categoryProductPage.products.basePrice', { price: formatCurrency(row.price) })}</span>
                      )}
                      {row.unavailable && <span className='font-medium text-rose-600'>{t('categoryProductPage.products.outOfStock')}</span>}
                      {row.inactive && <span className='font-medium text-slate-400'>{t('categoryProductPage.products.inactive')}</span>}
                    </span>
                  </span>
                  {owner && (
                    <span
                      className={cn('max-w-[40%] shrink-0 truncate text-[11px]', checked && !original.has(row.id) ? 'font-medium text-amber-700' : 'text-slate-400')}
                      title={owner}
                    >
                      {checked && !original.has(row.id)
                        ? t('categoryProductPage.products.willMove', { name: owner })
                        : t('categoryProductPage.products.inCategory', { name: owner })}
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
          <p className='rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800'>
            {t('categoryProductPage.products.movingNote', { count: moving })}
          </p>
        )}
        <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <button
            type='button'
            onClick={onCancel}
            disabled={pending}
            className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
          >
            {t('categoryProductPage.products.cancel')}
          </button>
          <button
            type='button'
            onClick={() => onSave([...selected])}
            disabled={unchanged || pending || isLoading}
            className={cn(hudPrimaryButtonClass, 'justify-center disabled:pointer-events-none sm:min-w-52')}
          >
            <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
            {pending && <Loader2 className='size-4 animate-spin' aria-hidden />}
            {pending ? t('categoryProductPage.products.saving') : t('categoryProductPage.products.save')}
          </button>
        </div>
      </div>
    </>
  )
}
