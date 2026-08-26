import { useState } from 'react'
import { useAuthUser } from '@/lib/auth'
import {
  STEP_UP_CODE_LENGTH,
  stepUpErrorMessage,
  stepUpSentinel,
} from '@/lib/step-up'

/**
 * State satu kolom OTP untuk satu aksi sensitif.
 *
 * Dipakai bersama `<StepUpOtpSection>` di permukaan tempat aksinya benar-benar
 * dijalankan — dialog konfirmasi atau footer form — supaya tidak ada modal
 * kedua yang menumpuk di atas modal pertama.
 */
export function useStepUp() {
  const { user } = useAuthUser()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  // Backend menuntut kode padahal profil di cache bilang 2FA mati. Bisa
  // terjadi kalau 2FA baru diaktifkan di tab lain. Kolomnya dimunculkan
  // berdasarkan jawaban server, bukan hanya berdasarkan cache.
  const [forcedByServer, setForcedByServer] = useState(false)

  const required = user?.two_factor_enabled === true || forcedByServer
  const isComplete = code.length === STEP_UP_CODE_LENGTH

  /** Aksi boleh dikirim: entah tidak butuh kode, atau kodenya sudah lengkap. */
  const canSubmit = !required || isComplete

  /** Kode yang dikirim ke server; `undefined` berarti header tidak dipasang. */
  const otp = required && isComplete ? code : undefined

  const reset = () => {
    setCode('')
    setError(null)
  }

  const changeCode = (next: string) => {
    setCode(next)
    if (error) setError(null)
  }

  /**
   * Mengembalikan true kalau galat ini milik gate step-up dan sudah ditangani
   * di kolom OTP. Pemanggil memakainya untuk tidak memunculkan pesan kedua.
   */
  const handleError = (err: unknown): boolean => {
    const sentinel = stepUpSentinel(err)
    if (!sentinel) return false

    if (sentinel === 'STEP_UP_REQUIRED') setForcedByServer(true)
    // Kode yang sudah ditolak — salah, terpakai, atau kadaluwarsa — tidak akan
    // pernah sah lagi, jadi kolomnya dikosongkan alih-alih menyisakan enam
    // digit mati yang tinggal diklik ulang.
    setCode('')
    setError(stepUpErrorMessage(sentinel))
    return true
  }

  return { required, code, changeCode, error, reset, canSubmit, otp, handleError }
}
