import { z } from 'zod'

function parseJsonObject(value: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(value)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// Mirrors the backend (topup-be internal/services/provider_service.go), which refuses the same keys.
// Supplier credentials belong in the server env, never in the providers table.
const CREDENTIAL_WORDS = new Set(['key', 'apikey', 'secret', 'token', 'password', 'passwd', 'pass', 'pin', 'credential', 'credentials', 'private'])
const CREDENTIAL_FRAGMENTS = ['secret', 'password', 'passwd', 'apikey', 'privatekey', 'credential']

export function looksLikeCredential(key: string) {
  const lower = key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
  if (lower.split(/[^a-z0-9]+/).some((word) => CREDENTIAL_WORDS.has(word))) return true
  const joined = lower.replace(/[^a-z0-9]+/g, '')
  return CREDENTIAL_FRAGMENTS.some((fragment) => joined.includes(fragment))
}

function hasCredentialKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasCredentialKey)
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).some(([key, child]) => looksLikeCredential(key) || hasCredentialKey(child))
  }
  return false
}

function urlHasCredentials(value: string) {
  try {
    const url = new URL(value)
    return url.username !== '' || url.password !== '' || [...url.searchParams.keys()].some(looksLikeCredential)
  } catch {
    return false
  }
}

/** The edit form; providers are never created from the admin panel. */
export function providerSchema() {
  return z.object({
    api_url: z
      .string()
      .trim()
      .refine(isHttpUrl, 'providerPage.form.errors.urlInvalid')
      .refine((v) => !urlHasCredentials(v), 'providerPage.form.errors.urlSecret'),
    priority: z.coerce
      .number({ error: 'providerPage.form.errors.priorityInvalid' })
      .int('providerPage.form.errors.priorityInvalid')
      .min(0, 'providerPage.form.errors.priorityInvalid'),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ERROR']),
    config: z
      .string()
      .trim()
      .refine((v) => parseJsonObject(v) !== null, 'providerPage.form.errors.configInvalid')
      .refine((v) => !hasCredentialKey(parseJsonObject(v)), 'providerPage.form.errors.configSecret'),
  })
}

export type ProviderFormInput = z.input<ReturnType<typeof providerSchema>>
export type ProviderFormValues = z.output<ReturnType<typeof providerSchema>>
