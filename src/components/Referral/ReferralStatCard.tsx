import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ReferralStatCardProps {
  label: string
  value: string
  icon: LucideIcon
  /** Judul lengkap saat nilainya diringkas (mis. mata uang kompak). */
  title?: string
  valueClass?: string
  /** Keterangan kecil di bawah nilai — dipakai untuk menyebut cakupan hitungan. */
  hint?: string
}

/**
 * Kartu statistik halaman referral. Bentuknya mengikuti StatCard di dashboard
 * supaya kedua layar terbaca sebagai satu sistem.
 */
export function ReferralStatCard({
  label,
  value,
  icon: Icon,
  title,
  valueClass,
  hint,
}: ReferralStatCardProps) {
  return (
    <Card className='gap-0 rounded-xl py-0 shadow-sm ring-1 ring-gray-900/5'>
      <CardContent className='space-y-1 p-3'>
        <div className='flex items-center justify-between gap-2'>
          <p className='truncate text-xs font-medium text-muted-foreground'>{label}</p>
          <span
            className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary'
            aria-hidden
          >
            <Icon className='h-3.5 w-3.5' />
          </span>
        </div>
        <p
          title={title}
          className={cn('truncate text-xl font-semibold tabular-nums text-foreground', valueClass)}
        >
          {value}
        </p>
        {hint && <p className='text-[11px] leading-tight text-muted-foreground'>{hint}</p>}
      </CardContent>
    </Card>
  )
}
