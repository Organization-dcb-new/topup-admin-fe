import type { TFunction } from 'i18next'

import type { Maintenance } from '@/types/maintenance'

/**
 * - live: mode on and now is inside the window
 * - scheduled: mode on, window not started yet
 * - ended: mode on, window already over
 * - off: mode switched off, whatever the window says
 */
export type MaintenanceStatus = 'live' | 'scheduled' | 'ended' | 'off'

const STATUS_RANK: Record<MaintenanceStatus, number> = { live: 0, scheduled: 1, off: 2, ended: 3 }

function toMs(iso: string | null) {
  return iso ? Date.parse(iso) : Number.NaN
}

export function getMaintenanceStatus(m: Maintenance, now: number): MaintenanceStatus {
  if (!m.is_maintenance) return 'off'
  const start = toMs(m.start_time)
  const end = toMs(m.end_time)
  if (!Number.isNaN(end) && end < now) return 'ended'
  if (!Number.isNaN(start) && start > now) return 'scheduled'
  return 'live'
}

/** Share of the window already elapsed, 0–1; null when the window is incomplete. */
export function getWindowProgress(m: Maintenance, now: number): number | null {
  const start = toMs(m.start_time)
  const end = toMs(m.end_time)
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null
  return Math.min(1, Math.max(0, (now - start) / (end - start)))
}

export function getWindowMinutes(m: Maintenance): number | null {
  const start = toMs(m.start_time)
  const end = toMs(m.end_time)
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null
  return Math.round((end - start) / 60_000)
}

/** Live first, then upcoming by start, then the rest by most recent start. */
export function sortMaintenances(list: Maintenance[], now: number) {
  return [...list].sort((a, b) => {
    const sa = getMaintenanceStatus(a, now)
    const sb = getMaintenanceStatus(b, now)
    if (sa !== sb) return STATUS_RANK[sa] - STATUS_RANK[sb]
    const ta = toMs(a.start_time) || 0
    const tb = toMs(b.start_time) || 0
    return sa === 'scheduled' ? ta - tb : tb - ta
  })
}

/** Accent strip on top of each card, by status. */
export const STATUS_BAR: Record<MaintenanceStatus, string> = {
  live: 'bg-linear-to-r from-amber-400 to-rose-500',
  scheduled: 'bg-linear-to-r from-brand-purple to-brand-cyan',
  ended: 'bg-slate-200',
  off: 'bg-slate-200',
}

export function formatDuration(minutes: number, t: TFunction) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const parts = []
  if (h) parts.push(t('maintenancePage.durationHours', { count: h }))
  if (m || !h) parts.push(t('maintenancePage.durationMinutes', { count: m }))
  return parts.join(' ')
}

/** "in 2 hours" / "3 minutes ago", picking the unit from the distance. */
export function formatRelative(targetMs: number, nowMs: number, locale?: string) {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const minutes = Math.round((targetMs - nowMs) / 60_000)
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 48) return rtf.format(hours, 'hour')
  return rtf.format(Math.round(hours / 24), 'day')
}
