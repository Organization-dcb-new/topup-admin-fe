import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Check, ChevronDown, Copy, Loader2, type LucideIcon } from 'lucide-react'

import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { cn } from '@/lib/utils'
import type { SupplierMappingStatus, SupplierSyncStatus } from '@/types/supplier-catalog'

const chipClass =
  'inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.14em] hud-clip-sm'

const MAPPING_STYLE: Record<SupplierMappingStatus, { chip: string; dot: string }> = {
  MAPPED: { chip: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  UNMAPPED: { chip: 'bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  IGNORED: { chip: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
}

/** Whether a supplier brand or product is tied to the storefront. */
export function MappingChip({ status, className }: { status: SupplierMappingStatus; className?: string }) {
  const { t } = useTranslation('common')
  const style = MAPPING_STYLE[status] ?? MAPPING_STYLE.UNMAPPED
  return (
    <span className={cn(chipClass, style.chip, className)}>
      <span className={cn('size-1.5 rounded-full', style.dot)} aria-hidden />
      {t(`supplierCatalogPage.mapping.${status}`)}
    </span>
  )
}

/** The supplier's own stock word: available, empty or unknown. */
export function StockChip({ status, className }: { status: string; className?: string }) {
  const { t } = useTranslation('common')
  const known = status === 'available' || status === 'empty' ? status : 'unknown'
  return (
    <span
      className={cn(
        chipClass,
        known === 'available' && 'bg-cyan-50 text-cyan-800',
        known === 'empty' && 'bg-rose-50 text-rose-700',
        known === 'unknown' && 'bg-slate-100 text-slate-500',
        className
      )}
    >
      {t(`supplierCatalogPage.stock.${known}`)}
    </span>
  )
}

const SYNC_STYLE: Record<SupplierSyncStatus, string> = {
  RUNNING: 'bg-brand-purple/10 text-brand-purple',
  SUCCEEDED: 'bg-emerald-50 text-emerald-700',
  PARTIAL: 'bg-amber-50 text-amber-800',
  FAILED: 'bg-rose-50 text-rose-700',
}

export function SyncStatusChip({ status }: { status: SupplierSyncStatus }) {
  const { t } = useTranslation('common')
  return (
    <span className={cn(chipClass, SYNC_STYLE[status] ?? SYNC_STYLE.FAILED)}>
      {status === 'RUNNING' ? (
        <Loader2 className='size-3 animate-spin' aria-hidden />
      ) : (
        <span className='size-1.5 rounded-full bg-current' aria-hidden />
      )}
      {t(`supplierCatalogPage.sync.status.${status}`)}
    </span>
  )
}

/** One label/value line in a detail dialog. */
export function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='min-w-0 space-y-1'>
      <dt className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>{label}</dt>
      <dd className='min-w-0 text-sm text-slate-800'>{children}</dd>
    </div>
  )
}

/**
 * The supplier's object exactly as received. Folded by default: it is there to check what the
 * supplier sent, not to read on every visit.
 */
export function RawJson({ value }: { value: unknown }) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const text = JSON.stringify(value ?? null, null, 2)

  const copy = async () => {
    try {
      await copyTextToClipboard(text)
    } catch {
      toast.error(t('supplierCatalogPage.raw.copyFailed'))
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='rounded-md border border-slate-200'>
      <div className='flex items-center gap-2 px-3 py-2'>
        <button
          type='button'
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className='flex min-w-0 flex-1 items-center gap-2 text-left font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-600 transition-colors hover:text-brand-purple focus-visible:outline-none focus-visible:text-brand-purple'
        >
          <ChevronDown className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')} aria-hidden />
          {t('supplierCatalogPage.raw.title')}
        </button>
        <button
          type='button'
          onClick={() => void copy()}
          aria-label={t('supplierCatalogPage.raw.copy')}
          title={t('supplierCatalogPage.raw.copy')}
          className='grid size-7 shrink-0 place-items-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700'
        >
          {copied ? <Check className='size-3.5 text-emerald-600' aria-hidden /> : <Copy className='size-3.5' aria-hidden />}
        </button>
      </div>
      {open && (
        <pre className='max-h-80 overflow-auto rounded-b-md bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200'>{text}</pre>
      )}
    </div>
  )
}

export function CloseButton({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('common')
  return (
    <button
      type='button'
      onClick={onClose}
      className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'
    >
      {t('supplierCatalogPage.close')}
    </button>
  )
}

interface ActionButtonProps {
  icon: LucideIcon
  pending: boolean
  disabled: boolean
  onClick: () => void
  tone?: 'default' | 'primary' | 'danger'
  children: ReactNode
}

/** A compact action in the dialog; shows a spinner while its own request runs. */
export function ActionButton({ icon: Icon, pending, disabled, onClick, tone = 'default', children }: ActionButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      aria-busy={pending}
      className={cn(
        'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md px-3.5 text-sm font-medium ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:cursor-not-allowed disabled:opacity-50',
        tone === 'primary' && 'bg-brand-purple text-white ring-brand-purple hover:bg-brand-purple-deep',
        tone === 'danger' && 'bg-white text-rose-600 ring-rose-200 hover:bg-rose-50',
        tone === 'default' && 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 hover:text-slate-900'
      )}
    >
      {pending ? <Loader2 className='size-4 animate-spin' aria-hidden /> : <Icon className='size-4' aria-hidden />}
      {children}
    </button>
  )
}
