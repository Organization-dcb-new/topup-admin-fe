import type { PaginationMeta } from './game'

export interface PaymentMethod {
  id: string
  name: string
  /** Channel code sent to the gateway, e.g. `qris` or `bca_va`. */
  code: string
  type: string
  /** Always `paylabs` once saved; older rows may still hold another value until they are saved. */
  provider: string
  /** False for a method Paylabs does not offer (e.g. the old `smartfren_airtime`); it cannot be switched on. */
  supported: boolean
  icon_url: string
  fee_percentage: number
  fee_fixed: number
  min_amount: number
  max_amount: number
  category_id: string
  full_name: string
  sort_order: number
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

/** Every payment goes through Paylabs; the backend stores this whatever the form sends. */
export const PAYMENT_PROVIDER = 'paylabs'

export type PaymentMethodType = 'QRIS' | 'EWALLET' | 'VA' | 'RETAIL'
export const PAYMENT_METHOD_TYPES: PaymentMethodType[] = ['QRIS', 'EWALLET', 'VA', 'RETAIL']

/** GET /payment-methods/catalog: every method Paylabs offers us. `name` is also its code. */
export interface PaymentMethodCatalogEntry {
  name: string
  /** Default display name. */
  full_name: string
  type: PaymentMethodType
  /** Paylabs per-transaction limits. */
  min_amount: number
  max_amount: number
}

/**
 * POST /payment-methods; `config` is a JSON string and can only be set here.
 * The backend takes `code` and `type` from the catalog entry named by `name`.
 */
export type PaymentMethodCreatePayload = {
  name: string
  code: string
  type: string
  full_name: string
  provider: string
  icon_url: string
  fee_percentage: number
  fee_fixed: number
  min_amount: number
  max_amount: number
  sort_order: number
  config: string
}

/** PUT /payment-methods/:id overwrites every field listed here except name, code and type, which are fixed. */
export type PaymentMethodUpdatePayload = Omit<PaymentMethodCreatePayload, 'config'> & {
  is_active: boolean
}
