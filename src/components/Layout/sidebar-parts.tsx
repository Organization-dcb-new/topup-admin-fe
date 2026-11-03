import { useState, type ReactElement, type ReactNode } from 'react'
import { Tooltip } from 'radix-ui'

import { cn } from '@/lib/utils'

/** Row text that fades out, rather than unmounting, while the sidebar collapses to the rail. */
export function RowLabel({ rail, children }: { rail: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        'min-w-0 truncate transition-[opacity,translate] duration-300 ease-hud',
        rail && '-translate-x-1 opacity-0'
      )}
    >
      {children}
    </span>
  )
}

interface RailTooltipProps {
  label: string
  rail: boolean
  children: ReactElement
}

/**
 * Names an icon-only row while the sidebar is collapsed. The tooltip stays mounted in both
 * modes (just never opens when expanded) so the row isn't remounted and its fade can play.
 */
export function RailTooltip({ label, rail, children }: RailTooltipProps) {
  const [open, setOpen] = useState(false)
  return (
    <Tooltip.Root open={rail && open} onOpenChange={setOpen}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side='right'
          sideOffset={14}
          className='z-[60] rounded-md bg-slate-900 px-2.5 py-1.5 font-display text-xs font-semibold tracking-wide text-white shadow-lg animate-in fade-in zoom-in-95 slide-in-from-left-1 duration-150'
        >
          {label}
          <Tooltip.Arrow className='fill-slate-900' />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
