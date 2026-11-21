import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ImageIcon, Link2, Megaphone, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { DangerDialog } from '@/components/Auth/DangerDialog'
import { hudEyebrowClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { AnnouncementFormDialog } from '@/components/Announcement/AnnouncementFormDialog'
import {
  AnnouncementActiveToggle,
  AnnouncementDisplayBadge,
  AnnouncementLevelBadge,
  AnnouncementStatusChip,
} from '@/components/Announcement/AnnouncementParts'
import { getAnnouncementStatus, type AnnouncementStatus } from '@/components/Announcement/announcement-status'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { PERM } from '@/constants/permissions'
import { formatMaintenanceInstant } from '@/helpers/maintenance-datetime'
import { isAnnouncementGone, useDeleteAnnouncement, useGetAnnouncements } from '@/hooks/useAnnouncement'
import { useNow } from '@/hooks/useNow'
import { useRetained } from '@/hooks/useRetained'
import { cn } from '@/lib/utils'
import type { Announcement } from '@/types/announcement'

const iconButtonClass =
  'grid size-8 place-items-center text-slate-400 hud-clip-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'

/** Shared by the header row and every row, so the columns line up on wide screens. */
const columnsClass =
  '2xl:grid-cols-[minmax(0,1fr)_4.75rem_7.25rem_6.5rem_9.75rem_9rem_7.25rem]'

export default function AnnouncementPage() {
  const { t } = useTranslation('common')
  const now = useNow()
  const { data, isLoading, isError, isFetching, refetch } = useGetAnnouncements()
  const deleteAnnouncement = useDeleteAnnouncement()
  // 'new' opens the form empty; an announcement opens it for editing.
  const [formTarget, setFormTarget] = useState<Announcement | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<Announcement | null>(null)
  // The confirm dialog keeps naming its target while it animates closed.
  const deleting = useRetained(toDelete)

  // Newest first, as the API sends them.
  const entries = useMemo(
    () => (data?.data ?? []).map((a) => ({ announcement: a, status: getAnnouncementStatus(a, now) })),
    [data, now]
  )
  const liveCount = entries.filter((e) => e.status === 'live').length

  const openCreate = () => setFormTarget('new')

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('announcementPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>
              {t('announcementPage.title')}
            </h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('announcementPage.subtitle')}</p>
          </div>
          <div className='flex shrink-0 items-center gap-3'>
            {data && (
              <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
                {t('announcementPage.total', { count: entries.length, live: liveCount })}
              </span>
            )}
            <Can permission={PERM.announcementCreate}>
              <button type='button' onClick={openCreate} className={hudPrimaryButtonClass}>
                <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
                <Plus className='size-4' aria-hidden />
                {t('announcementPage.addBtn')}
              </button>
            </Can>
          </div>
        </header>

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('announcementPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('announcementPage.retry')}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className='h-80 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />
        ) : !isError && entries.length === 0 ? (
          <EmptyState onCreate={openCreate} />
        ) : (
          entries.length > 0 && (
            <div className='bg-slate-200/80 p-px hud-clip'>
              <div className='bg-white hud-clip'>
                <div
                  className={cn(
                    'hidden gap-x-4 border-b border-slate-100 px-5 py-2.5 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 2xl:grid',
                    columnsClass
                  )}
                  aria-hidden
                >
                  <span>{t('announcementPage.columns.title')}</span>
                  <span>{t('announcementPage.columns.display')}</span>
                  <span>{t('announcementPage.columns.level')}</span>
                  <span>{t('announcementPage.columns.status')}</span>
                  <span>{t('announcementPage.columns.schedule')}</span>
                  <span>{t('announcementPage.columns.updated')}</span>
                  <span className='text-right'>{t('announcementPage.columns.actions')}</span>
                </div>
                <ul className='divide-y divide-slate-100' aria-busy={isFetching}>
                  {entries.map(({ announcement, status }, index) => (
                    <AnnouncementRow
                      key={announcement.id}
                      announcement={announcement}
                      status={status}
                      order={index}
                      onEdit={() => setFormTarget(announcement)}
                      onDelete={() => setToDelete(announcement)}
                    />
                  ))}
                </ul>
              </div>
            </div>
          )
        )}
      </div>

      <AnnouncementFormDialog
        open={formTarget !== null}
        onOpenChange={(open) => !open && setFormTarget(null)}
        announcement={formTarget === 'new' ? undefined : (formTarget ?? undefined)}
      />

      <DangerDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        eyebrow={t('announcementPage.deleteConfirm.eyebrow')}
        title={t('announcementPage.deleteConfirm.title', { name: deleting?.title ?? '' })}
        description={t('announcementPage.deleteConfirm.description')}
        confirmLabel={t('announcementPage.deleteConfirm.confirm')}
        cancelLabel={t('announcementPage.deleteConfirm.cancel')}
        pending={deleteAnnouncement.isPending}
        onConfirm={() => {
          if (!toDelete) return
          deleteAnnouncement.mutate(toDelete.id, {
            onSuccess: () => setToDelete(null),
            // Already gone: nothing left to confirm.
            onError: (err) => isAnnouncementGone(err) && setToDelete(null),
          })
        }}
      />
    </DashboardLayout>
  )
}

interface AnnouncementRowProps {
  announcement: Announcement
  status: AnnouncementStatus
  order: number
  onEdit: () => void
  onDelete: () => void
}

function AnnouncementRow({ announcement: a, status, order, onEdit, onDelete }: AnnouncementRowProps) {
  const { t, i18n } = useTranslation('common')
  const locale = i18n.resolvedLanguage
  const muted = status === 'ended' || status === 'off'
  const editor = a.updated_by || a.created_by
  const updatedAt = formatMaintenanceInstant(a.updated_at, { locale, dateStyle: 'medium' })
  const start = a.starts_at ? formatMaintenanceInstant(a.starts_at, { locale, dateStyle: 'medium' }) : t('announcementPage.schedule.now')
  const end = a.ends_at ? formatMaintenanceInstant(a.ends_at, { locale, dateStyle: 'medium' }) : t('announcementPage.schedule.noEnd')
  const preview = a.body.replace(/\s+/g, ' ').trim()

  return (
    <li
      className='animate-in fade-in duration-300 fill-mode-both'
      style={{ animationDelay: `${Math.min(order, 12) * 30}ms` }}
    >
      {/* Below 2xl the cells stack into a card; from 2xl they line up under the header row. */}
      <div
        className={cn(
          'grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2.5 px-4 py-3.5 transition-colors hover:bg-brand-purple/[0.02] sm:px-5 2xl:items-center',
          columnsClass
        )}
      >
        <div className='min-w-0 space-y-0.5'>
          <p className={cn('break-words text-sm font-semibold leading-snug', muted ? 'text-slate-500' : 'text-slate-900')}>
            {a.title}
          </p>
          {preview && (
            <p className='line-clamp-2 break-words text-xs leading-relaxed text-slate-500' title={a.body}>
              {preview}
            </p>
          )}
          {(a.link_url || (a.display === 'popup' && a.image_url)) && (
            <p className='flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 pt-0.5 text-[11px] text-slate-400'>
              {a.link_url && (
                <span className='inline-flex min-w-0 max-w-full items-center gap-1' title={a.link_url}>
                  <Link2 className='size-3 shrink-0' aria-hidden />
                  <span className='truncate font-mono'>{a.link_url.replace(/^https?:\/\//i, '')}</span>
                </span>
              )}
              {a.display === 'popup' && a.image_url && (
                <span className='inline-flex items-center gap-1'>
                  <ImageIcon className='size-3 shrink-0' aria-hidden />
                  {t('announcementPage.hasImage')}
                </span>
              )}
            </p>
          )}
        </div>

        <div className='col-span-2 flex flex-wrap items-center gap-1.5 2xl:contents'>
          <div className='2xl:min-w-0'>
            <AnnouncementDisplayBadge display={a.display} />
          </div>
          <div className='2xl:min-w-0'>
            <AnnouncementLevelBadge level={a.level} />
          </div>
          <div className='2xl:min-w-0'>
            <AnnouncementStatusChip status={status} />
          </div>
        </div>

        <div className='col-span-2 flex min-w-0 flex-wrap items-center gap-x-1.5 text-xs tabular-nums text-slate-600 2xl:col-span-1 2xl:block 2xl:space-y-0.5'>
          <span className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 2xl:hidden'>
            {t('announcementPage.columns.schedule')}
          </span>
          <span className='block'>{start}</span>
          <ArrowRight className='size-3 shrink-0 text-slate-300 2xl:hidden' aria-hidden />
          <span className='block'>
            <span className='hidden text-slate-300 2xl:inline' aria-hidden>→ </span>
            {end}
          </span>
        </div>

        <div className='col-span-2 min-w-0 text-xs text-slate-500 2xl:col-span-1'>
          {editor ? (
            <>
              <span className='2xl:hidden'>{t('announcementPage.updatedBy', { who: editor, date: updatedAt })}</span>
              <span className='hidden 2xl:block 2xl:truncate' title={editor}>
                {editor}
              </span>
              <span className='hidden tabular-nums text-slate-400 2xl:block'>{updatedAt}</span>
            </>
          ) : (
            <span className='tabular-nums'>{updatedAt}</span>
          )}
        </div>

        <div className='col-start-2 row-start-1 flex shrink-0 items-center justify-end gap-0.5 2xl:col-start-auto 2xl:row-start-auto'>
          <AnnouncementActiveToggle announcement={a} />
          <Can permission={PERM.announcementUpdate}>
            <button
              type='button'
              onClick={onEdit}
              aria-label={t('announcementPage.editBtn', { name: a.title })}
              title={t('announcementPage.editBtn', { name: a.title })}
              className={`${iconButtonClass} hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:ring-brand-purple/40`}
            >
              <Pencil className='size-4' aria-hidden />
            </button>
          </Can>
          <Can permission={PERM.announcementDelete}>
            <button
              type='button'
              onClick={onDelete}
              aria-label={t('announcementPage.deleteBtn', { name: a.title })}
              title={t('announcementPage.deleteBtn', { name: a.title })}
              className={`${iconButtonClass} hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-rose-500/30`}
            >
              <Trash2 className='size-4' aria-hidden />
            </button>
          </Can>
        </div>
      </div>
    </li>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  const { t } = useTranslation('common')
  return (
    <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center animate-in fade-in duration-500'>
      <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
        <Megaphone className='size-6' aria-hidden />
      </span>
      <h2 className='font-display text-xl font-bold text-slate-900'>{t('announcementPage.emptyTitle')}</h2>
      <p className='mt-1 max-w-sm text-sm text-slate-500'>{t('announcementPage.emptyBody')}</p>
      <Can permission={PERM.announcementCreate}>
        <button type='button' onClick={onCreate} className={`${hudPrimaryButtonClass} mt-6`}>
          <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
          <Plus className='size-4' aria-hidden />
          {t('announcementPage.addBtn')}
        </button>
      </Can>
    </div>
  )
}
