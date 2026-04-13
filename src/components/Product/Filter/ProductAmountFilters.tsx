import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

/** Nilai preset rupiah (string angka) */
const IDR_PRESET_VALUES = [
  '10000',
  '50000',
  '100000',
  '500000',
  '1000000',
  '5000000',
  '10000000',
] as const

const PERCENT_PRESET_VALUES = ['0', '5', '10', '15', '25', '50', '75', '100'] as const

function idrPresetLabel(v: string) {
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0) return v
  if (n >= 1_000_000) return `${n / 1_000_000} jt`
  if (n >= 1_000) return `${n / 1_000} rb`
  return v
}

function PresetChipRow({
  kind,
  onPick,
  presetLabel,
}: {
  kind: 'idr' | 'percent'
  onPick: (value: string) => void
  presetLabel: string
}) {
  const list = kind === 'idr' ? IDR_PRESET_VALUES : PERCENT_PRESET_VALUES
  return (
    <div className="grid gap-1.5 sm:grid-cols-[minmax(0,9.5rem)_1fr] sm:items-start sm:gap-3">
      <span className="hidden pt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:block">
        {presetLabel}
      </span>
      <div className="flex min-w-0 flex-wrap gap-1.5">
        {list.map((val) => (
          <Button
            key={val}
            type="button"
            variant="secondary"
            size="xs"
            className="h-7 shrink-0 px-2.5 text-[11px] font-medium tabular-nums"
            onClick={() => onPick(val)}
          >
            {kind === 'idr' ? idrPresetLabel(val) : `${val}%`}
          </Button>
        ))}
      </div>
    </div>
  )
}

export type ProductAmountFiltersState = {
  additionalFeeAbove: string
  additionalFeeBelow: string
  additionalPercentAbove: string
  additionalPercentBelow: string
  basePriceAbove: string
  basePriceBelow: string
  basePriceExact: string
  sellingPriceAbove: string
  sellingPriceBelow: string
  sellingPriceExact: string
}

export const defaultProductAmountFilters = (): ProductAmountFiltersState => ({
  additionalFeeAbove: '',
  additionalFeeBelow: '',
  additionalPercentAbove: '',
  additionalPercentBelow: '',
  basePriceAbove: '',
  basePriceBelow: '',
  basePriceExact: '',
  sellingPriceAbove: '',
  sellingPriceBelow: '',
  sellingPriceExact: '',
})

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

function percentInput(value: string) {
  return value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
}

function FilterRow({
  label,
  value,
  onChange,
  placeholder = '—',
  mono = true,
  allowDecimal = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  mono?: boolean
  allowDecimal?: boolean
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[minmax(0,9.5rem)_1fr] sm:items-center sm:gap-3">
      <Label className="text-xs leading-snug text-muted-foreground">{label}</Label>
      <Input
        className={cn('h-9 shadow-sm', mono && 'font-mono tabular-nums')}
        inputMode={allowDecimal ? 'decimal' : 'numeric'}
        value={value}
        onChange={(e) => onChange(allowDecimal ? percentInput(e.target.value) : digitsOnly(e.target.value))}
        placeholder={placeholder}
      />
    </div>
  )
}

function FilterCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border/70 bg-muted/10 p-4">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

type Props = {
  value: ProductAmountFiltersState
  onChange: (patch: Partial<ProductAmountFiltersState>) => void
}

export function ProductAmountFilters({ value, onChange }: Props) {
  const { t } = useTranslation('common')
  const [nominalOpen, setNominalOpen] = useState(false)
  const p = (key: keyof ProductAmountFiltersState) => (v: string) => onChange({ [key]: v })

  return (
    <section className="border-t border-gray-100 pt-4">
      <button
        type="button"
        className="flex w-full items-start gap-2 rounded-lg py-1 text-left outline-none ring-offset-background transition-colors hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => setNominalOpen((o) => !o)}
        aria-expanded={nominalOpen}
        aria-controls="product-nominal-filters-panel"
        id="product-nominal-filters-heading"
      >
        <ChevronDown
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
            nominalOpen && 'rotate-180',
          )}
          aria-hidden
        />
        <span className="min-w-0 flex-1 space-y-0.5">
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('productFilters.nominalTitle')}
          </span>
          <span className="block text-xs text-muted-foreground">
            {nominalOpen
              ? t('productFilters.nominalOpenHint')
              : t('productFilters.nominalClosedHint')}
          </span>
        </span>
      </button>

      {nominalOpen ? (
        <div
          id="product-nominal-filters-panel"
          role="region"
          aria-labelledby="product-nominal-filters-heading"
          className="mt-3 space-y-4"
        >
          <p className="text-xs text-muted-foreground">
            {t('productFilters.nominalHelp')}
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
        <FilterCard
          title={t('productFilters.additionalFeeTitle')}
          description={t('productFilters.additionalFeeDesc')}
        >
          <FilterRow
            label={t('productFilters.above')}
            value={value.additionalFeeAbove}
            onChange={p('additionalFeeAbove')}
          />
          <PresetChipRow
            kind="idr"
            onPick={(v) => onChange({ additionalFeeAbove: v })}
            presetLabel={t('productFilters.preset')}
          />
          <FilterRow
            label={t('productFilters.below')}
            value={value.additionalFeeBelow}
            onChange={p('additionalFeeBelow')}
          />
          <PresetChipRow
            kind="idr"
            onPick={(v) => onChange({ additionalFeeBelow: v })}
            presetLabel={t('productFilters.preset')}
          />
        </FilterCard>

        <FilterCard
          title={t('productFilters.additionalPercentTitle')}
          description={t('productFilters.additionalPercentDesc')}
        >
          <FilterRow
            label={t('productFilters.above')}
            value={value.additionalPercentAbove}
            onChange={p('additionalPercentAbove')}
            allowDecimal
          />
          <PresetChipRow
            kind="percent"
            onPick={(v) => onChange({ additionalPercentAbove: v })}
            presetLabel={t('productFilters.preset')}
          />
          <FilterRow
            label={t('productFilters.below')}
            value={value.additionalPercentBelow}
            onChange={p('additionalPercentBelow')}
            allowDecimal
          />
          <PresetChipRow
            kind="percent"
            onPick={(v) => onChange({ additionalPercentBelow: v })}
            presetLabel={t('productFilters.preset')}
          />
        </FilterCard>

        <FilterCard
          title={t('productFilters.basePriceTitle')}
          description={t('productFilters.basePriceDesc')}
        >
          <FilterRow label={t('productFilters.above')} value={value.basePriceAbove} onChange={p('basePriceAbove')} />
          <PresetChipRow
            kind="idr"
            onPick={(v) => onChange({ basePriceAbove: v })}
            presetLabel={t('productFilters.preset')}
          />
          <FilterRow label={t('productFilters.below')} value={value.basePriceBelow} onChange={p('basePriceBelow')} />
          <PresetChipRow
            kind="idr"
            onPick={(v) => onChange({ basePriceBelow: v })}
            presetLabel={t('productFilters.preset')}
          />
          <FilterRow label={t('productFilters.exact')} value={value.basePriceExact} onChange={p('basePriceExact')} />
        </FilterCard>

        <FilterCard
          title={t('productFilters.sellingPriceTitle')}
          description={t('productFilters.sellingPriceDesc')}
        >
          <FilterRow
            label={t('productFilters.above')}
            value={value.sellingPriceAbove}
            onChange={p('sellingPriceAbove')}
          />
          <PresetChipRow
            kind="idr"
            onPick={(v) => onChange({ sellingPriceAbove: v })}
            presetLabel={t('productFilters.preset')}
          />
          <FilterRow
            label={t('productFilters.below')}
            value={value.sellingPriceBelow}
            onChange={p('sellingPriceBelow')}
          />
          <PresetChipRow
            kind="idr"
            onPick={(v) => onChange({ sellingPriceBelow: v })}
            presetLabel={t('productFilters.preset')}
          />
          <FilterRow
            label={t('productFilters.exact')}
            value={value.sellingPriceExact}
            onChange={p('sellingPriceExact')}
          />
        </FilterCard>
          </div>
        </div>
      ) : null}
    </section>
  )
}
