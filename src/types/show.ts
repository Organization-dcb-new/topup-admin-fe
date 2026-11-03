/** Game dalam respons GET /shows/admin (nested di tiap show). */
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
