import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

import { Can } from '@/components/Auth/Can'
import { Switch } from '@/components/ui/switch'
import { PERM } from '@/constants/permissions'
import { useUpdateAnnouncement } from '@/hooks/useAnnouncement'
import { cn } from '@/lib/utils'
import type { Announcement, AnnouncementDisplay, AnnouncementLevel } from '@/types/announcement'
import {
  DISPLAY_META,
  LEVEL_META,
  STATUS_STYLES,
  toAnnouncementInput,
  type AnnouncementStatus,
} from './announcement-status'

const chipClass =
  'inline-flex items-center gap-1.5 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] hud-clip-sm transition-colors duration-300'

export function AnnouncementStatusChip({ status }: { status: AnnouncementStatus }) {
  const { t } = useTranslation()
  const style = STATUS_STYLES[status]
  return (
    <span className={cn(chipClass, style.chip)}>
      <span className={cn('size-1.5 rounded-full', style.dot)} aria-hidden />
      {t(`announcementPage.status.${status}`)}
    </span>
  )
}

export function AnnouncementLevelBadge({ level }: { level: AnnouncementLevel }) {
  const { t } = useTranslation()
  const meta = LEVEL_META[level] ?? LEVEL_META.info
  const Icon = meta.icon
  return (
    <span className={cn(chipClass, meta.chip)}>
      <Icon className='size-3' aria-hidden />
      {t(`announcementPage.level.${level}`)}
    </span>
  )
}

export function AnnouncementDisplayBadge({ display }: { display: AnnouncementDisplay }) {
  const { t } = useTranslation()
  const Icon = (DISPLAY_META[display] ?? DISPLAY_META.bar).icon
  return (
    <span className={cn(chipClass, 'bg-slate-100 text-slate-600')}>
      <Icon className='size-3' aria-hidden />
      {t(`announcementPage.display.${display}`)}
    </span>
  )
}

/** On/off switch for admins allowed to change it; nothing for everyone else. */
export function AnnouncementActiveToggle({ announcement }: { announcement: Announcement }) {
  const { t } = useTranslation()
  const update = useUpdateAnnouncement()

  return (
    <Can permission={PERM.announcementUpdate}>
      <Switch
        checked={announcement.is_active}
        disabled={update.isPending}
        onCheckedChange={(checked) =>
          // PUT replaces everything, so send the saved announcement with only the switch changed.
          update.mutate({ id: announcement.id, payload: { ...toAnnouncementInput(announcement), is_active: checked } })
        }
        aria-label={t('announcementPage.toggleActive', { name: announcement.title })}
        title={t('announcementPage.toggleActive', { name: announcement.title })}
        className='mr-1.5 data-[state=checked]:bg-emerald-500'
      />
    </Can>
  )
}

interface AnnouncementPreviewProps {
  title: string
  body: string
  level: AnnouncementLevel
  display: AnnouncementDisplay
  linkUrl: string
  linkLabel: string
  imageUrl: string
}

/** Rough sketch of how the storefront shows it; the storefront has the final say on the look. */
export function AnnouncementPreview({ title, body, level, display, linkUrl, linkLabel, imageUrl }: AnnouncementPreviewProps) {
  const { t } = useTranslation()
  const meta = LEVEL_META[level] ?? LEVEL_META.info
  const Icon = meta.icon
  const shownTitle = title.trim() || t('announcementPage.preview.titlePlaceholder')
  const shownBody = body.trim()
  const hasLink = linkUrl.trim() !== ''
  const label = linkLabel.trim()

  const linkText = label ? (
    label
  ) : (
    <span className='italic opacity-80'>{t('announcementPage.preview.defaultLabel')}</span>
  )

  if (display === 'bar') {
    return (
      <div className='overflow-hidden rounded-md bg-white ring-1 ring-slate-200'>
        <div className={cn('flex items-center gap-2 px-3 py-2 text-xs transition-colors duration-300', meta.bar)}>
          <Icon className='size-3.5 shrink-0' aria-hidden />
          <p className='min-w-0 flex-1 truncate'>
            <span className='font-semibold'>{shownTitle}</span>
            {shownBody && <span className='opacity-90'> · {shownBody.replace(/\s+/g, ' ')}</span>}
          </p>
          {hasLink && <span className='shrink-0 font-semibold underline underline-offset-2'>{linkText}</span>}
          <X className='size-3.5 shrink-0 opacity-80' aria-hidden />
        </div>
        <div className='space-y-2 p-3' aria-hidden>
          <div className='h-2 w-1/3 rounded-full bg-slate-200' />
          <div className='grid grid-cols-3 gap-2'>
            <div className='aspect-square rounded bg-slate-100' />
            <div className='aspect-square rounded bg-slate-100' />
            <div className='aspect-square rounded bg-slate-100' />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='grid place-items-center rounded-md bg-slate-900/75 p-4'>
      <div className='relative w-full max-w-64 overflow-hidden rounded-lg bg-white shadow-xl'>
        <span className='absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-white/90 text-slate-500 shadow-sm' aria-hidden>
          <X className='size-3' />
        </span>
        {imageUrl && <img src={imageUrl} alt='' className='aspect-video w-full object-cover' />}
        <div className='space-y-2 p-3'>
          <span className={cn('inline-grid size-7 place-items-center rounded-md transition-colors duration-300', meta.accent)}>
            <Icon className='size-3.5' aria-hidden />
          </span>
          <p className='break-words text-sm font-semibold leading-snug text-slate-900'>{shownTitle}</p>
          {shownBody && (
            <p className='line-clamp-6 whitespace-pre-line break-words text-xs leading-relaxed text-slate-600'>{shownBody}</p>
          )}
          {hasLink && (
            <span className={cn('block truncate rounded-md px-2 py-1.5 text-center text-xs font-semibold', meta.accent)}>
              {linkText}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
