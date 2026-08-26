import { useEffect, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Images,
  Link2,
  Link2Off,
  Pause,
  Play,
} from 'lucide-react'

import { BannerImage } from '@/components/Banner/BannerImage'
import { toSafeLink } from '@/lib/safe-url'
import { cn } from '@/lib/utils'
import type { Banner } from '@/types/banner'

const AUTOPLAY_INTERVAL = 5000
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Autoplay tidak boleh berjalan untuk operator yang meminta gerak minimal.
 * Dibaca lewat matchMedia, bukan hanya kelas `motion-reduce:`, karena kelas
 * hanya mematikan transisi CSS sedangkan geser otomatis dikendalikan timer.
 */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(REDUCED_MOTION_QUERY).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const query = window.matchMedia(REDUCED_MOTION_QUERY)
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/** Satu slide: gambar banner beserta keterangan judul dan tautannya. */
function CarouselSlide({ banner, eager }: { banner: Banner; eager: boolean }) {
  const { t } = useTranslation('common')
  const link = toSafeLink(banner.redirect_link)

  return (
    <div className='relative h-full w-full overflow-hidden bg-muted'>
      <BannerImage
        banner={banner}
        eager={eager}
        fallbackIconClassName='h-7 w-7'
        showFallbackLabel
      />

      {/* Keterangan tidak bisa difokus supaya slide non-aktif aman ditandai
          aria-hidden tanpa menyembunyikan elemen yang bisa di-tab */}
      <div className='pointer-events-none absolute inset-x-0 bottom-0 space-y-1 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-4 pt-12 pb-3 sm:px-5 sm:pb-4'>
        <p className='truncate text-sm font-semibold text-white drop-shadow-sm sm:text-base'>
          {banner.title}
        </p>
        <p className='flex items-center gap-1.5 text-xs text-white/85'>
          {link === null ? (
            <>
              <Link2Off className='h-3.5 w-3.5 shrink-0' aria-hidden />
              {t('bannerPreview.noLink')}
            </>
          ) : (
            <>
              {link.isExternal ? (
                <ExternalLink className='h-3.5 w-3.5 shrink-0' aria-hidden />
              ) : (
                <Link2 className='h-3.5 w-3.5 shrink-0' aria-hidden />
              )}
              <span className='truncate'>{link.href}</span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

/**
 * Pratinjau carousel storefront: hanya banner yang benar-benar tayang, dalam
 * urutan yang dilihat pengunjung. Autoplay sengaja dimulai dalam keadaan jeda
 * agar halaman admin tidak bergerak sendiri saat operator sedang menata urutan.
 */
export function BannerCarouselPreview({ banners }: { banners: Banner[] }) {
  const { t } = useTranslation('common')
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  const total = banners.length
  const isPlaying = playing && !reducedMotion

  // Daftar bisa menyusut saat banner dinonaktifkan/dihapus. Dikoreksi saat
  // render — pola resmi React untuk menyesuaikan state terhadap props baru.
  if (index > 0 && index > total - 1) {
    setIndex(0)
  }

  const current = total === 0 ? 0 : Math.min(index, total - 1)

  useEffect(() => {
    if (!playing || reducedMotion || total < 2) return
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % total)
    }, AUTOPLAY_INTERVAL)
    return () => window.clearInterval(timer)
  }, [playing, reducedMotion, total])

  const goTo = (next: number) => {
    if (total === 0) return
    setIndex(((next % total) + total) % total)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goTo(current - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      goTo(current + 1)
    }
  }

  if (total === 0) {
    return (
      <div className='flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 text-center'>
        <span
          className='flex h-11 w-11 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-xs'
          aria-hidden
        >
          <Images className='h-5 w-5' />
        </span>
        <p className='max-w-sm text-sm text-muted-foreground'>
          {t('bannerPage.previewEmpty')}
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      <div
        role='group'
        aria-roledescription={t('bannerPreview.roleDescription')}
        aria-label={t('bannerPreview.viewportLabel')}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className='relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
      >
        <div
          className='flex h-full w-full transition-transform duration-500 ease-out motion-reduce:transition-none'
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((banner, i) => (
            <div
              key={banner.id}
              className='h-full w-full shrink-0 grow-0 basis-full'
              aria-hidden={i !== current}
            >
              <CarouselSlide banner={banner} eager={i === 0} />
            </div>
          ))}
        </div>

        {total > 1 && (
          <>
            <button
              type='button'
              onClick={() => goTo(current - 1)}
              aria-label={t('bannerPreview.prev')}
              className='absolute top-1/2 left-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-xs transition-colors duration-200 hover:bg-black/65 focus-visible:ring-[3px] focus-visible:ring-white/60 focus-visible:outline-none motion-reduce:transition-none sm:left-3'
            >
              <ChevronLeft className='h-5 w-5' aria-hidden />
            </button>
            <button
              type='button'
              onClick={() => goTo(current + 1)}
              aria-label={t('bannerPreview.next')}
              className='absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-xs transition-colors duration-200 hover:bg-black/65 focus-visible:ring-[3px] focus-visible:ring-white/60 focus-visible:outline-none motion-reduce:transition-none sm:right-3'
            >
              <ChevronRight className='h-5 w-5' aria-hidden />
            </button>
          </>
        )}
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setPlaying((prev) => !prev)}
            disabled={reducedMotion || total < 2}
            aria-label={
              isPlaying
                ? t('bannerPreview.autoplayStop')
                : t('bannerPreview.autoplayStart')
            }
            className='flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none'
          >
            {isPlaying ? (
              <Pause className='h-4 w-4' aria-hidden />
            ) : (
              <Play className='h-4 w-4' aria-hidden />
            )}
          </button>
          <p
            className='text-xs font-medium tabular-nums text-muted-foreground'
            aria-live='polite'
          >
            {t('bannerPreview.position', { current: current + 1, total })}
          </p>
        </div>

        {total > 1 && (
          <div className='flex items-center gap-1.5'>
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                type='button'
                onClick={() => goTo(i)}
                aria-label={t('bannerPreview.goToSlide', { index: i + 1 })}
                aria-current={i === current}
                className={cn(
                  'h-2 rounded-full transition-all duration-300 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none',
                  i === current
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-border hover:bg-muted-foreground/50'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
