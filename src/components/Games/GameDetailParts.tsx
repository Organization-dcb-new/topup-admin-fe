import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface DetailPanelProps {
  icon: LucideIcon
  title: string
  description?: ReactNode
  /** Buttons on the right of the header. */
  action?: ReactNode
  children: ReactNode
  /** Position in the page's entrance stagger. */
  order?: number
  className?: string
}

/** A titled card of the game detail page, in the notched login-card style. */
export function DetailPanel({ icon: Icon, title, description, action, children, order = 0, className }: DetailPanelProps) {
  return (
    <section
      className={cn('min-w-0 bg-slate-200/80 p-px hud-clip animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both', className)}
      style={{ animationDelay: `${order * 70}ms` }}
    >
      <div className='h-full bg-white hud-clip'>
        <header className='flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
          <div className='flex min-w-0 items-start gap-3'>
            <span className='grid size-9 shrink-0 place-items-center bg-brand-purple/10 text-brand-purple hud-clip-sm'>
              <Icon className='size-4' aria-hidden />
            </span>
            <div className='min-w-0'>
              <h2 className='font-display text-base font-bold leading-tight text-slate-900'>{title}</h2>
              {description && <p className='mt-0.5 text-xs leading-relaxed text-slate-500'>{description}</p>}
            </div>
          </div>
          {action && <div className='flex flex-wrap items-center gap-2 empty:hidden'>{action}</div>}
        </header>
        <div className='p-5 sm:p-6'>{children}</div>
      </div>
    </section>
  )
}

/** One label/value line of a definition list. */
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0'>
      <dt className='shrink-0 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{label}</dt>
      <dd className='flex min-w-0 items-center justify-end gap-1 text-right text-sm font-medium text-slate-800'>{children}</dd>
    </div>
  )
}
