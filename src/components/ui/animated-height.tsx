import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * Eases height changes (content swaps, errors appearing) instead of letting the container jump.
 * The 4px bleed keeps input focus rings from being clipped. `overflow-clip` rather than `-hidden`,
 * because a hidden-overflow box can still be scrolled by focus() and would shift the content sideways.
 */
export function AnimatedHeight({ children, className }: { children: ReactNode; className?: string }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>()

  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={cn('-m-1 overflow-clip transition-[height] duration-500 ease-hud', className)}
      style={{ height }}
    >
      <div ref={innerRef} className='p-1'>
        {children}
      </div>
    </div>
  )
}
