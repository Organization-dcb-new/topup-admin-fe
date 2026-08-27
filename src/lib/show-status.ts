/**
 * Aturan yang menentukan apa yang benar-benar dilihat pengunjung storefront.
 *
 * Dua hal di modul Show sering disalahpahami admin, dan keduanya tidak bisa
 * dibaca dari satu kolom pun di tabel:
 *
 *  1. `is_show=true` TIDAK cukup untuk membuat show tampil. Jalur publik
 *     (`GET /shows`) memakai INNER JOIN ke game yang `is_show=true`, jadi show
 *     tanpa satu pun game tampil tidak pernah ikut terkirim — sunyi, tanpa
 *     galat.
 *  2. Ketiga penanda hanya menghasilkan SATU badge di storefront, dengan
 *     prioritas popular > new > hot. Mencentang ketiganya tidak menampilkan
 *     tiga badge; dua sisanya hilang tanpa jejak.
 *
 * Keduanya dipusatkan di sini supaya pratinjau dan tabel tidak pernah berbeda
 * pendapat soal apa yang tayang.
 */

import type { Show } from '@/types/show'

export type ShowLiveStatus =
  /** Tayang dan punya minimal satu game yang tampil. */
  | 'live'
  /** `is_show=true`, tapi tidak ada game tampil — storefront melewatinya. */
  | 'noVisibleGames'
  /** `is_show=false`: sengaja disembunyikan. */
  | 'hidden'

export function getShowLiveStatus(show: Show): ShowLiveStatus {
  if (!show.is_show) return 'hidden'
  return show.visible_game_count > 0 ? 'live' : 'noVisibleGames'
}

export const isShowLive = (show: Show): boolean => getShowLiveStatus(show) === 'live'

/**
 * Penanda show, diurutkan sesuai prioritas storefront. Urutannya bukan selera:
 * ini menyalin `getShowBadgeVariant` di pakargaming-fe, dan harus ikut berubah
 * kalau prioritas di sana berubah.
 */
export const SHOW_BADGE_PRIORITY = ['is_popular', 'is_new', 'is_hot'] as const

export type ShowBadgeKey = (typeof SHOW_BADGE_PRIORITY)[number]

/**
 * Ketiga penanda saja, bukan `Show` utuh: form edit perlu memanggil ini atas
 * nilai yang sedang diketik, sebelum ada baris show yang tersimpan.
 */
export type ShowBadgeFlags = Pick<Show, ShowBadgeKey>

/** Penanda yang benar-benar dirender storefront, atau `null` bila tidak ada. */
export function getEffectiveShowBadge(flags: ShowBadgeFlags): ShowBadgeKey | null {
  return SHOW_BADGE_PRIORITY.find((key) => flags[key]) ?? null
}

/**
 * Penanda yang menyala tetapi kalah prioritas. Dipakai untuk memberi tahu admin
 * bahwa centangnya tersimpan namun tidak terlihat pengunjung.
 */
export function getOverriddenShowBadges(flags: ShowBadgeFlags): ShowBadgeKey[] {
  const winner = getEffectiveShowBadge(flags)
  if (!winner) return []
  return SHOW_BADGE_PRIORITY.filter((key) => key !== winner && flags[key])
}
