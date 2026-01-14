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

export interface CategoryNames {
  id: string
  name: string
}

export interface CategoryResponse {
  data: Category[]
  message: string
  status: string
  meta: PaginationMeta
}

export interface CategoriesNameResponse {
  data: CategoryNames[]
  message: string
  status: string
}

export type FormValuesCategory = {
  name: string
  description: string
  icon_url?: string
}

export type CategoryPayload = {
  name: string
  icon_url: string
  description: string
}

export type PropsEditModal = {
  category: Category
}
