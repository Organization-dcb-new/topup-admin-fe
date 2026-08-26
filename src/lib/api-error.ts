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
 *
 * Perhatikan urutan keputusan di bawah: pesan server yang ada SELALU menang
 * atas argumen `fallback`. Sebuah pesan backend yang tidak terdaftar di sini
 * berarti argumen `fallback` yang sudah diterjemahkan tidak pernah terpakai,
 * jadi setiap pesan baru yang bisa dilihat operator perlu masuk daftar ini.
 * Obat yang sebenarnya adalah kode galat yang stabil dari backend; sampai itu
 * ada, pemetaan teks inilah yang dipakai.
 */
const SENTINEL_KEYS: Record<string, string> = {
  MFA_REQUIRED: 'apiErrors.mfaRequired',
  'access denied: insufficient permissions': 'apiErrors.forbidden',
  'tidak bisa mengubah role akun sendiri': 'apiErrors.selfRoleChange',
  'You cannot delete your own account': 'apiErrors.selfDelete',
  // Jaring pengaman. Penolakan gate 2FA biasanya ditangani di kolom OTP lewat
  // `stepUpSentinel`; kalau toh sampai ke toast, jangan tampil sebagai
  // STEP_UP_INVALID mentah.
  STEP_UP_REQUIRED: 'stepUp.errorRequired',
  STEP_UP_INVALID: 'stepUp.errorInvalid',
  STEP_UP_REUSED: 'stepUp.errorReused',
  STEP_UP_LOCKED: 'stepUp.errorLocked',
  STEP_UP_UNAVAILABLE: 'stepUp.errorUnavailable',

  // Pesan modul banner (internal/constants/message.go). Tanpa pemetaan ini
  // operator berbahasa Indonesia menerima kalimat Inggris apa adanya dari
  // server, karena pesan server yang ada selalu menang atas `fallback`.
  'Banner not found': 'apiErrors.bannerNotFound',
  'Invalid banner id': 'apiErrors.bannerInvalidId',
  'start_at must not be later than end_at': 'apiErrors.bannerInvalidSchedule',
  'Reorder items must not be empty': 'apiErrors.bannerReorderEmpty',
  'Reorder items contain a duplicate banner id': 'apiErrors.bannerReorderDuplicate',
  'Reorder items contain a banner id that does not exist':
    'apiErrors.bannerReorderUnknownId',
  'Failed to process banner request': 'apiErrors.bannerOperationFailed',

  // Tiga pesan berikut tidak menyebut modul, jadi terjemahannya pun dijaga
  // netral supaya tetap benar bila modul lain memakai kalimat yang sama.
  'Title is required': 'apiErrors.titleRequired',
  'Image is required': 'apiErrors.imageRequired',
  'is_active is required': 'apiErrors.statusRequired',
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
