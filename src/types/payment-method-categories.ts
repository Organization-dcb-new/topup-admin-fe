export interface PaymentMethodCategoriesResponse {
  data: PaymentMethodCategory[]
  message: string
  status: string
}

export interface PaymentMethodCategory {
  id: string
  name: string
  slug: string
  icon_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}
