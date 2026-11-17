import { z } from 'zod'

import { datetimeLocalToIso } from '@/helpers/maintenance-datetime'
import type { AnnouncementDisplay, AnnouncementLevel } from '@/types/announcement'

// Limits of the backend contract (topup-be announcements); it answers 400 past them.
export const ANNOUNCEMENT_TITLE_MAX = 100
export const ANNOUNCEMENT_BODY_MAX = 500
export const ANNOUNCEMENT_LINK_LABEL_MAX = 40

export const ANNOUNCEMENT_LEVELS = ['info', 'warning', 'promo'] as const satisfies readonly AnnouncementLevel[]
export const ANNOUNCEMENT_DISPLAYS = ['bar', 'popup'] as const satisfies readonly AnnouncementDisplay[]

/** Characters as the backend counts them: Unicode code points, so an emoji is one, not two. */
export function charCount(value: string) {
  return Array.from(value).length
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname !== ''
  } catch {
    return false
  }
}

/** Empty, a storefront path like `/games/mlbb` (not `//host` or `/\host`), or an http(s) URL. */
export function isValidAnnouncementLink(value: string) {
  if (!value) return true
  if (value.startsWith('/')) return !value.startsWith('//') && !value.startsWith('/\\')
  return isHttpUrl(value)
}

/** A `datetime-local` value read as WIB wall time, in ms; NaN when empty. */
function wibMs(local: string) {
  const iso = datetimeLocalToIso(local)
  return iso ? Date.parse(iso) : Number.NaN
}

export const announcementSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'announcementPage.form.errors.titleRequired')
      .refine((v) => charCount(v) <= ANNOUNCEMENT_TITLE_MAX, 'announcementPage.form.errors.titleMax'),
    body: z
      .string()
      .trim()
      .refine((v) => charCount(v) <= ANNOUNCEMENT_BODY_MAX, 'announcementPage.form.errors.bodyMax'),
    level: z.enum(ANNOUNCEMENT_LEVELS),
    display: z.enum(ANNOUNCEMENT_DISPLAYS),
    link_url: z.string().trim().refine(isValidAnnouncementLink, 'announcementPage.form.errors.linkInvalid'),
    link_label: z
      .string()
      .trim()
      .refine((v) => charCount(v) <= ANNOUNCEMENT_LINK_LABEL_MAX, 'announcementPage.form.errors.linkLabelMax'),
    /** Only checked for a popup: a bar sends no image (see the form), so a hidden one can't block saving. */
    image_url: z.string().trim(),
    is_active: z.boolean(),
    /** `datetime-local` in WIB; empty = shown from now. */
    starts_at: z.string(),
    /** `datetime-local` in WIB; empty = no end. */
    ends_at: z.string(),
  })
  .refine(
    (v) => {
      const start = wibMs(v.starts_at)
      const end = wibMs(v.ends_at)
      return Number.isNaN(start) || Number.isNaN(end) || end > start
    },
    { path: ['ends_at'], message: 'announcementPage.form.errors.orderInvalid' }
  )
  .refine((v) => v.display !== 'popup' || !v.image_url || isHttpUrl(v.image_url), {
    path: ['image_url'],
    message: 'announcementPage.form.errors.imageInvalid',
  })

export type AnnouncementFormValues = z.infer<typeof announcementSchema>
