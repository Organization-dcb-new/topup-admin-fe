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
  /** False for a provider left over from a supplier the backend no longer integrates. It can be switched off, not on. */
  supported?: boolean
  /** The backend can ask this supplier for our deposit balance (GET /providers/:id/balance). */
  balance_supported?: boolean
  /** The supplier sells per country (LapakGaming); its countries are set on GET/PUT /providers/:id/regions. */
  regions_supported?: boolean
  /** The countries its catalog sync pulls (config "regions"), ['id'] when the config lists none. */
  regions?: string[]
  /** Lower runs first. */
  priority: number
  config?: Record<string, unknown> | null
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

/**
 * PUT /providers/:id, the only write: providers are created by the backend and never deleted.
 * Name and code are fixed by the backend's supplier list. An empty `config` keeps the stored one.
 */
export type ProviderUpdatePayload = {
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

/** One of the supplier's countries on the region settings (GET /providers/:id/regions). */
export type ProviderRegion = {
  code: string
  /** English; shown through regionName in the admin's language. */
  name: string
  currency: string
  /** The catalog sync pulls this country. */
  synced: boolean
  /** Categories stored for the country, the ones tied to a game, and the listed games tied to them. */
  brands: number
  mapped_brands: number
  listed_games: number
}

/** Every country the supplier sells for, the synced ones first. */
export type ProviderRegions = {
  provider_id: string
  regions: ProviderRegion[]
}
