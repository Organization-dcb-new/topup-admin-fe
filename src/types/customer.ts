/** How the account was first created. */
export type CustomerAuthProvider = 'manual' | 'google'

export type CustomerStatusFilter = 'active' | 'inactive'
/** Accounts that can sign in that way; an account can have both. */
export type CustomerMethodFilter = 'password' | 'google'

/** A storefront buyer account, as GET /customers lists it. */
export interface Customer {
  id: string
  name: string
  email: string
  avatar_url: string
  is_active: boolean
  has_password: boolean
  google_linked: boolean
  auth_provider: CustomerAuthProvider
  created_at: string
  last_login_at: string | null
}

/** Payments whose order carries the account's email. */
export interface CustomerPurchaseSummary {
  transaction_count: number
  paid_count: number
  /** Rupiah. */
  paid_total: number
  last_transaction_at: string | null
}

export interface CustomerDetail extends Customer {
  /** "" when the account has none. */
  phone: string
  email_verified: boolean
  summary: CustomerPurchaseSummary
}

export interface CustomerListParams {
  page: number
  limit: number
  search?: string
  status?: CustomerStatusFilter
  method?: CustomerMethodFilter
}

export interface CustomerListMeta {
  page: number
  limit: number
  total_data: number
  total_page: number
}

export interface CustomerListResponse {
  status: string
  message: string
  data: Customer[]
  meta: CustomerListMeta
}

export interface CustomerDetailResponse {
  status: string
  message: string
  data: CustomerDetail
}

/** PATCH /customers/:id — send only the fields that changed. */
export interface UpdateCustomerPayload {
  name?: string
  email?: string
}
