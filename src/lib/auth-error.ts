import { isAxiosError } from 'axios'

export interface AuthError {
  /** i18n key, rendered at display time so the message follows language switches. */
  key: string
  /** Untranslated server message, shown instead of `key` when present. */
  detail?: string
  /** Seconds until the server accepts another attempt. */
  retryAfter?: number
}

/** Used when a 429 carries no Retry-After header; matches the backend's 1-minute auth window. */
const DEFAULT_RETRY_AFTER = 60

/** Both credential errors share one message so the form doesn't reveal which accounts exist. */
const KNOWN_MESSAGES: Record<string, string> = {
  'Admin Not Found': 'authErrors.invalidCredentials',
  'Invalid Password': 'authErrors.invalidCredentials',
  'invalid or expired OTP code': 'authErrors.invalidOtp',
  // 2FA activation and deactivation phrase a wrong code differently.
  'invalid otp code': 'authErrors.invalidOtp',
  'kode OTP salah atau kadaluwarsa': 'authErrors.invalidOtp',
  'invalid recovery code': 'authErrors.invalidRecoveryCode',
}

export function toAuthError(err: unknown, fallbackKey: string): AuthError {
  if (!isAxiosError(err)) return { key: fallbackKey }
  if (!err.response) return { key: 'authErrors.network' }

  const { status, data, headers } = err.response
  if (status === 429) {
    const retryAfter = Number(headers['retry-after'])
    return {
      key: 'authErrors.tooManyAttempts',
      retryAfter: retryAfter > 0 ? Math.ceil(retryAfter) : DEFAULT_RETRY_AFTER,
    }
  }
  if (status === 503) return { key: 'authErrors.serverBusy' }

  const raw = data?.message ?? data?.error
  const message = typeof raw === 'string' ? raw : ''
  if (status === 403 && message.startsWith('Access denied from IP')) {
    return { key: 'authErrors.ipBlocked' }
  }
  if (KNOWN_MESSAGES[message]) return { key: KNOWN_MESSAGES[message] }
  if (status >= 500 && !message) return { key: 'authErrors.serverUnavailable' }
  return { key: fallbackKey, detail: message || undefined }
}
