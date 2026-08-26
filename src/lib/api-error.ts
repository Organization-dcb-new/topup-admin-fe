import i18n from '@/i18n'

interface ApiErrorShape {
  code?: string
  response?: {
    status?: number
    data?: { message?: string }
  }
}

/**
 * Pesan yang dikirim backend apa adanya untuk semua bahasa. Diterjemahkan di
 * sini supaya tidak tampil mentah di toast — `MFA_REQUIRED` khususnya tidak
 * berarti apa pun bagi operator, dan sisanya terkunci pada satu bahasa.
 */
const SENTINEL_KEYS: Record<string, string> = {
  MFA_REQUIRED: 'apiErrors.mfaRequired',
  'access denied: insufficient permissions': 'apiErrors.forbidden',
  'tidak bisa mengubah role akun sendiri': 'apiErrors.selfRoleChange',
  'You cannot delete your own account': 'apiErrors.selfDelete',
}

// Satu pintu untuk menerjemahkan error axios jadi pesan yang layak tampil:
// rate limit dan masalah jaringan tidak boleh bocor sebagai pesan mentah.
export function apiErrorMessage(err: unknown, fallback?: string): string {
  const e = err as ApiErrorShape

  if (e?.response?.status === 429) return i18n.t('apiErrors.tooManyRequests')

  const serverMessage = e?.response?.data?.message
  if (serverMessage) {
    const sentinel = SENTINEL_KEYS[serverMessage]
    return sentinel ? i18n.t(sentinel) : serverMessage
  }

  if (e?.code === 'ECONNABORTED') return i18n.t('apiErrors.timeout')
  if (!e?.response) return i18n.t('apiErrors.network')

  return fallback || i18n.t('apiErrors.generic')
}
