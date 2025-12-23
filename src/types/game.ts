import type { Category } from "./category"

export interface Game {
  id: string
  category_id: string
  provider_id: string
  name: string
  slug: string
  code: string
  thumbnail_url: string
  banner_url: string
  description: string
  instruction: string
  developer: string
  publisher: string
  is_featured: boolean
  is_active: boolean
  popularity_score: number
  created_at: string
  updated_at: string
  category: Category
  input: unknown | null
  product: unknown | null
}

export interface GamesResponse {
  status: string
  message: string
  data: Game[]
}
