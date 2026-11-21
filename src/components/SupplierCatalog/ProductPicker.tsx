import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, Diamond, Search } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ProductListing } from '@/types/product'

interface ProductPickerProps {
  products: ProductListing[]
  /** The chosen product's id. */
  value: string
  onChange: (productId: string) => void
  placeholder: string
  disabled?: boolean
  /** Floats products with this name to the top and marks them: the likely match for a supplier product. */
  suggestName?: string
}

/** Searchable list of one game's storefront products, with the price each currently costs. */
export function ProductPicker({ products, value, onChange, placeholder, disabled, suggestName }: ProductPickerProps) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const selected = products.find((p) => p.id === value)
  const query = search.trim().toLowerCase()
  const suggested = suggestName?.trim().toLowerCase()
  const isSuggested = (p: ProductListing) => !!suggested && p.name.trim().toLowerCase() === suggested
  const matches = (query ? products.filter((p) => p.name.toLowerCase().includes(query)) : products)
    .slice()
    .sort((a, b) => Number(isSuggested(b)) - Number(isSuggested(a)))

  const pick = (id: string) => {
    onChange(id)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSearch('')
      }}
    >
      <PopoverTrigger asChild>
        <button
          type='button'
          disabled={disabled}
          className={cn(
            'flex h-10 w-full min-w-0 items-center gap-2.5 rounded-md border bg-white px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:cursor-not-allowed disabled:opacity-60',
            selected ? 'border-brand-purple/40' : 'border-slate-200 hover:border-slate-300'
          )}
        >
          <Diamond className={cn('size-4 shrink-0', selected ? 'text-brand-purple' : 'text-slate-400')} aria-hidden />
          <span className={cn('min-w-0 flex-1 truncate', selected ? 'font-medium text-slate-900' : 'text-slate-400')}>
            {selected?.name ?? placeholder}
          </span>
          <ChevronDown className={cn('size-4 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-(--radix-popover-trigger-width) min-w-72 overflow-hidden rounded-md p-0'>
        <div className='flex items-center gap-2 border-b border-slate-100 px-3'>
          <Search className='size-3.5 shrink-0 text-slate-400' aria-hidden />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('supplierCatalogPage.product.searchProduct')}
            aria-label={t('supplierCatalogPage.product.searchProduct')}
            className='h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400'
          />
        </div>
        <ul role='listbox' aria-label={placeholder} className='max-h-64 overflow-y-auto p-1'>
          {matches.length === 0 ? (
            <li className='px-3 py-6 text-center text-xs text-slate-500'>{t('supplierCatalogPage.product.noProducts')}</li>
          ) : (
            matches.map((product) => {
              const isSelected = product.id === value
              return (
                <li key={product.id} role='option' aria-selected={isSelected}>
                  <button
                    type='button'
                    onClick={() => pick(product.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm transition-colors',
                      isSelected ? 'bg-brand-purple/10 font-medium text-brand-purple' : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <span className='min-w-0 flex-1 truncate'>{product.name}</span>
                    {isSuggested(product) && (
                      <span className='shrink-0 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700'>
                        {t('supplierCatalogPage.product.sameName')}
                      </span>
                    )}
                    <span className='shrink-0 text-xs tabular-nums text-slate-400'>{formatCurrency(product.price)}</span>
                    {isSelected && <Check className='size-4 shrink-0' aria-hidden />}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
