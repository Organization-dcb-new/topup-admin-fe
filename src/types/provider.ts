export type ProviderStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR'

/** One server env variable that holds a supplier credential. Its value never leaves the server. */
export type ProviderCredential = {
  env: string
  set: boolean
}

export type Provider = {
  id: string
  name: string
  code: string
  /** Base URL of the supplier's API. */
  api_url: string
  /** Credentials live in the server env; this only names the variables and whether they are set. */
  credentials?: ProviderCredential[]
  status: ProviderStatus
  /** The backend can ask this supplier for our deposit balance (GET /providers/:id/balance). */
  balance_supported?: boolean
  /** Lower runs first. */
  priority: number
  config?: Record<string, unknown> | null
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

/** POST /providers; `config` is a JSON string. */
export type ProviderCreatePayload = {
  name: string
  code: string
  api_url: string
  priority: number
  config: string
}

/** PUT /providers/:id; an empty `config` keeps the stored one. */
export type ProviderUpdatePayload = {
  name: string
  api_url: string
  status: ProviderStatus
  priority: number
  config: string
}

export interface ProviderResponse {
  data: Provider[]
  message: string
  status: string
}

/** GET /providers/:id/balance: our deposit at the supplier, asked live. */
export type ProviderBalance = {
  provider_id: string
  balance: number
  /** RFC3339 in WIB. */
  checked_at: string
}
