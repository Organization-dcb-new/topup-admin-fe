import { useState } from 'react'
import { ImageOff } from 'lucide-react'

import { cn } from '@/lib/utils'

interface EntityAvatarProps {
  src?: string | null
  alt: string
  className?: string
}

/**
 * Ikon entitas dengan fallback yang TIDAK memicu permintaan jaringan lagi.
 * Versi lama menyetel `src = '/placeholder.png'` di onError; berkas itu tidak
 * ada, dan karena nginx mengembalikan index.html untuk path tak dikenal,
 * gambar gagal lagi dan onError memanggil dirinya berulang tanpa henti.
 */
export function EntityAvatar({ src, alt, className }: EntityAvatarProps) {
  const [failed, setFailed] = useState(false)
  const showImage = !!src && !failed

  return (
    <span
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40',
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading='lazy'
          className='h-full w-full object-contain'
          onError={() => setFailed(true)}
        />
      ) : (
        <ImageOff
          className='h-4 w-4 text-muted-foreground'
          aria-label={alt}
          role='img'
        />
      )}
    </span>
  )
}
