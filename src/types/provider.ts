export type ProviderStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR'

export type Provider = {
  id: string
  name: string
  code: string
  api_url: string
  /** Despite the name, the backend stores and returns the key as-is; treat it as a secret. */
  api_key_encrypted: string
  status: ProviderStatus
  balance: number
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
  api_key_encrypted: string
  priority: number
  config: string
}

/**
 * PUT /providers/:id. The backend overwrites the key with whatever is sent, so the current key
 * must be sent back when it isn't being changed.
 */
export type ProviderUpdatePayload = {
  name: string
  api_url: string
  api_key_encrypted: string
  status: ProviderStatus
  priority: number
  config: string
}

export interface ProviderResponse {
  data: Provider[]
  message: string
  status: string
}

export interface LapakGamingBalanceResponse {
  status: string
  message: string
  data: {
    balance: number
  }
}

export interface PpobBalanceResponse {
  status: string
  message: string
  data: {
    balance: number
    username: string
  }
}
