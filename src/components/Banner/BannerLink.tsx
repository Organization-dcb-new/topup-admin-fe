import { cn } from '@/lib/utils'
import { Check, Copy, ExternalLink, Link2, ShieldAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { isExternalHref, safeRedirectHref } from '@/lib/url'

const CHIP_BASE =
  'nb-frame nb-frame-thin inline-flex min-w-0 items-center gap-1.5 px-2 py-1 text-[10px] font-black uppercase tracking-wide'

/**
 * Chip tautan redirect + tombol salin. Dipakai kartu grid maupun sel tabel
 * supaya penanganan tautan tidak amannya cuma ada di satu tempat.
 */
export function BannerLink({ url, className }: { url: string; className?: string }) {
  const { t } = useTranslation('common')
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
    }
  }, [])

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      // `navigator.clipboard` tidak ada di konteks non-secure (http), dan
      // izinnya bisa ditolak — dua-duanya dulu jadi unhandled rejection
      // sementara ikon tetap berubah seolah berhasil.
      await navigator.clipboard.writeText(url)
      setCopied(true)
      if (resetTimer.current) clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('bannerTable.copyFailed'))
    }
  }

  if (!url?.trim()) {
    return (
      <span
        className={cn(
          'nb-frame nb-frame-thin inline-block w-fit bg-[#f5f1e8] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-[#111]/70',
          className,
        )}
      >
        {t('bannerTable.noRedirectLink')}
      </span>
    )
  }

  const href = safeRedirectHref(url)

  if (!href) {
    return (
      <span
        className={cn(CHIP_BASE, 'w-fit max-w-full bg-[#ff4d3d]', className)}
        title={t('bannerTable.unsafeLinkHint', { url })}
      >
        <ShieldAlert className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
        <span className='truncate'>{t('bannerTable.unsafeLink')}</span>
      </span>
    )
  }

  const external = isExternalHref(href)

  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      {external ? (
        <a
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          className={cn(CHIP_BASE, 'nb-press-sm flex-1 bg-[#6fe3f5]')}
          title={href}
        >
          <ExternalLink className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
          <span className='truncate'>{href}</span>
        </a>
      ) : (
        // Path internal lewat router — dulu pakai <a href> biasa sehingga
        // memicu full reload dan membuang state aplikasi.
        <Link
          to={href}
          className={cn(CHIP_BASE, 'nb-press-sm flex-1 bg-[#ff9ed2]')}
          title={href}
        >
          <Link2 className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
          <span className='truncate'>{href}</span>
        </Link>
      )}

      <button
        type='button'
        onClick={handleCopy}
        title={t('bannerTable.copyLink')}
        aria-label={t('bannerTable.copyLink')}
        className={cn(
          'nb-frame nb-frame-thin nb-press-sm flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center',
          copied ? 'bg-[#c9f24d]' : 'bg-white',
        )}
      >
        {copied ? (
          <Check className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
        ) : (
          <Copy className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
        )}
      </button>
    </div>
  )
}
