/** Colour/tone: info (neutral), warning (problem/outage), promo (offer). */
export type AnnouncementLevel = 'info' | 'warning' | 'promo'

/** How the storefront shows it: a thin bar above the page, or a popup. */
export type AnnouncementDisplay = 'bar' | 'popup'

export type Announcement = {
  id: string
  title: string
  /** Plain text, may contain newlines. Never HTML. */
  body: string
  level: AnnouncementLevel
  display: AnnouncementDisplay
  /** `""`, a storefront path such as `/games/mlbb`, or an http(s) URL. */
  link_url: string
  /** Empty while `link_url` is set: the storefront shows its own default label. */
  link_label: string
  /** `""` or an http(s) URL from the upload endpoint. Only used when `display` is `popup`. */
  image_url: string
  /** Off = never shown, whatever the schedule. */
  is_active: boolean
  /** RFC3339, e.g. `2026-11-17T09:00:00+07:00`; null = shown from now. */
  starts_at: string | null
  /** RFC3339; null = no end. */
  ends_at: string | null
  /** Admin email. */
  created_by: string
  updated_by: string
  /** RFC3339 */
  created_at: string
  /** RFC3339 */
  updated_at: string
}

export type AnnouncementListResponse = {
  data: Announcement[]
  message?: string
}

/** Body of create AND update. An update replaces the whole announcement; null clears a time. */
export type AnnouncementInput = {
  title: string
  body: string
  level: AnnouncementLevel
  display: AnnouncementDisplay
  link_url: string
  link_label: string
  image_url: string
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
}
