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
}
