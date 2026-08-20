import { cn } from '@/lib/utils'
import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Gambar banner dengan fallback lokal.
 *
 * Sebelumnya `onError` mengarahkan `src` ke `/placeholder.png`, padahal repo
 * ini tidak punya direktori `public/` dan berkas itu tidak pernah ada — jadi
 * yang tampil tetap ikon gambar rusak bawaan browser.
 */
export function BannerImage({
  src,
  alt,
  className,
  fallbackClassName,
}: {
  src?: string | null
  alt: string
  className?: string
  fallbackClassName?: string
}) {
  const { t } = useTranslation('common')
  // Disimpan sebagai URL, bukan boolean, supaya statusnya ikut tereset
  // sendiri saat `src` berganti (mis. setelah banner diedit).
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src || failedSrc === src) {
    return (
      <div
        role='img'
        aria-label={alt}
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-1 bg-[#f5f1e8] text-[#111]/70',
          fallbackClassName,
        )}
      >
        <ImageOff className='h-5 w-5 shrink-0' strokeWidth={2.5} aria-hidden />
        <span className='px-1 text-center text-[9px] font-black uppercase tracking-wider'>
          {t('bannerTable.noImage')}
        </span>
      </div>
    )
  }

  return (
    <img src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} />
  )
}
