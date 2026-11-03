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
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

/** POST /payment-categories; new categories start active. */
export type PaymentCategoryCreatePayload = {
  name: string
  slug: string
  icon_url: string
  sort_order: number
}

/** PUT /payment-categories/:id overwrites every field. */
export type PaymentCategoryUpdatePayload = PaymentCategoryCreatePayload & {
  is_active: boolean
}
