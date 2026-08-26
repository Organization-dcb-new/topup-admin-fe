import i18n from '@/i18n'

/**
 * Verifikasi 2FA per aksi ("step-up") untuk perubahan yang menentukan siapa
 * bisa apa: membuat/menghapus admin, memindahkan admin ke role lain, dan
 * mengubah himpunan permission sebuah role.
 *
 * Gate sebenarnya ada di backend (middlewares.Require2FA). Berkas ini hanya
 * jalur agar operator bisa memenuhinya tanpa menebak — bukan pemeriksaan.
 * Melewati dialog di sini tidak melewatkan apa pun: request tanpa kode tetap
 * ditolak 403 oleh server.
 */

/** Header yang dibaca middlewares.Require2FA. Harus sama persis. */
export const STEP_UP_HEADER = 'X-2FA-Code'

export const STEP_UP_CODE_LENGTH = 6

/**
 * Sentinel dari backend dipetakan ke kunci terjemahan, bukan dipakai apa
 * adanya: `info` dari server selalu berbahasa Indonesia, sementara panel ini
 * juga dipakai dalam bahasa Inggris. Tiap sentinel menuntut tindakan berbeda,
 * jadi tidak dilebur jadi satu pesan "kode salah".
 */
const STEP_UP_MESSAGE_KEYS = {
  STEP_UP_REQUIRED: 'stepUp.errorRequired',
  STEP_UP_INVALID: 'stepUp.errorInvalid',
  STEP_UP_REUSED: 'stepUp.errorReused',
  STEP_UP_LOCKED: 'stepUp.errorLocked',
  STEP_UP_UNAVAILABLE: 'stepUp.errorUnavailable',
} as const

export type StepUpSentinel = keyof typeof STEP_UP_MESSAGE_KEYS

interface ApiErrorShape {
  response?: { data?: { message?: string } }
}

/** Sentinel step-up dari sebuah galat axios, atau null kalau bukan dari gate ini. */
export function stepUpSentinel(err: unknown): StepUpSentinel | null {
  const message = (err as ApiErrorShape)?.response?.data?.message
  if (message && message in STEP_UP_MESSAGE_KEYS) {
    return message as StepUpSentinel
  }
  return null
}

/**
 * Penanda bahwa kegagalan ini milik kolom OTP, bukan toast. Dipakai hook
 * mutasi untuk menahan toast-nya — kalau tidak, satu kode salah memunculkan
 * dua pesan sekaligus di tempat yang berbeda.
 */
export function isStepUpError(err: unknown): boolean {
  return stepUpSentinel(err) !== null
}

export function stepUpErrorMessage(sentinel: StepUpSentinel): string {
  return i18n.t(STEP_UP_MESSAGE_KEYS[sentinel], { ns: 'common' })
}

/**
 * Konfigurasi axios pembawa kode. Tanpa kode, header sengaja tidak dikirim
 * sama sekali: header kosong tetap memicu preflight dan tetap ditolak server.
 */
export function stepUpConfig(otp?: string) {
  return otp ? { headers: { [STEP_UP_HEADER]: otp } } : {}
}
