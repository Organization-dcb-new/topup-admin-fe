import type { PaginationMeta } from './game'

export interface Category {
  id: string
  name: string
  slug: string
  icon_url: string
  description: string
  created_at: string
  updated_at: string
}

export interface CategoryResponse {
  data: Category[]
  message: string
  status: string
  meta: PaginationMeta
}

export type FormValuesCategory = {
  name: string
  description: string
  icon_url: string
}

export type CategoryPayload = {
  name: string
  icon_url: string
  description: string
}

export type PropsEditModal = {
  open: boolean
  onClose: () => void
  category: Category
}
