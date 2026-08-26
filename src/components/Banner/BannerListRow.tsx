import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  ArrowDown,
  ArrowUp,
  CalendarClock,
  Check,
  Copy,
  ExternalLink,
  Link2,
  Link2Off,
  Pencil,
} from 'lucide-react'

import { Can } from '@/components/Auth/Can'
import { BannerFormDialog } from '@/components/Banner/BannerFormDialog'
import { BannerImage } from '@/components/Banner/BannerImage'
import { Button } from '@/components/ui/button'
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog'
import { Switch } from '@/components/ui/switch'
import { PERM } from '@/constants/permissions'
import {
  useDeleteBanner,
  useToggleBannerStatus,
  useUpdateBanner,
} from '@/hooks/useBanner'
import { useNow } from '@/hooks/useNow'
import { bannerScheduleState, toTime } from '@/lib/banner-schedule'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { toSafeLink } from '@/lib/safe-url'
import { cn } from '@/lib/utils'
import type { Banner } from '@/types/banner'

const COPIED_RESET_MS = 2000

const formatMoment = (raw: string | null, locale: string): string | null => {
  const time = toTime(raw)
  if (time === null) return null
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(time))
}

export function BannerListRow({
  banner,
  index,
  total,
  onMove,
  isReordering,
}: {
  banner: Banner
  index: number
  total: number
  onMove: (direction: 'up' | 'down') => void
  isReordering: boolean
}) {
  const { t, i18n } = useTranslation('common')
  const [editOpen, setEditOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  // Jam yang sama dengan yang dipakai pratinjau, supaya chip di baris ini
  // tidak pernah menyebut "kedaluwarsa" untuk banner yang masih tayang di
  // pratinjau tepat di atasnya.
  const now = useNow()

  const updateBanner = useUpdateBanner(banner.id)
  const deleteBanner = useDeleteBanner(banner.id)
  const toggleStatus = useToggleBannerStatus(banner.id)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), COPIED_RESET_MS)
    return () => window.clearTimeout(timer)
  }, [copied])

  const locale = i18n.language.startsWith('id') ? 'id-ID' : 'en-US'
  const link = toSafeLink(banner.redirect_link)
  const start = formatMoment(banner.start_at, locale)
  const end = formatMoment(banner.end_at, locale)
  const scheduleState = bannerScheduleState(banner, now)

  const scheduleText =
    start !== null && end !== null
      ? t('bannerList.scheduleBetween', { start, end })
      : start !== null
        ? t('bannerList.scheduleFrom', { start })
        : end !== null
          ? t('bannerList.scheduleUntil', { end })
          : t('bannerList.scheduleAlways')

  const handleCopy = async () => {
    if (link === null) return
    try {
      await copyTextToClipboard(link.href)
      setCopied(true)
      toast.success(t('bannerToasts.copySuccess'))
    } catch {
      toast.error(t('bannerToasts.copyError'))
    }
  }

  return (
    <li
      aria-label={t('bannerList.rowAria', {
        title: banner.title,
        order: index + 1,
        total,
      })}
      style={{ animationDelay: `${index * 40}ms` }}
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-xs transition-colors duration-200 hover:border-primary/40 sm:flex-row sm:items-center sm:gap-4 sm:p-4',
        'animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards duration-300 motion-reduce:animate-none motion-reduce:transition-none',
        !banner.is_active && 'bg-muted/30'
      )}
    >
      <div className='flex min-w-0 flex-1 items-center gap-3 sm:gap-4'>
        <span
          className='flex h-7 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-xs font-semibold tabular-nums text-muted-foreground'
          aria-hidden
        >
          {t('bannerList.orderBadge', { order: index + 1 })}
        </span>

        <span className='flex aspect-video w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted sm:w-32'>
          <BannerImage banner={banner} />
        </span>

        <div className='min-w-0 flex-1 space-y-1.5'>
          <p className='truncate text-sm font-semibold text-foreground'>
            {banner.title}
          </p>

          <div className='flex min-w-0 items-center gap-1'>
            {link === null ? (
              <span className='flex min-w-0 items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
                <Link2Off className='h-3 w-3 shrink-0' aria-hidden />
                {t('bannerList.noLink')}
              </span>
            ) : link.isExternal ? (
              <a
                href={link.href}
                target='_blank'
                rel='noopener noreferrer'
                title={link.href}
                className='flex min-w-0 items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary transition-colors duration-200 hover:bg-primary/20 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none'
              >
                <ExternalLink className='h-3 w-3 shrink-0' aria-hidden />
                <span className='truncate'>{link.href}</span>
                <span className='sr-only'>{t('bannerList.openExternal')}</span>
              </a>
            ) : (
              // Path internal milik storefront, bukan rute admin — ditampilkan
              // apa adanya supaya tidak melempar operator ke halaman 404.
              <span
                title={link.href}
                className='flex min-w-0 items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground'
              >
                <Link2 className='h-3 w-3 shrink-0' aria-hidden />
                <span className='truncate'>{link.href}</span>
                {/* Teks ini menerangkan JENIS nilainya, bukan sebuah aksi:
                    elemennya sengaja tidak bisa diklik, jadi menjanjikan
                    "membuka halaman" hanya menyesatkan pembaca layar. */}
                <span className='sr-only'>{t('bannerList.openInternal')}</span>
              </span>
            )}

            {link !== null && (
              <Button
                type='button'
                variant='ghost'
                size='icon-xs'
                className='shrink-0 text-muted-foreground'
                aria-label={
                  copied ? t('bannerList.copied') : t('bannerList.copyLink')
                }
                onClick={() => void handleCopy()}
              >
                {copied ? (
                  <Check className='h-3 w-3 text-emerald-600' aria-hidden />
                ) : (
                  <Copy className='h-3 w-3' aria-hidden />
                )}
              </Button>
            )}
          </div>

          <p className='flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground'>
            <CalendarClock className='h-3 w-3 shrink-0' aria-hidden />
            <span className='truncate'>{scheduleText}</span>
            {scheduleState !== 'live' && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold',
                  scheduleState === 'expired'
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                )}
              >
                {scheduleState === 'expired'
                  ? t('bannerList.scheduleExpired')
                  : t('bannerList.scheduleScheduled')}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className='flex shrink-0 items-center justify-end gap-1 sm:gap-2'>
        <Can perm={PERM.BANNER_UPDATE}>
          <div className='flex items-center gap-2 pr-1'>
            <Switch
              checked={banner.is_active}
              disabled={toggleStatus.isPending}
              onCheckedChange={(next) => toggleStatus.mutate(next)}
              aria-label={t('bannerList.toggleAria', { title: banner.title })}
            />
            <span
              className={cn(
                'hidden text-xs font-medium sm:inline',
                banner.is_active ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {banner.is_active
                ? t('bannerList.statusActive')
                : t('bannerList.statusInactive')}
            </span>
          </div>

          <div className='flex items-center'>
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              className='text-muted-foreground'
              aria-label={t('bannerList.moveUp')}
              disabled={isReordering || index === 0}
              onClick={() => onMove('up')}
            >
              <ArrowUp className='h-4 w-4' aria-hidden />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              className='text-muted-foreground'
              aria-label={t('bannerList.moveDown')}
              disabled={isReordering || index === total - 1}
              onClick={() => onMove('down')}
            >
              <ArrowDown className='h-4 w-4' aria-hidden />
            </Button>
          </div>

          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            className='text-muted-foreground hover:text-foreground'
            aria-label={t('bannerList.edit')}
            onClick={() => setEditOpen(true)}
          >
            <Pencil className='h-4 w-4' aria-hidden />
          </Button>
        </Can>

        <Can perm={PERM.BANNER_DELETE}>
          <ConfirmDeleteDialog
            name={banner.title}
            title={t('bannerDelete.title')}
            description={t('bannerDelete.description', { title: banner.title })}
            triggerAriaLabel={t('bannerDelete.triggerAria')}
            isPending={deleteBanner.isPending}
            onConfirm={(done) =>
              deleteBanner.mutate(undefined, { onSuccess: done })
            }
          />
        </Can>
      </div>

      <BannerFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode='edit'
        initialValues={{
          title: banner.title,
          image: banner.image,
          alt_text: banner.alt_text,
          redirect_link: banner.redirect_link,
          is_active: banner.is_active,
          start_at: banner.start_at ?? '',
          end_at: banner.end_at ?? '',
        }}
        isPending={updateBanner.isPending}
        onSubmit={(values, done) => updateBanner.mutate(values, { onSuccess: done })}
      />
    </li>
  )
}
