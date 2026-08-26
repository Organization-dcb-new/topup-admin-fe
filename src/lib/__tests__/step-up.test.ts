import { describe, it, expect } from 'vitest'
import {
  STEP_UP_HEADER,
  isStepUpError,
  stepUpConfig,
  stepUpErrorMessage,
  stepUpSentinel,
} from '@/lib/step-up'

/** Bentuk galat axios yang dilihat pemanggil: pesan mesin ada di `data.message`. */
const apiError = (message: string) => ({ response: { data: { message } } })

describe('stepUpSentinel', () => {
  it('mengenali tiap sentinel dari gate 2FA', () => {
    expect(stepUpSentinel(apiError('STEP_UP_REQUIRED'))).toBe('STEP_UP_REQUIRED')
    expect(stepUpSentinel(apiError('STEP_UP_INVALID'))).toBe('STEP_UP_INVALID')
    expect(stepUpSentinel(apiError('STEP_UP_REUSED'))).toBe('STEP_UP_REUSED')
    expect(stepUpSentinel(apiError('STEP_UP_LOCKED'))).toBe('STEP_UP_LOCKED')
    expect(stepUpSentinel(apiError('STEP_UP_UNAVAILABLE'))).toBe('STEP_UP_UNAVAILABLE')
  })

  // Kalau ini meleset, galat biasa ikut ditelan kolom OTP dan toast-nya hilang.
  it('mengabaikan galat yang bukan dari gate 2FA', () => {
    expect(stepUpSentinel(apiError('MFA_REQUIRED'))).toBeNull()
    expect(stepUpSentinel(apiError('access denied: insufficient permissions'))).toBeNull()
    expect(stepUpSentinel(new Error('boom'))).toBeNull()
    expect(stepUpSentinel(undefined)).toBeNull()
  })

  it('isStepUpError mengikuti hasil sentinel', () => {
    expect(isStepUpError(apiError('STEP_UP_INVALID'))).toBe(true)
    expect(isStepUpError(apiError('MFA_REQUIRED'))).toBe(false)
  })
})

describe('stepUpErrorMessage', () => {
  // Sentinel tidak boleh sampai ke layar apa adanya, dan tiap kasus menuntut
  // tindakan berbeda sehingga pesannya tidak boleh sama.
  it('menerjemahkan tiap sentinel jadi kalimat yang berbeda', () => {
    const messages = (
      ['STEP_UP_REQUIRED', 'STEP_UP_INVALID', 'STEP_UP_REUSED', 'STEP_UP_LOCKED', 'STEP_UP_UNAVAILABLE'] as const
    ).map(stepUpErrorMessage)

    for (const message of messages) {
      expect(message).not.toMatch(/^STEP_UP_/)
      expect(message.length).toBeGreaterThan(0)
    }
    expect(new Set(messages).size).toBe(messages.length)
  })
})

describe('stepUpConfig', () => {
  it('memasang header saat kode ada', () => {
    expect(stepUpConfig('123456')).toEqual({ headers: { [STEP_UP_HEADER]: '123456' } })
  })

  // Header kosong tetap memicu preflight dan tetap ditolak server, jadi lebih
  // baik tidak dikirim sama sekali.
  it('tidak memasang header saat kode tidak ada', () => {
    expect(stepUpConfig(undefined)).toEqual({})
    expect(stepUpConfig('')).toEqual({})
  })
})
