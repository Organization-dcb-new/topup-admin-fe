import type { UseFormRegister, UseFormSetValue } from 'react-hook-form'
import type { ProviderResponse } from './provider'
import type { Product } from './product'

export type GameUpdatedBy = {
  id: string
  name: string
}

/**
 * Where a game stands on the storefront. ACTIVE is listed and sold, MAINTENANCE is listed but not
 * sold, HIDDEN is off the storefront (new, archived, or not ready).
 */
export type GameStatus = 'ACTIVE' | 'MAINTENANCE' | 'HIDDEN'

export const GAME_STATUSES: readonly GameStatus[] = ['ACTIVE', 'MAINTENANCE', 'HIDDEN']

export interface Game {
  id: string
  /** Deprecated: which suppliers sell the game is in the supplier catalog. Empty when none. */
  provider_id: string
  name: string
  slug: string
  code: string
  thumbnail_url: string
  banner_url: string
  description: string
  status: GameStatus
  /** Read from status: is_show is ACTIVE or MAINTENANCE, is_active is ACTIVE. */
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
  input: GameInput[] | GameInput | null
  product: Product[] | null
}

/** What a buyer's answer must look like; checked at checkout. Empty fields check nothing. */
export type GameInputValidation = {
  min_length?: number
  max_length?: number
  /** A regular expression the whole answer must match. */
  pattern?: string
}

export type GameInput = {
  id: string
  game_id: string
  key: string
  label: string
  input_type: 'text' | 'number' | 'email' | 'password' | 'select' | 'tel' | 'dropdown'
  required: boolean
  sort_order: number
  placeholder: string
  Options?: unknown
  validation?: GameInputValidation | null
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
  /** Games that can be bought (ACTIVE). */
  game_active: number
  /** Games the storefront lists (ACTIVE and MAINTENANCE). */
  game_show: number
  status_counts?: Record<GameStatus, number>
}

export type GameInputPayload = {
  key: string
  label: string
  input_type: 'text' | 'number'
  required: boolean
  placeholder?: string
}

export type CreateGamePayload = {
  provider_id?: string
  name: string
  slug: string
  code?: string
  description?: string
  thumbnail_url: string
  banner_url: string
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

/** One checkout field sent with POST /games. */
export type GameCreateInputRequest = {
  key: string
  label: string
  input_type: string
  sort_order: number
  placeholder: string
  required: boolean
}

/**
 * POST /games. `provider_id` is optional (suppliers are tied in
 * the supplier catalog), `code` is made from the slug when empty, and the game starts HIDDEN
 * unless `status` says otherwise.
 */
export type GameCreateRequest = {
  provider_id?: string
  name: string
  slug: string
  code?: string
  thumbnail_url: string
  banner_url: string
  description: string
  status?: GameStatus
  inputs: GameCreateInputRequest[]
}

/**
 * PUT /games/:id. The backend writes only what is sent and non-empty, so a text field can't be
 * cleared. The slug (the storefront URL) changes only when `slug` is sent, never with the name.
 */
export type GameUpdateRequest = Partial<{
  name: string
  slug: string
  code: string
  description: string
  popularity_score: number
  status: GameStatus
}>

/** PATCH /games/image writes both images as sent, so the current one must be resent to keep it. */
export type GameImageRequest = {
  game_id: string
  thumbnail_url: string
  banner_url: string
}
