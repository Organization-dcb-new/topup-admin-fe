import { cn } from '@/lib/utils'
import { ImageOff } from 'lucide-react'
import { useState } from 'react'

/**
 * Gambar dengan fallback lokal saat `src` kosong atau gagal dimuat.
 *
 * Pola lama di beberapa tabel adalah `onError` yang mengarahkan `src` ke
 * `/placeholder.png`, padahal repo ini tidak punya direktori `public/` dan
 * berkas itu tidak pernah ada — jadi yang tampil tetap ikon gambar rusak
 * bawaan browser.
 */
export function FallbackImage({
  src,
  alt,
  label,
  className,
  fallbackClassName,
}: {
  src?: string | null
  alt: string
  /** Teks pendek di dalam blok fallback. Tanpa ini hanya ikon yang tampil. */
  label?: string
  className?: string
  fallbackClassName?: string
}) {
  // Disimpan sebagai URL, bukan boolean, supaya statusnya ikut tereset sendiri
  // saat `src` berganti (mis. setelah thumbnail diganti).
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src || failedSrc === src) {
    return (
      <div
        role='img'
        aria-label={alt}
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-1 bg-[#f5f1e8] text-[#111]/45',
          fallbackClassName,
        )}
      >
        <ImageOff className='h-5 w-5 shrink-0' strokeWidth={2.5} aria-hidden />
        {label && (
          <span className='px-1 text-center text-[9px] font-black uppercase tracking-wider'>
            {label}
          </span>
        )}
      </div>
    )
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} />
}
