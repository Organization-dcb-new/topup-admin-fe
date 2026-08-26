import { useState } from 'react'
import { ImageOff } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Banner } from '@/types/banner'

/**
 * Nama yang dibacakan pembaca layar untuk gambar sebuah banner. Aturannya
 * hidup di sini saja: selama thumbnail daftar dan slide pratinjau memakai
 * komponen ini, keduanya tidak mungkin menyebut nama berbeda untuk banner
 * yang sama.
 */
function bannerImageLabel(banner: Banner): string {
  return banner.alt_text.trim() === '' ? banner.title : banner.alt_text
}

interface BannerImageProps {
  banner: Banner
  /** Slide pertama dimuat eager supaya pratinjau tidak berkedip saat dibuka. */
  eager?: boolean
  /** Ukuran ikon cadangan mengikuti ruang yang disediakan pemanggil. */
  fallbackIconClassName?: string
  /** Pratinjau besar menyebut nama banner di bawah ikon; thumbnail tidak. */
  showFallbackLabel?: boolean
}

/**
 * Gambar banner dengan cadangan ikon. Gambar yang gagal dimuat diganti ikon,
 * BUKAN `src` cadangan: berkas placeholder tidak ada di repo ini dan nginx
 * mengembalikan index.html untuk path tak dikenal, sehingga onError akan
 * memanggil dirinya tanpa henti.
 *
 * Ditulis sekali dan dipakai daftar maupun pratinjau: dua salinan sebelumnya
 * sudah mulai menyimpang, dan aturan nama alt-nya pun tertulis dua kali.
 */
export function BannerImage({
  banner,
  eager = false,
  fallbackIconClassName,
  showFallbackLabel = false,
}: BannerImageProps) {
  // Kegagalan disimpan sebagai URL, bukan boolean. Identitas komponen terikat
  // pada banner.id, jadi boolean tidak pernah kembali ke false setelah admin
  // memperbaiki URL gambarnya: pratinjau akan terus menampilkan ikon rusak
  // padahal gambarnya sudah benar, sampai halaman dimuat ulang penuh.
  const [failedFor, setFailedFor] = useState<string | null>(null)
  const label = bannerImageLabel(banner)

  if (failedFor === banner.image) {
    return (
      <span className='flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground'>
        <ImageOff className={cn('h-4 w-4', fallbackIconClassName)} aria-hidden />
        {showFallbackLabel && (
          <span className='max-w-[80%] truncate text-xs'>{label}</span>
        )}
      </span>
    )
  }

  return (
    <img
      src={banner.image}
      alt={label}
      loading={eager ? 'eager' : 'lazy'}
      decoding='async'
      draggable={false}
      className='h-full w-full object-cover'
      onError={() => setFailedFor(banner.image)}
    />
  )
}
