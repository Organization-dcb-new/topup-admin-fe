export type Provider = {
  id: string
  name: string
  code: string
  api_url: string
  api_key_encrypted: string
  status: 'ACTIVE' | 'INACTIVE'
  balance: number
  priority: number
  config?: {
    timeout?: number
  }
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

export type ProviderPayload = {
  name: string
  code: string
  api_url: string
  api_key_encrypted?: string
  priority?: number
  config: string
}

export type ProviderFormValues = {
  name: string
  code: string
  api_url: string
  api_key_encrypted?: string
  priority?: number
  config: string
}

export interface ProviderResponse {
  data: Provider[]
  message: string
  status: string
}
