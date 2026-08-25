import i18n from '@/i18n'

interface ApiErrorShape {
  code?: string
  response?: {
    status?: number
    data?: { message?: string }
  }
}

// Satu pintu untuk menerjemahkan error axios jadi pesan yang layak tampil:
// rate limit dan masalah jaringan tidak boleh bocor sebagai pesan mentah.
export function apiErrorMessage(err: unknown, fallback?: string): string {
  const e = err as ApiErrorShape

  if (e?.response?.status === 429) return i18n.t('apiErrors.tooManyRequests')

  const serverMessage = e?.response?.data?.message
  if (serverMessage) return serverMessage

  if (e?.code === 'ECONNABORTED') return i18n.t('apiErrors.timeout')
  if (!e?.response) return i18n.t('apiErrors.network')

  return fallback || i18n.t('apiErrors.generic')
}
