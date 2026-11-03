import type { UseFormRegister, UseFormSetValue } from 'react-hook-form'
import type { Category, CategoryResponse } from './category'
import type { ProviderResponse } from './provider'
import type { Product } from './product'

export type GameUpdatedBy = {
  id: string
  name: string
}

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
  is_show: boolean
  is_active: boolean
  /** When true, customer ID is validated (e.g. against provider). */
  is_check_id?: boolean
  additional_fee?: number
  additional_percent?: number
  popularity_score: number
  created_at: string
  updated_at: string
  updated_by?: GameUpdatedBy | null
  category: Category
  input: GameInput[] | GameInput | null
  product: Product[] | null
}

export type GameInput = {
  id: string
  game_id: string
  key: string
  label: string
  input_type: 'text' | 'number' | 'email' | 'password' | 'select' | 'tel'
  required: boolean
  sort_order: number
  placeholder: string
  Options?: unknown
}

export interface GameByIDResponse {
  status: string
  message: string
  data: Game
}

export interface GamesResponse {
  status: string
  message: string
  meta: PaginationMeta
  data: Game[]
}

export interface PaginationMeta {
  page: number
  limit: number
  total_data: number
  total_page: number
  has_next: boolean
  has_prev: boolean
  game_active: number
  game_show: number
}

export type GameInputPayload = {
  key: string
  label: string
  input_type: 'text' | 'number'
  required: boolean
  placeholder?: string
}

export type CreateGamePayload = {
  category_id: string
  provider_id: string
  name: string
  slug: string
  code: string
  description?: string
  instruction?: string
  thumbnail_url: string
  banner_url: string
  developer?: string
  publisher?: string
  inputs: GameInputPayload[]
}

export type UploadFileHandler = (
  file: File,
  setUrl: (url: string) => void,
  setUploading: (b: boolean) => void,
  setProgress?: (p: number) => void
) => Promise<void>

export interface GameInputProps {
  setValue: UseFormSetValue<CreateGamePayload>
  register: UseFormRegister<CreateGamePayload>
  categories: CategoryResponse
  providers: ProviderResponse
}

export type UpdateInputFn = <K extends keyof GameInputPayload>(
  index: number,
  field: K,
  value: GameInputPayload[K]
) => void

export interface GameInputFormProps {
  addInput: () => void
  updateInput: UpdateInputFn
  removeInput: (index: number) => void
  inputs: GameInputPayload[]
}

/** One checkout field sent with POST /games (the backend stores every field as required). */
export type GameCreateInputRequest = {
  key: string
  label: string
  input_type: string
  sort_order: number
  placeholder: string
  required: boolean
}

/** POST /games; `category_id` and `provider_id` must be valid ids or the backend rejects it. */
export type GameCreateRequest = {
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
  inputs: GameCreateInputRequest[]
}

/**
 * PUT /games/:id. The backend only writes fields that are non-empty (or non-zero), so a field
 * can't be cleared, and sending `name` also regenerates the slug from it.
 */
export type GameUpdateRequest = Partial<{
  category_id: string
  name: string
  code: string
  description: string
  instruction: string
  developer: string
  publisher: string
  popularity_score: number
  is_featured: boolean
  is_show: boolean
  is_active: boolean
}>

/** PATCH /games/image writes both images as sent, so the current one must be resent to keep it. */
export type GameImageRequest = {
  game_id: string
  thumbnail_url: string
  banner_url: string
}
