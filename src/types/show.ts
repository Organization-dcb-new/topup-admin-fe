/**
 * Bentuk data modul Show (kurasi etalase game).
 *
 * Ini satu-satunya sumber kebenaran untuk payload Show: hook maupun komponen
 * mengimpor dari sini. Sebelumnya `ShowPayload` tinggal di CreateShowModal dan
 * `UpdateShowPayload` diduplikasi di useShow.ts — arah dependensi terbalik dan
 * satu flag baru berarti menyunting tiga tempat.
 */

/** Game dalam respons show (nested di tiap show). */
export type ShowGame = {
  id: string
  name: string
  slug: string
  code: string
  thumbnail_url: string
  banner_url: string
  popularity_score: number
  is_active: boolean
  is_featured: boolean
  /**
   * Game yang disembunyikan tetap terdaftar sebagai anggota show, tetapi tidak
   * ikut tampil di storefront. Admin perlu melihat bedanya.
   */
  is_show: boolean
}

export type Show = {
  id: string
  name: string
  alias: string
  image: string
  is_hot: boolean
  is_new: boolean
  is_popular: boolean
  is_show: boolean
  /** Urutan tampil di storefront; makin kecil makin awal. */
  sort_order: number
  /** Jumlah game beranggota dengan `is_show=true`; dihitung backend. */
  visible_game_count: number
  games?: ShowGame[]
}

/** Meta paginasi GET /shows/admin. */
export type ShowPaginationMeta = {
  page: number
  limit: number
  total: number
  total_pages: number
}

/** GET /shows/admin — daftar berpaginasi. */
export interface ShowListResponse {
  status: string
  message: string
  data: Show[]
  meta: ShowPaginationMeta
}

/** GET /shows/admin/:id, POST /shows, PUT /shows/:id, dan mutasi keanggotaan game. */
export interface ShowDetailResponse {
  status: string
  message: string
  data: Show
}

/** Respons tanpa muatan (DELETE /shows/:id, PUT /shows/reorder). */
export interface ShowMessageResponse {
  status: string
  message: string
}

/** Parameter kueri daftar admin. `page` mulai dari 1, `limit` maksimum 100. */
export type GetShowsParams = {
  page?: number
  limit?: number
  search?: string
}

/**
 * POST /shows. Backend menerima pula is_hot/is_new/is_popular/sort_order di sini,
 * tetapi form pembuatan sengaja hanya mengirim yang dibutuhkan untuk menayangkan
 * show — penanda dan urutan diatur setelahnya lewat form edit dan tombol urutan.
 */
export type CreateShowPayload = {
  name: string
  alias: string
  /** Boleh string kosong: storefront tidak merender gambar show. */
  image: string
  is_show: boolean
}

/** PUT /shows/:id — update parsial, hanya field yang dikirim yang ditulis. */
export type UpdateShowPayload = {
  name?: string
  alias?: string
  image?: string
  is_hot?: boolean
  is_new?: boolean
  is_popular?: boolean
  is_show?: boolean
  sort_order?: number
}

/** Satu baris body PUT /shows/reorder. */
export type ShowReorderItem = {
  id: string
  sort_order: number
}
