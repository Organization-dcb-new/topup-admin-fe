import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'
import type { BlogStatus } from './types/blog'

interface BlogStatusBadgeProps {
  status: BlogStatus
  /**
   * `solid` untuk badge yang melayang di atas thumbnail: latar 10% opasitas
   * tidak terbaca di atas gambar yang isinya tidak bisa diprediksi.
   */
  variant?: 'soft' | 'solid'
  className?: string
}

/** Satu-satunya sumber warna status artikel — dipakai tabel, kartu grid, dan panel form. */
export function BlogStatusBadge({ status, variant = 'soft', className }: BlogStatusBadgeProps) {
  const { t } = useTranslation('common')
  const isPublished = status === 'published'
  const label = isPublished ? t('blogTable.statusPublished') : t('blogTable.statusDraft')

  const tone =
    variant === 'solid'
      ? isPublished
        ? 'border-transparent bg-success text-success-foreground'
        : 'border-transparent bg-warning text-warning-foreground'
      : isPublished
        ? 'border-success/30 bg-success/10 text-success'
        : 'border-warning/35 bg-warning/10 text-warning'

  const dotTone =
    variant === 'solid' ? 'bg-current' : isPublished ? 'bg-success' : 'bg-warning'

  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold',
        tone,
        className,
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 shrink-0 rounded-full',
          dotTone,
          isPublished && 'animate-pulse motion-reduce:animate-none',
        )}
        aria-hidden
      />
      {label}
    </span>
  )
}
