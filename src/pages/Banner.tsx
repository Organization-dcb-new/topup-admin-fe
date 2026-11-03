import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  ImageOff,
  Images,
  Maximize2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { DangerDialog } from '@/components/Auth/DangerDialog'
import { hudEyebrowClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { BannerFormDialog } from '@/components/Banner/BannerFormDialog'
import { LINK_KIND_META, linkKind } from '@/components/Banner/banner-link'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { PERM } from '@/constants/permissions'
import { useDeleteBanner, useGetBanners } from '@/hooks/useBanner'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { cn } from '@/lib/utils'
import type { Banner } from '@/types/banner'

const iconButtonClass =
  'grid size-8 shrink-0 place-items-center text-slate-400 hud-clip-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'

export default function BannerPage() {
  const { t } = useTranslation('common')
  const { data, isLoading, isError, isFetching, refetch } = useGetBanners()
  const deleteBanner = useDeleteBanner()
  const banners = data?.data ?? []
  // 'new' opens the form empty; a banner opens it for editing.
  const [formTarget, setFormTarget] = useState<Banner | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<Banner | null>(null)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const openCreate = () => setFormTarget('new')

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('bannerPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('bannerPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('bannerPage.subtitle')}</p>
          </div>
          <div className='flex shrink-0 items-center gap-3'>
            {data && (
              <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
                {t('bannerPage.total', { count: banners.length })}
              </span>
            )}
            <Can permission={PERM.bannerCreate}>
              <button type='button' onClick={openCreate} className={hudPrimaryButtonClass}>
                <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
                <Plus className='size-4' aria-hidden />
                {t('bannerPage.addBtn')}
              </button>
            </Can>
          </div>
        </header>

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('bannerPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('bannerPage.retry')}
            </button>
          </div>
        )}

        {!isError && !isLoading && banners.length === 0 ? (
          <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center animate-in fade-in duration-500'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              <Images className='size-6' aria-hidden />
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>{t('bannerPage.emptyTitle')}</h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>{t('bannerPage.emptyBody')}</p>
            <Can permission={PERM.bannerCreate}>
              <button type='button' onClick={openCreate} className={`${hudPrimaryButtonClass} mt-6`}>
                <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
                <Plus className='size-4' aria-hidden />
                {t('bannerPage.addBtn')}
              </button>
            </Can>
          </div>
        ) : (
          <ul className='grid gap-5 md:grid-cols-2 xl:grid-cols-3' aria-busy={isFetching}>
            {isLoading &&
              Array.from({ length: 6 }, (_, i) => (
                <li key={i} className='h-64 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />
              ))}
            {banners.map((banner, index) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                order={index}
                onPreview={() => setPreviewIndex(index)}
                onEdit={() => setFormTarget(banner)}
                onDelete={() => setToDelete(banner)}
              />
            ))}
          </ul>
        )}
      </div>

      <BannerLightbox banners={banners} index={previewIndex} onIndexChange={setPreviewIndex} />

      <BannerFormDialog
        open={formTarget !== null}
        onOpenChange={(open) => !open && setFormTarget(null)}
        banner={formTarget === 'new' ? undefined : (formTarget ?? undefined)}
      />

      <DangerDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        eyebrow={t('bannerPage.deleteConfirm.eyebrow')}
        title={t('bannerPage.deleteConfirm.title')}
        description={
          <span className='block space-y-3'>
            {toDelete && (
              <img src={toDelete.image} alt='' className='block aspect-[16/7] w-full rounded-md object-cover ring-1 ring-slate-200' />
            )}
            <span className='block'>{t('bannerPage.deleteConfirm.description')}</span>
          </span>
        }
        confirmLabel={t('bannerPage.deleteConfirm.confirm')}
        cancelLabel={t('bannerPage.deleteConfirm.cancel')}
        pending={deleteBanner.isPending}
        onConfirm={() => {
          if (!toDelete) return
          deleteBanner.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })
        }}
      />
    </DashboardLayout>
  )
}

function BannerImage({ src, className }: { src: string; className?: string }) {
  const { t } = useTranslation('common')
  // Keyed on src, so a replaced image gets a fresh chance to load.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src || failedSrc === src) {
    return (
      <span className={cn('flex flex-col items-center justify-center gap-1.5 bg-slate-100 text-slate-400', className)}>
        <ImageOff className='size-6' aria-hidden />
        <span className='text-xs'>{t('bannerPage.imageBroken')}</span>
      </span>
    )
  }
  return <img src={src} alt='' loading='lazy' onError={() => setFailedSrc(src)} className={className} />
}

interface BannerCardProps {
  banner: Banner
  order: number
  onPreview: () => void
  onEdit: () => void
  onDelete: () => void
}

function BannerCard({ banner, order, onPreview, onEdit, onDelete }: BannerCardProps) {
  const { t } = useTranslation('common')
  const kind = linkKind(banner.redirect_link)

  return (
    <li
      className='min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'
      style={{ animationDelay: `${order * 50}ms` }}
    >
      <div className='h-full bg-slate-200/80 p-px transition-colors duration-300 hud-clip hover:bg-brand-purple/40'>
        <article className='flex h-full flex-col bg-white hud-clip'>
          <button
            type='button'
            onClick={onPreview}
            aria-label={t('bannerPage.preview', { index: order + 1 })}
            className='group relative block aspect-[16/7] w-full overflow-hidden bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/60'
          >
            <BannerImage
              src={banner.image}
              className='size-full object-cover transition-transform duration-700 ease-hud group-hover:scale-[1.04]'
            />
            <span className='absolute left-3 top-3 bg-slate-950/70 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-sm hud-clip-sm'>
              #{order + 1}
            </span>
            <span className='absolute inset-0 grid place-items-center bg-slate-950/0 opacity-0 transition-all duration-300 group-hover:bg-slate-950/35 group-hover:opacity-100 group-focus-visible:bg-slate-950/35 group-focus-visible:opacity-100'>
              <span className='grid size-10 place-items-center bg-white/95 text-slate-800 hud-clip-sm'>
                <Maximize2 className='size-4' aria-hidden />
              </span>
            </span>
          </button>
          <div className='flex flex-1 items-center gap-2 p-4'>
            <LinkSummary link={banner.redirect_link} kind={kind} />
            <div className='flex shrink-0 items-center gap-0.5'>
              {kind !== 'none' && <CopyLinkButton link={banner.redirect_link} />}
              <Can permission={PERM.bannerUpdate}>
                <button
                  type='button'
                  onClick={onEdit}
                  aria-label={t('bannerPage.editBtn', { index: order + 1 })}
                  title={t('bannerPage.editBtn', { index: order + 1 })}
                  className={`${iconButtonClass} hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:ring-brand-purple/40`}
                >
                  <Pencil className='size-4' aria-hidden />
                </button>
              </Can>
              <Can permission={PERM.bannerDelete}>
                <button
                  type='button'
                  onClick={onDelete}
                  aria-label={t('bannerPage.deleteBtn', { index: order + 1 })}
                  title={t('bannerPage.deleteBtn', { index: order + 1 })}
                  className={`${iconButtonClass} hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-rose-500/30`}
                >
                  <Trash2 className='size-4' aria-hidden />
                </button>
              </Can>
            </div>
          </div>
        </article>
      </div>
    </li>
  )
}

function LinkSummary({ link, kind }: { link: string; kind: ReturnType<typeof linkKind> }) {
  const { t } = useTranslation('common')
  const meta = LINK_KIND_META[kind]
  const Icon = meta.icon

  return (
    <div className='flex min-w-0 flex-1 items-center gap-2.5'>
      <span className={cn('grid size-8 shrink-0 place-items-center hud-clip-sm', meta.chip)} aria-hidden>
        <Icon className='size-3.5' />
      </span>
      <div className='min-w-0'>
        <p className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
          {t(`bannerPage.linkKind.${kind}`)}
        </p>
        {kind === 'external' ? (
          <a
            href={link}
            target='_blank'
            rel='noopener noreferrer'
            title={link}
            className='group/link flex min-w-0 items-center gap-1 text-sm font-medium text-slate-700 transition-colors hover:text-brand-purple'
          >
            <span className='truncate'>{link.replace(/^https?:\/\//i, '')}</span>
            <ExternalLink className='size-3 shrink-0 opacity-0 transition-opacity group-hover/link:opacity-100' aria-hidden />
          </a>
        ) : (
          <p className={cn('truncate text-sm', kind === 'none' ? 'text-slate-400' : 'font-mono font-medium text-slate-700')} title={link || undefined}>
            {kind === 'none' ? t('bannerPage.noLink') : link}
          </p>
        )}
      </div>
    </div>
  )
}

function CopyLinkButton({ link }: { link: string }) {
  const { t } = useTranslation('common')
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await copyTextToClipboard(link)
    } catch {
      toast.error(t('bannerPage.copyFailed'))
      return
    }
    setCopied(true)
    toast.success(t('bannerPage.copied'))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type='button'
      onClick={copy}
      aria-label={t('bannerPage.copyLink')}
      title={t('bannerPage.copyLink')}
      className={`${iconButtonClass} hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:ring-brand-purple/40`}
    >
      {copied ? <Check className='size-4 text-emerald-600' aria-hidden /> : <Copy className='size-4' aria-hidden />}
    </button>
  )
}

interface BannerLightboxProps {
  banners: Banner[]
  index: number | null
  onIndexChange: (index: number | null) => void
}

/** Full-size preview that steps through the banners like the storefront carousel. */
function BannerLightbox({ banners, index, onIndexChange }: BannerLightboxProps) {
  const { t } = useTranslation('common')
  const banner = index !== null ? banners[index] : undefined
  const count = banners.length
  const step = (delta: number) => index !== null && onIndexChange((index + delta + count) % count)

  return (
    <Dialog open={!!banner} onOpenChange={(open) => !open && onIndexChange(null)}>
      <DialogContent
        className='gap-0 overflow-hidden rounded-xl border-slate-800 bg-slate-950 p-0 text-white shadow-2xl sm:max-w-4xl'
        onKeyDown={(e) => {
          if (count < 2) return
          if (e.key === 'ArrowRight') step(1)
          if (e.key === 'ArrowLeft') step(-1)
        }}
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {banner && index !== null && (
          <>
            <div className='relative bg-black'>
              <BannerImage
                key={banner.id}
                src={banner.image}
                className='mx-auto block max-h-[70vh] w-full object-contain animate-in fade-in duration-300'
              />
              {count > 1 && (
                <>
                  <LightboxArrow side='left' label={t('bannerPage.lightbox.prev')} onClick={() => step(-1)} />
                  <LightboxArrow side='right' label={t('bannerPage.lightbox.next')} onClick={() => step(1)} />
                </>
              )}
            </div>
            <div className='flex flex-wrap items-center justify-between gap-3 px-5 py-3.5'>
              <div className='min-w-0'>
                <DialogTitle className='font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/90'>
                  {t('bannerPage.lightbox.title', { index: index + 1, count })}
                </DialogTitle>
                <DialogDescription className='truncate text-sm text-white/60'>
                  {banner.redirect_link || t('bannerPage.noLink')}
                </DialogDescription>
              </div>
              {count > 1 && (
                <div className='flex items-center gap-1.5' aria-hidden>
                  {banners.map((b, i) => (
                    <span
                      key={b.id}
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-300 ease-hud',
                        i === index ? 'w-6 bg-linear-to-r from-brand-purple to-brand-cyan' : 'w-1.5 bg-white/25'
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function LightboxArrow({ side, label, onClick }: { side: 'left' | 'right'; label: string; onClick: () => void }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center bg-white/90 text-slate-800 shadow-lg hud-clip-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan',
        side === 'left' ? 'left-3' : 'right-3'
      )}
    >
      <Icon className='size-5' aria-hidden />
    </button>
  )
}
