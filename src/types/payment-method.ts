import type { PaginationMeta } from './game'

export interface PaymentMethod {
  id: string
  name: string
  code: string
  type: string
  provider: string
  icon_url: string
  fee_percentage: number
  fee_fixed: number
  min_amount: number
  max_amount: number
  /** Kategori pemilik; hanya bisa diubah lewat endpoint penugasan kategori */
  category_id: string
  full_name: string
  sort_order: number
  /** Backend menyerialkan sebagai JSON terurai, bukan string */
  config: unknown
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PaymentMethodResponse {
  data: PaymentMethod[]
  message: string
  status: string
  meta: PaginationMeta
}

/**
 * Satu bentuk untuk create maupun update. Sebelumnya ada empat tipe yang
 * hampir identik (`PaymentMethodPayload`, `FormValuesPaymentMethodCreate`,
 * `FormValuesPaymentMethod`, `FormValuesPaymentMethodEdit`) yang perlahan
 * saling menyimpang.
 */
export interface PaymentMethodFormValues {
  name: string
  code: string
  type: string
  provider: string
  icon_url: string
  fee_percentage: number
  fee_fixed: number
  min_amount: number
  max_amount: number
  sort_order: number
  is_active: boolean
}
