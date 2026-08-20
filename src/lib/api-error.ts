import type { AxiosError } from 'axios'
import type { TFunction } from 'i18next'

interface ApiErrorBody {
  message?: string
  /** Middleware rate limit membalas dengan key `error`, bukan `message`. */
  error?: string
}

/**
 * Menerjemahkan kegagalan request jadi satu kalimat yang layak dibaca user.
 * Kondisi yang tidak punya pesan server yang berguna (jaringan mati, timeout,
 * rate limit, 5xx) dijawab dengan teks terjemahan, bukan dibiarkan jatuh ke
 * pesan generik yang menyesatkan seperti "kode salah".
 */
export function resolveApiError(
  err: unknown,
  t: TFunction,
  fallbackKey: string
): string {
  const e = err as AxiosError<ApiErrorBody>

  if (e?.code === 'ECONNABORTED') return t('authShared.timeoutError')
  if (!e?.response) return t('authShared.networkError')

  const status = e.response.status
  if (status === 429) return t('authShared.rateLimited')
  if (status >= 500) return t('authShared.serverError')

  const body = e.response.data
  return body?.message || body?.error || t(fallbackKey)
}
