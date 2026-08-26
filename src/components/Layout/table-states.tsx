import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Placeholder berbentuk baris, bukan spinner di tengah kotak: tinggi kartu
 * tidak ikut mengempis lalu mengembang tiap kali data dimuat.
 */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className='space-y-2 p-1'>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className='h-12 w-full rounded-lg' />
      ))}
    </div>
  )
}

export function EmptyState({
  message,
  action,
}: {
  message: string
  action?: ReactNode
}) {
  return (
    <div className='flex flex-col items-center gap-3 px-4 py-14 text-center'>
      <span
        className='flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground'
        aria-hidden
      >
        <Inbox className='h-6 w-6' />
      </span>
      <p className='text-sm text-muted-foreground'>{message}</p>
      {action}
    </div>
  )
}
