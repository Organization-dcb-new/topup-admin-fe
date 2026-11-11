import type { GameStatus } from './game'

/** Game dalam respons GET /shows/admin (nested di tiap show). */
export type ShowGame = {
  id: string
  name: string
  slug: string
  code: string
  thumbnail_url: string
  banner_url: string
  popularity_score: number
  status: GameStatus
  is_active: boolean
  /** Negara yang dilayani game ini (id, my). */
  region?: string
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
  games?: ShowGame[]
  /**
   * Jumlah game yang dilihat pembeli tiap region di etalase ini: tiap game tampil diganti versi
   * region pembeli, game tanpa versi itu tidak tampil. Hanya di GET /shows/admin.
   */
  region_games?: Record<string, number>
}

export interface ShowResponse {
  data: Show[]
  message: string
}

/** POST /shows; the backend creates every show hidden with all flags off. */
export type CreateShowPayload = {
  name: string
  alias: string
  image: string
}

/** PUT /shows/:id replaces every field, so flags travel with the details. */
export type UpdateShowPayload = CreateShowPayload & {
  is_hot: boolean
  is_new: boolean
  is_popular: boolean
  is_show: boolean
}
