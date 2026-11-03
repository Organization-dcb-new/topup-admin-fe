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

interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedProps<T extends string> {
  value: T
  options: SegmentedOption<T>[]
  onChange: (value: T) => void
  label: string
  size?: 'sm' | 'md'
}

/** Compact single-choice switcher in the HUD style. */
export function Segmented<T extends string>({ value, options, onChange, label, size = 'sm' }: SegmentedProps<T>) {
  return (
    <div role='radiogroup' aria-label={label} className='inline-flex max-w-full overflow-x-auto bg-slate-100 p-0.5 hud-clip-sm'>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type='button'
            role='radio'
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'shrink-0 whitespace-nowrap font-display font-semibold uppercase tracking-[0.12em] transition-colors duration-300 ease-hud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40',
              size === 'md' ? 'h-9 px-3.5 text-[11px]' : 'h-7 px-2.5 text-[10px]',
              selected
                ? 'bg-white text-brand-purple shadow-sm hud-clip-sm'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
