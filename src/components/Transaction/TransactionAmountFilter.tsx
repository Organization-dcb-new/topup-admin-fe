import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { ArrowDownToLine, ArrowUpFromLine, Equal, FilterX } from 'lucide-react'

const AMOUNT_PRESETS = [5_000, 10_000, 50_000, 100_000, 1_000_000] as const

interface TransactionAmountFilterProps {
  minValue: string
  onMinChange: (digits: string) => void
  maxValue: string
  onMaxChange: (digits: string) => void
  exactValue: string
  onExactChange: (digits: string) => void
}

function digitsOnly(raw: string) {
  return raw.replace(/\D/g, '')
}

function AmountFilterRow({
  label,
  hint,
  Icon,
  symbol,
  value,
  onChange,
  placeholder,
  ariaInput,
  ariaClear,
  presetTitle,
}: {
  label: string
  hint: string
  Icon: LucideIcon
  symbol: string
  value: string
  onChange: (digits: string) => void
  placeholder: string
  ariaInput: string
  ariaClear: string
  presetTitle: (n: number) => string
}) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-border/60 py-4 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-center sm:gap-5 sm:py-3.5">
      <div className="flex gap-3 sm:min-h-10 sm:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm ring-1 ring-border/70">
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
        </div>
        <div className="min-w-0 pt-0.5 sm:pt-0">
          <p className="text-sm font-medium leading-tight text-foreground">{label}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{hint}</p>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
          {AMOUNT_PRESETS.map((n) => {
            const key = String(n)
            const active = value === key
            return (
              <Button
                key={`${label}-${n}`}
                type="button"
                size="sm"
                variant={active ? 'default' : 'outline'}
                title={presetTitle(n)}
                className={cn(
                  'h-9 min-w-[3.35rem] px-2.5 text-xs tabular-nums shadow-xs',
                  !active && 'border-border/80 bg-background',
                )}
                onClick={() => onChange(active ? '' : key)}
              >
                {symbol}&nbsp;{n.toLocaleString('id-ID')}
              </Button>
            )
          })}
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-[13rem] sm:flex-initial">
          <div className="relative min-w-0 flex-1">
            <Icon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-70"
              aria-hidden
            />
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder={placeholder}
              aria-label={ariaInput}
              className="h-10 bg-background pl-10 text-sm tabular-nums"
              value={value}
              onChange={(e) => onChange(digitsOnly(e.target.value))}
            />
          </div>
          {value !== '' && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => onChange('')}
              aria-label={ariaClear}
            >
              <FilterX className="h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TransactionAmountFilter({
  minValue,
  onMinChange,
  maxValue,
  onMaxChange,
  exactValue,
  onExactChange,
}: TransactionAmountFilterProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-muted/20 px-4 py-1 sm:px-5">
      <AmountFilterRow
        label="Di atas"
        hint="Transaksi dengan nominal lebih besar atau sama (≥)."
        Icon={ArrowUpFromLine}
        symbol="≥"
        value={minValue}
        onChange={onMinChange}
        placeholder="Minimal manual"
        ariaInput="Nominal minimum transaksi (manual)"
        ariaClear="Hapus filter nominal minimum"
        presetTitle={(n) => `Nominal ≥ ${n.toLocaleString('id-ID')}`}
      />
      <AmountFilterRow
        label="Di bawah"
        hint="Transaksi dengan nominal lebih kecil atau sama (≤)."
        Icon={ArrowDownToLine}
        symbol="≤"
        value={maxValue}
        onChange={onMaxChange}
        placeholder="Maksimal manual"
        ariaInput="Nominal maksimum transaksi (manual)"
        ariaClear="Hapus filter nominal maksimum"
        presetTitle={(n) => `Nominal ≤ ${n.toLocaleString('id-ID')}`}
      />
      <AmountFilterRow
        label="Tepat"
        hint="Hanya transaksi dengan nominal sama persis (=)."
        Icon={Equal}
        symbol="="
        value={exactValue}
        onChange={onExactChange}
        placeholder="Nominal tepat manual"
        ariaInput="Nominal tepat transaksi (manual)"
        ariaClear="Hapus filter nominal tepat"
        presetTitle={(n) => `Nominal = ${n.toLocaleString('id-ID')}`}
      />
    </div>
  )
}
