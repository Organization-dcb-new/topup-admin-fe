import { AppWindow, BadgePercent, Info, PanelTop, TriangleAlert, type LucideIcon } from 'lucide-react'

import type { Announcement, AnnouncementDisplay, AnnouncementInput, AnnouncementLevel } from '@/types/announcement'

/**
 * - off: switched off, whatever the schedule says
 * - scheduled: active, starts later
 * - ended: active, its end has passed
 * - live: active and showing on the storefront now
 */
export type AnnouncementStatus = 'live' | 'scheduled' | 'ended' | 'off'

function toMs(iso: string | null) {
  return iso ? Date.parse(iso) : Number.NaN
}

export function getAnnouncementStatus(
  a: Pick<Announcement, 'is_active' | 'starts_at' | 'ends_at'>,
  now: number
): AnnouncementStatus {
  if (!a.is_active) return 'off'
  const start = toMs(a.starts_at)
  const end = toMs(a.ends_at)
  if (!Number.isNaN(start) && start > now) return 'scheduled'
  if (!Number.isNaN(end) && end < now) return 'ended'
  return 'live'
}

/** The full body for PUT: an update replaces every field, so start from what is saved. */
export function toAnnouncementInput(a: Announcement): AnnouncementInput {
  return {
    title: a.title,
    body: a.body,
    level: a.level,
    display: a.display,
    link_url: a.link_url,
    link_label: a.link_label,
    image_url: a.image_url,
    is_active: a.is_active,
    starts_at: a.starts_at,
    ends_at: a.ends_at,
  }
}

export const STATUS_STYLES: Record<AnnouncementStatus, { chip: string; dot: string }> = {
  live: { chip: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500 animate-hud-signal' },
  scheduled: { chip: 'bg-cyan-50 text-cyan-700', dot: 'bg-brand-cyan' },
  ended: { chip: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
  off: { chip: 'bg-slate-100 text-slate-500', dot: 'bg-slate-300' },
}

export const LEVEL_META: Record<
  AnnouncementLevel,
  {
    icon: LucideIcon
    chip: string
    /** The option while picked in the form. */
    selected: string
    /** Preview of the storefront bar. */
    bar: string
    /** Preview accent of the popup (icon tile and button). */
    accent: string
  }
> = {
  info: {
    icon: Info,
    chip: 'bg-sky-50 text-sky-700',
    selected: 'bg-sky-50 text-sky-700 ring-sky-300',
    bar: 'bg-sky-600 text-white',
    accent: 'bg-sky-600 text-white',
  },
  warning: {
    icon: TriangleAlert,
    chip: 'bg-amber-50 text-amber-700',
    selected: 'bg-amber-50 text-amber-700 ring-amber-300',
    bar: 'bg-amber-400 text-amber-950',
    accent: 'bg-amber-500 text-white',
  },
  promo: {
    icon: BadgePercent,
    chip: 'bg-brand-purple/10 text-brand-purple',
    selected: 'bg-brand-purple/10 text-brand-purple ring-brand-purple/40',
    bar: 'bg-linear-to-r from-brand-purple to-brand-cyan text-white',
    accent: 'bg-brand-purple text-white',
  },
}

export const DISPLAY_META: Record<AnnouncementDisplay, { icon: LucideIcon }> = {
  bar: { icon: PanelTop },
  popup: { icon: AppWindow },
}
