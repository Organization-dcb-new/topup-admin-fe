import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react'

import { hudInputClass } from '@/components/Auth/hud-styles'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import type { GameNames } from '@/hooks/useGame'
import { cn } from '@/lib/utils'
import { GamePicker } from './GamePicker'
import {
  ADVANCED_KEYS,
  EMPTY_PRODUCT_FILTERS,
  countActive,
  type ActiveFilter,
  type ProductFilterState,
  type StockFilter,
  type UpdatedByFilter,
} from './product-filters'

interface ProductFilterBarProps {
  value: ProductFilterState
  onChange: (patch: Partial<ProductFilterState>) => void
  onReset: () => void
  games: GameNames[]
  /** The game picker needs game.view; without it, search still matches game names. */
  canPickGame: boolean
}

export function ProductFilterBar({ value, onChange, onReset, games, canPickGame }: ProductFilterBarProps) {
  const { t } = useTranslation('common')
  const advancedCount = countActive(value, ADVANCED_KEYS)
  const [showAdvanced, setShowAdvanced] = useState(advancedCount > 0)
  const anyActive = countActive(value, Object.keys(EMPTY_PRODUCT_FILTERS) as (keyof ProductFilterState)[]) > 0

  return (
    <div className='bg-slate-200/80 p-px hud-clip'>
      <div className='space-y-3 bg-white p-4 hud-clip'>
        <div className={cn('grid gap-3', canPickGame ? 'lg:grid-cols-[minmax(0,1fr)_15rem_auto_auto]' : 'lg:grid-cols-[minmax(0,1fr)_auto_auto]')}>
          <div className='group relative'>
            <span className='pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-slate-400 group-focus-within:text-brand-purple'>
              <Search className='size-4' aria-hidden />
            </span>
            <Input
              value={value.search}
              onChange={(e) => onChange({ search: e.target.value })}
              placeholder={t('productsPage.filters.searchPlaceholder')}
              aria-label={t('productsPage.filters.searchPlaceholder')}
              className={cn(hudInputClass, 'h-10 bg-white pl-10 text-sm')}
            />
          </div>
          {canPickGame && (
            <GamePicker
              games={games}
              value={value.game}
              by='name'
              onChange={(game) => onChange({ game: game?.name ?? '' })}
              placeholder={t('productsPage.filters.allGames')}
              allLabel={t('productsPage.filters.allGames')}
            />
          )}
          <Segmented
            size='md'
            value={value.status}
            onChange={(status: ActiveFilter) => onChange({ status })}
            label={t('productsPage.filters.status')}
            options={[
              { value: 'all', label: t('productsPage.filters.statusAll') },
              { value: 'active', label: t('productsPage.filters.active') },
              { value: 'inactive', label: t('productsPage.filters.inactive') },
            ]}
          />
          <Segmented
            size='md'
            value={value.stock}
            onChange={(stock: StockFilter) => onChange({ stock })}
            label={t('productsPage.filters.stock')}
            options={[
              { value: 'all', label: t('productsPage.filters.stockAll') },
              { value: 'available', label: t('productsPage.filters.available') },
              { value: 'empty', label: t('productsPage.filters.empty') },
            ]}
          />
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <button
            type='button'
            onClick={() => setShowAdvanced((v) => !v)}
            aria-expanded={showAdvanced}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.12em] hud-clip-sm transition-colors',
              showAdvanced || advancedCount ? 'bg-brand-purple/10 text-brand-purple' : 'text-slate-500 hover:bg-slate-100'
            )}
          >
            <SlidersHorizontal className='size-3.5' aria-hidden />
            {t('productsPage.filters.more')}
            {advancedCount > 0 && (
              <span className='grid size-4 place-items-center rounded-full bg-brand-purple text-[9px] text-white'>{advancedCount}</span>
            )}
          </button>
          {anyActive && (
            <button
              type='button'
              onClick={onReset}
              className='ml-auto inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600'
            >
              <RotateCcw className='size-3.5' aria-hidden />
              {t('productsPage.filters.reset')}
            </button>
          )}
        </div>

        {showAdvanced && (
          <div className='grid gap-4 border-t border-slate-100 pt-4 animate-in fade-in slide-in-from-top-1 duration-300 sm:grid-cols-2 xl:grid-cols-3'>
            <Field label={t('productsPage.filters.sku')}>
              <Input
                value={value.sku}
                onChange={(e) => onChange({ sku: e.target.value })}
                placeholder={t('productsPage.filters.skuPlaceholder')}
                aria-label={t('productsPage.filters.sku')}
                autoCapitalize='characters'
                spellCheck={false}
                className='h-9 rounded-md border-slate-200 bg-white font-mono text-sm'
              />
            </Field>
            <Field label={t('productsPage.filters.updatedBy')} className='sm:col-span-1 xl:col-span-2'>
              <Segmented
                value={value.updatedBy}
                onChange={(updatedBy: UpdatedByFilter) => onChange({ updatedBy })}
                label={t('productsPage.filters.updatedBy')}
                options={[
                  { value: 'all', label: t('productsPage.filters.updatedByAll') },
                  { value: 'admin', label: t('productsPage.filters.byAdmin') },
                  { value: 'process', label: t('productsPage.filters.byProcess') },
                  { value: 'system', label: t('productsPage.filters.bySystem') },
                ]}
              />
            </Field>
            <RangeField
              label={t('productsPage.filters.basePrice')}
              unit='rp'
              min={value.baseMin}
              max={value.baseMax}
              onChange={(min, max) => onChange({ baseMin: min, baseMax: max })}
            />
            <RangeField
              label={t('productsPage.filters.sellingPrice')}
              unit='rp'
              min={value.sellMin}
              max={value.sellMax}
              onChange={(min, max) => onChange({ sellMin: min, sellMax: max })}
            />
            <RangeField
              label={t('productsPage.filters.markupFee')}
              unit='rp'
              min={value.feeMin}
              max={value.feeMax}
              onChange={(min, max) => onChange({ feeMin: min, feeMax: max })}
            />
            <RangeField
              label={t('productsPage.filters.markupPercent')}
              unit='pct'
              min={value.pctMin}
              max={value.pctMax}
              onChange={(min, max) => onChange({ pctMin: min, pctMax: max })}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn('min-w-0 space-y-1.5', className)}>
      <p className='font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400'>{label}</p>
      {children}
    </div>
  )
}

interface RangeFieldProps {
  label: string
  unit: 'rp' | 'pct'
  min: string
  max: string
  onChange: (min: string, max: string) => void
}

function RangeField({ label, unit, min, max, onChange }: RangeFieldProps) {
  const { t } = useTranslation('common')
  return (
    <Field label={label}>
      <div className='flex items-center gap-2'>
        <RangeInput unit={unit} value={min} onChange={(v) => onChange(v, max)} label={`${label} · ${t('productsPage.filters.min')}`} placeholder={t('productsPage.filters.min')} />
        <span className='text-slate-300' aria-hidden>–</span>
        <RangeInput unit={unit} value={max} onChange={(v) => onChange(min, v)} label={`${label} · ${t('productsPage.filters.max')}`} placeholder={t('productsPage.filters.max')} />
      </div>
    </Field>
  )
}

function RangeInput({ unit, value, onChange, label, placeholder }: { unit: 'rp' | 'pct'; value: string; onChange: (v: string) => void; label: string; placeholder: string }) {
  return (
    <div className='relative min-w-0 flex-1'>
      {unit === 'rp' && (
        <span className='pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-[11px] font-semibold text-slate-400'>Rp</span>
      )}
      <Input
        type='number'
        inputMode='decimal'
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={cn('h-9 rounded-md border-slate-200 bg-white text-sm tabular-nums', unit === 'rp' ? 'pl-8' : 'pr-7')}
      />
      {unit === 'pct' && (
        <span className='pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[11px] font-semibold text-slate-400'>%</span>
      )}
    </div>
  )
}
