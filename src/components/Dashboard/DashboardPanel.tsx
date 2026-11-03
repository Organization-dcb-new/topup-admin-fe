import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface DashboardPanelProps {
  title: string
  icon?: LucideIcon
  /** Tailwind classes for the icon tile, e.g. to tint a warning panel. */
  iconClassName?: string
  actions?: ReactNode
  className?: string
  bodyClassName?: string
  /** Stagger index for the entrance animation. */
  order?: number
  /** Warning tints the border, for sections that need attention. */
  tone?: 'default' | 'warning'
  children: ReactNode
}

/** Notched white card with a title row, shared by every dashboard section. */
export function DashboardPanel({
  title,
  icon: Icon,
  iconClassName,
  actions,
  className,
  bodyClassName,
  order = 0,
  tone = 'default',
  children,
}: DashboardPanelProps) {
  return (
    <section
      className={cn(
        'min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both',
        className
      )}
      style={{ animationDelay: `${order * 60}ms` }}
    >
      <div
        className={cn(
          'h-full p-px transition-colors duration-500 hud-clip',
          tone === 'warning' ? 'bg-amber-300/80' : 'bg-slate-200/80'
        )}
      >
        <div className='flex h-full flex-col bg-white hud-clip'>
          <header className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5'>
            <h2 className='flex min-w-0 items-center gap-2.5'>
              {Icon && (
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center bg-brand-purple/10 text-brand-purple hud-clip-sm',
                    iconClassName
                  )}
                  aria-hidden
                >
                  <Icon className='size-3.5' />
                </span>
              )}
              <span className='truncate font-display text-xs font-semibold uppercase tracking-[0.2em] text-slate-700'>
                {title}
              </span>
            </h2>
            {actions}
          </header>
          <div className={cn('flex-1 p-5', bodyClassName)}>{children}</div>
        </div>
      </div>
    </section>
  )
}
