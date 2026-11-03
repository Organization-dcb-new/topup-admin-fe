import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { CopyValueButton } from './TransactionParts'

interface DetailPanelProps {
  icon: LucideIcon
  title: string
  /** Position in the page, staggers the entrance. */
  order?: number
  footer?: ReactNode
  children: ReactNode
}

/** A titled HUD card on the transaction detail. */
export function DetailPanel({ icon: Icon, title, order = 0, footer, children }: DetailPanelProps) {
  return (
    <section
      className='bg-slate-200/80 p-px hud-clip animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'
      style={{ animationDelay: `${120 + order * 70}ms` }}
    >
      <div className='h-full bg-white hud-clip'>
        <header className='flex items-center gap-2.5 border-b border-slate-100 px-4 py-3 sm:px-5'>
          <Icon className='size-4 shrink-0 text-brand-purple' aria-hidden />
          <h2 className='font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600'>{title}</h2>
        </header>
        <div className='px-4 py-1.5 sm:px-5'>{children}</div>
        {footer && <div className='border-t border-slate-100 px-4 py-3 text-xs leading-relaxed text-slate-500 sm:px-5'>{footer}</div>}
      </div>
    </section>
  )
}

interface DetailFieldProps {
  label: string
  /** Adds a copy button for exactly this value. */
  copy?: string
  mono?: boolean
  /** Label above the value, for long identifiers. */
  stacked?: boolean
  emphasis?: boolean
  children: ReactNode
}

/** Placeholder for a value the backend didn't send. */
export function EmptyValue() {
  return <span className='text-slate-400'>—</span>
}

/** One label/value row inside a `<dl>`. */
export function DetailField({ label, copy, mono, stacked, emphasis, children }: DetailFieldProps) {
  const value = (
    <dd
      className={cn(
        'flex min-w-0 items-center gap-1 text-sm text-slate-900',
        stacked ? 'justify-between' : 'justify-end text-right',
        mono && 'font-mono text-[13px]',
        emphasis && 'font-display text-lg font-bold'
      )}
    >
      <span className='min-w-0 wrap-anywhere'>{children}</span>
      {copy && <CopyValueButton value={copy} label={label} className='-my-1' />}
    </dd>
  )

  return (
    <div
      className={cn(
        'border-b border-slate-100 py-2.5 last:border-b-0',
        stacked ? 'space-y-1' : 'flex items-center justify-between gap-4'
      )}
    >
      <dt className='shrink-0 text-xs font-medium text-slate-500'>{label}</dt>
      {value}
    </div>
  )
}
