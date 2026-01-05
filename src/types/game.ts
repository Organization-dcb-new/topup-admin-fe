import type { UseFormRegister, UseFormSetValue } from 'react-hook-form'
import type { Category, CategoryResponse } from './category'
import type { ProviderResponse } from './provider'

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
  input: GameInput | null
  product: unknown | null
}

export type GameInput = {
  id: string
  game_id: string
  key: string
  label: string
  input_type: 'text' | 'number' | 'email' | 'password' | 'select'
  required: boolean
  sort_order: number
  placeholder: string
}

export interface GameByIDResponse {
  status: string
  message: string
  data: Game[]
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
}

export type GameInputPayload = {
  key: string
  label: string
  input_type: 'text' | 'number'
  required: boolean
  sort_order: number
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
  thumbnailFile: File | null
  bannerFile: File | null
  uploadFileHandler: UploadFileHandler
  setBannerFile: (file: File) => void
  setThumbnailUrl: (url: string) => void
  setUploadingThumb: (upload: boolean) => void
  uploadingThumb: boolean
  uploadingBanner: boolean
  setBannerUrl: (url: string) => void
  setUploadingBanner: (banner: boolean) => void
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
