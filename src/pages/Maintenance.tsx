import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  CalendarClock,
  Layers,
  Pencil,
  Plus,
  RadioTower,
  RefreshCw,
  Trash2,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { DangerDialog } from '@/components/Auth/DangerDialog'
import { hudEyebrowClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { MaintenanceFormDialog } from '@/components/Maintenance/MaintenanceFormDialog'
import { MaintenanceModeToggle, MaintenanceStatusChip } from '@/components/Maintenance/MaintenanceParts'
import {
  STATUS_BAR,
  formatDuration,
  formatRelative,
  getMaintenanceStatus,
  getWindowMinutes,
  getWindowProgress,
  sortMaintenances,
  type MaintenanceStatus,
} from '@/components/Maintenance/maintenance-status'
import { PERM } from '@/constants/permissions'
import { formatMaintenanceInstant } from '@/helpers/maintenance-datetime'
import { useDeleteMaintenance, useGetMaintenances } from '@/hooks/useMaintenance'
import { useNow } from '@/hooks/useNow'
import { cn } from '@/lib/utils'
import type { Maintenance } from '@/types/maintenance'

const iconButtonClass =
  'grid size-8 place-items-center text-slate-400 hud-clip-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'

export default function MaintenancePage() {
  const { t } = useTranslation('common')
  const now = useNow()
  const { data, isLoading, isError, isFetching, refetch } = useGetMaintenances()
  const deleteMaintenance = useDeleteMaintenance()
  // 'new' opens the form empty; an entry opens it for editing.
  const [formTarget, setFormTarget] = useState<Maintenance | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<Maintenance | null>(null)

  const entries = useMemo(
    () =>
      sortMaintenances(data?.data ?? [], now).map((m) => ({
        maintenance: m,
        status: getMaintenanceStatus(m, now),
      })),
    [data, now]
  )
  const live = entries.filter((e) => e.status === 'live')
  const scheduledCount = entries.filter((e) => e.status === 'scheduled').length

  const openCreate = () => setFormTarget('new')

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('maintenancePage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>
              {t('maintenancePage.title')}
            </h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('maintenancePage.subtitle')}</p>
          </div>
          <Can permission={PERM.maintenanceCreate}>
            <button type='button' onClick={openCreate} className={cn(hudPrimaryButtonClass, 'shrink-0')}>
              <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
              <Plus className='size-4' aria-hidden />
              {t('maintenancePage.addBtn')}
            </button>
          </Can>
        </header>

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('maintenancePage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('maintenancePage.retry')}
            </button>
          </div>
        )}

        {live.length > 0 && <LiveBanner entries={live.map((e) => e.maintenance)} now={now} />}

        {!isError && (
          <ul className='grid grid-cols-3 gap-3 sm:gap-4'>
            <StatTile order={0} icon={RadioTower} label={t('maintenancePage.stats.live')} value={live.length} tone={live.length ? 'amber' : undefined} loading={isLoading} />
            <StatTile order={1} icon={CalendarClock} label={t('maintenancePage.stats.scheduled')} value={scheduledCount} tone={scheduledCount ? 'cyan' : undefined} loading={isLoading} />
            <StatTile order={2} icon={Layers} label={t('maintenancePage.stats.total')} value={entries.length} loading={isLoading} />
          </ul>
        )}

        {!isError && !isLoading && entries.length === 0 ? (
          <EmptyState onCreate={openCreate} />
        ) : (
          <ul className='grid gap-5 lg:grid-cols-2' aria-busy={isFetching}>
            {isLoading &&
              Array.from({ length: 4 }, (_, i) => (
                <li key={i} className='h-56 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />
              ))}
            {entries.map(({ maintenance, status }, index) => (
              <MaintenanceCard
                key={maintenance.id}
                maintenance={maintenance}
                status={status}
                now={now}
                order={index}
                onEdit={() => setFormTarget(maintenance)}
                onDelete={() => setToDelete(maintenance)}
              />
            ))}
          </ul>
        )}
      </div>

      <MaintenanceFormDialog
        open={formTarget !== null}
        onOpenChange={(open) => !open && setFormTarget(null)}
        maintenance={formTarget === 'new' ? undefined : (formTarget ?? undefined)}
      />

      <DangerDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        eyebrow={t('maintenancePage.deleteConfirm.eyebrow')}
        title={t('maintenancePage.deleteConfirm.title', { name: toDelete?.name ?? '' })}
        description={t('maintenancePage.deleteConfirm.description')}
        confirmLabel={t('maintenancePage.deleteConfirm.confirm')}
        cancelLabel={t('maintenancePage.deleteConfirm.cancel')}
        pending={deleteMaintenance.isPending}
        onConfirm={() => {
          if (!toDelete) return
          deleteMaintenance.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })
        }}
      />
    </DashboardLayout>
  )
}

function LiveBanner({ entries, now }: { entries: Maintenance[]; now: number }) {
  const { t, i18n } = useTranslation('common')
  // The storefront stays down until the last live window closes.
  const lastEnd = Math.max(...entries.map((m) => (m.end_time ? Date.parse(m.end_time) : Number.NaN)))

  return (
    <div
      role='status'
      className='bg-amber-300/70 p-px hud-clip animate-in fade-in slide-in-from-top-1 duration-500 ease-hud'
    >
      <div className='flex flex-col gap-3 bg-amber-50 px-5 py-4 hud-clip sm:flex-row sm:items-center'>
        <span className='relative grid size-10 shrink-0 place-items-center bg-linear-to-br from-amber-400 to-rose-500 text-white hud-clip-sm'>
          <RadioTower className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 flex-1'>
          <p className='font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700'>
            {t('maintenancePage.liveBanner.eyebrow')}
          </p>
          <p className='truncate font-display text-lg font-bold text-slate-900'>
            {entries.map((m) => m.name).join(' · ')}
          </p>
        </div>
        {Number.isFinite(lastEnd) && (
          <p className='shrink-0 text-sm font-medium text-amber-800'>
            {t('maintenancePage.relative.ends', { when: formatRelative(lastEnd, now, i18n.resolvedLanguage) })}
          </p>
        )}
      </div>
    </div>
  )
}

interface MaintenanceCardProps {
  maintenance: Maintenance
  status: MaintenanceStatus
  now: number
  order: number
  onEdit: () => void
  onDelete: () => void
}

function MaintenanceCard({ maintenance, status, now, order, onEdit, onDelete }: MaintenanceCardProps) {
  const { t, i18n } = useTranslation('common')
  const locale = i18n.resolvedLanguage
  const minutes = getWindowMinutes(maintenance)
  const progress = getWindowProgress(maintenance, now)
  const muted = status === 'ended' || status === 'off'
  const editor = maintenance.updated_by || maintenance.created_by

  const relative = (() => {
    const start = maintenance.start_time ? Date.parse(maintenance.start_time) : Number.NaN
    const end = maintenance.end_time ? Date.parse(maintenance.end_time) : Number.NaN
    if (status === 'live' && Number.isFinite(end)) return t('maintenancePage.relative.ends', { when: formatRelative(end, now, locale) })
    if (status === 'scheduled' && Number.isFinite(start)) return t('maintenancePage.relative.starts', { when: formatRelative(start, now, locale) })
    if (status === 'ended' && Number.isFinite(end)) return t('maintenancePage.relative.ended', { when: formatRelative(end, now, locale) })
    return null
  })()

  return (
    <li
      className='min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'
      style={{ animationDelay: `${order * 50}ms` }}
    >
      <div
        className={cn(
          'h-full p-px transition-colors duration-300 hud-clip',
          status === 'live' ? 'bg-amber-300/80' : 'bg-slate-200/80 hover:bg-brand-purple/40'
        )}
      >
        <article className='flex h-full flex-col bg-white hud-clip'>
          <div className={cn('h-1 transition-colors duration-300', STATUS_BAR[status])} aria-hidden />
          <div className='flex flex-1 flex-col gap-4 p-5'>
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0 space-y-1.5'>
                <h2
                  className={cn(
                    'truncate font-display text-lg font-bold transition-colors duration-300',
                    muted ? 'text-slate-500' : 'text-slate-900'
                  )}
                >
                  {maintenance.name}
                </h2>
                <MaintenanceStatusChip status={status} />
              </div>
              <MaintenanceModeToggle maintenance={maintenance} />
            </div>

            <div className={cn('rounded-lg border px-4 py-3', muted ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white')}>
              <div className='flex items-center gap-3'>
                <WindowEdge label={t('maintenancePage.window.start')} iso={maintenance.start_time} locale={locale} />
                <ArrowRight className='size-4 shrink-0 text-slate-300' aria-hidden />
                <WindowEdge label={t('maintenancePage.window.end')} iso={maintenance.end_time} locale={locale} />
              </div>
              {progress !== null && (
                <div className='mt-3 h-1 overflow-hidden rounded-full bg-slate-100'>
                  <div
                    className={cn(
                      'h-full rounded-full transition-[width] duration-700 ease-hud',
                      status === 'live' ? 'bg-linear-to-r from-amber-400 to-rose-500' : muted ? 'bg-slate-300' : 'bg-linear-to-r from-brand-purple to-brand-cyan'
                    )}
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
              )}
              <div className='mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-slate-500'>
                <span>
                  {minutes !== null && t('maintenancePage.window.duration', { duration: formatDuration(minutes, t) })}
                  <span className='ml-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
                    {t('maintenancePage.wib')}
                  </span>
                </span>
                {relative && (
                  <span className={cn('font-medium', status === 'live' ? 'text-amber-700' : 'text-slate-600')}>
                    {relative}
                  </span>
                )}
              </div>
            </div>

            <div className='mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-4'>
              <span className='min-w-0 truncate text-xs text-slate-500'>
                {editor &&
                  t('maintenancePage.updatedBy', {
                    who: editor,
                    date: formatMaintenanceInstant(maintenance.updated_at, { locale, dateStyle: 'medium' }),
                  })}
              </span>
              <div className='flex shrink-0 items-center gap-0.5'>
                <Can permission={PERM.maintenanceUpdate}>
                  <button
                    type='button'
                    onClick={onEdit}
                    aria-label={t('maintenancePage.editBtn', { name: maintenance.name })}
                    title={t('maintenancePage.editBtn', { name: maintenance.name })}
                    className={`${iconButtonClass} hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:ring-brand-purple/40`}
                  >
                    <Pencil className='size-4' aria-hidden />
                  </button>
                </Can>
                <Can permission={PERM.maintenanceDelete}>
                  <button
                    type='button'
                    onClick={onDelete}
                    aria-label={t('maintenancePage.deleteBtn', { name: maintenance.name })}
                    title={t('maintenancePage.deleteBtn', { name: maintenance.name })}
                    className={`${iconButtonClass} hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-rose-500/30`}
                  >
                    <Trash2 className='size-4' aria-hidden />
                  </button>
                </Can>
              </div>
            </div>
          </div>
        </article>
      </div>
    </li>
  )
}

function WindowEdge({ label, iso, locale }: { label: string; iso: string | null; locale?: string }) {
  return (
    <div className='min-w-0 flex-1'>
      <p className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{label}</p>
      <p className='text-sm font-semibold leading-snug tabular-nums text-slate-800'>
        {formatMaintenanceInstant(iso, { locale, dateStyle: 'medium' })}
      </p>
    </div>
  )
}

interface StatTileProps {
  order: number
  icon: LucideIcon
  label: string
  value: number
  tone?: 'amber' | 'cyan'
  loading: boolean
}

function StatTile({ order, icon: Icon, label, value, tone, loading }: StatTileProps) {
  return (
    <li
      className='min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'
      style={{ animationDelay: `${order * 60}ms` }}
    >
      <div className='h-full bg-slate-200/80 p-px hud-clip-sm'>
        <div className='flex h-full items-center justify-between gap-3 bg-white p-3 hud-clip-sm sm:p-4'>
          <div className='min-w-0'>
            <p className='truncate font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 sm:tracking-[0.2em]'>
              {label}
            </p>
            <p
              className={cn(
                'mt-1 font-display text-2xl font-bold tabular-nums',
                tone === 'amber' ? 'text-amber-600' : tone === 'cyan' ? 'text-cyan-600' : 'text-slate-900'
              )}
            >
              {loading ? '—' : value}
            </p>
          </div>
          <span
            className={cn(
              'hidden size-10 shrink-0 place-items-center hud-clip-sm sm:grid',
              tone === 'amber' ? 'bg-amber-50 text-amber-500' : tone === 'cyan' ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-100 text-slate-400'
            )}
          >
            <Icon className='size-5' aria-hidden />
          </span>
        </div>
      </div>
    </li>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  const { t } = useTranslation('common')
  return (
    <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center animate-in fade-in duration-500'>
      <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-amber-400 to-brand-purple text-white hud-clip-sm'>
        <Wrench className='size-6' aria-hidden />
      </span>
      <h2 className='font-display text-xl font-bold text-slate-900'>{t('maintenancePage.emptyTitle')}</h2>
      <p className='mt-1 max-w-sm text-sm text-slate-500'>{t('maintenancePage.emptyBody')}</p>
      <Can permission={PERM.maintenanceCreate}>
        <button type='button' onClick={onCreate} className={`${hudPrimaryButtonClass} mt-6`}>
          <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
          <Plus className='size-4' aria-hidden />
          {t('maintenancePage.addBtn')}
        </button>
      </Can>
    </div>
  )
}
