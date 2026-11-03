import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Check, ChevronDown, Copy, Search, type LucideIcon } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { cn } from '@/lib/utils'
import {
  formatChannel,
  isKnownOrderStatus,
  isKnownPaymentStatus,
  orderTone,
  paymentTone,
  providerTone,
  type Tone,
} from './transaction-meta'

const chipBase =
  'inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.14em] hud-clip-sm'

function ToneChip({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn(chipBase, tone.chip, className)}>
      <span className={cn('size-1.5 shrink-0 rounded-full', tone.dot)} aria-hidden />
      {children}
    </span>
  )
}

export function PaymentStatusChip({ status, className }: { status: string; className?: string }) {
  const { t } = useTranslation('common')
  return (
    <ToneChip tone={paymentTone(status)} className={className}>
      {isKnownPaymentStatus(status) ? t(`paymentStatus.${status}`) : status || '—'}
    </ToneChip>
  )
}

export function OrderStatusChip({ status }: { status: string }) {
  const { t } = useTranslation('common')
  return (
    <ToneChip tone={orderTone(status)}>
      {isKnownOrderStatus(status) ? t(`transactionDetailPage.orderStatus.${status}`) : status || '—'}
    </ToneChip>
  )
}

/** The provider's raw fulfilment status, kept verbatim because it varies per provider. */
export function ProviderStatusChip({ status }: { status: string | undefined }) {
  if (!status) return <span className='text-xs text-slate-400'>—</span>
  return <ToneChip tone={providerTone(status)}>{status}</ToneChip>
}

export function ChannelChip({ channel }: { channel: string | undefined }) {
  return (
    <span className='inline-flex max-w-full items-center bg-slate-100 px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 hud-clip-sm'>
      <span className='truncate'>{formatChannel(channel)}</span>
    </span>
  )
}

export function CopyValueButton({ value, label, className }: { value: string; label: string; className?: string }) {
  const { t } = useTranslation('common')
  const [copied, setCopied] = useState(false)

  const copy = async (e: React.MouseEvent) => {
    // Rows are links; copying must not open the detail.
    e.preventDefault()
    e.stopPropagation()
    try {
      await copyTextToClipboard(value)
    } catch {
      toast.error(t('transactionPage.copyFailed'))
      return
    }
    setCopied(true)
    toast.success(t('transactionPage.copied', { label }), { id: `copy-${label}` })
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      type='button'
      onClick={copy}
      aria-label={t('transactionPage.copy', { label })}
      title={t('transactionPage.copy', { label })}
      className={cn(
        'grid size-7 shrink-0 place-items-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40',
        className
      )}
    >
      {copied ? <Check className='size-3.5 text-emerald-600' aria-hidden /> : <Copy className='size-3.5' aria-hidden />}
    </button>
  )
}

export interface PickerOption {
  id: string
  name: string
  hint?: string
}

interface OptionPickerProps {
  id?: string
  icon: LucideIcon
  options: PickerOption[]
  value: string
  onChange: (id: string) => void
  placeholder: string
  allLabel: string
  searchPlaceholder: string
  emptyLabel: string
  loading?: boolean
  className?: string
}

/** Searchable single choice in a popover, with an "all" row that clears it. */
export function OptionPicker({
  id,
  icon: Icon,
  options,
  value,
  onChange,
  placeholder,
  allLabel,
  searchPlaceholder,
  emptyLabel,
  loading,
  className,
}: OptionPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const selected = value ? options.find((o) => o.id === value) : undefined
  const query = search.trim().toLowerCase()
  const matches = query ? options.filter((o) => `${o.name} ${o.hint ?? ''}`.toLowerCase().includes(query)) : options

  const pick = (next: string) => {
    onChange(next)
    setOpen(false)
    setSearch('')
  }

  const row = (key: string, label: ReactNode, active: boolean, onClick: () => void, hint?: string) => (
    <li key={key} role='option' aria-selected={active}>
      <button
        type='button'
        onClick={onClick}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded px-3 py-2 text-left text-sm transition-colors',
          active ? 'bg-brand-purple/10 font-medium text-brand-purple' : 'text-slate-700 hover:bg-slate-50'
        )}
      >
        <span className='min-w-0'>
          <span className='block truncate'>{label}</span>
          {hint && <span className='block truncate font-mono text-[11px] text-slate-400'>{hint}</span>}
        </span>
        {active && <Check className='size-4 shrink-0' aria-hidden />}
      </button>
    </li>
  )

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
          id={id}
          type='button'
          className={cn(
            'flex h-10 w-full items-center gap-2.5 rounded-md border bg-white px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40',
            selected ? 'border-brand-purple/40' : 'border-slate-200 hover:border-slate-300',
            className
          )}
        >
          <Icon className={cn('size-4 shrink-0', selected ? 'text-brand-purple' : 'text-slate-400')} aria-hidden />
          <span className={cn('min-w-0 flex-1 truncate', selected ? 'font-medium text-slate-900' : 'text-slate-400')}>
            {selected?.name ?? placeholder}
          </span>
          <ChevronDown className={cn('size-4 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-(--radix-popover-trigger-width) min-w-64 overflow-hidden rounded-md p-0'>
        <div className='flex items-center gap-2 border-b border-slate-100 px-3'>
          <Search className='size-3.5 shrink-0 text-slate-400' aria-hidden />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className='h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400'
          />
        </div>
        <ul role='listbox' aria-label={placeholder} className='max-h-64 overflow-y-auto p-1'>
          {!query && row('__all__', allLabel, !value, () => pick(''))}
          {loading ? (
            <li className='px-3 py-6 text-center text-xs text-slate-500'>…</li>
          ) : matches.length === 0 ? (
            <li className='px-3 py-6 text-center text-xs text-slate-500'>{emptyLabel}</li>
          ) : (
            matches.map((o) => row(o.id, o.name, o.id === value, () => pick(o.id), o.hint))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
