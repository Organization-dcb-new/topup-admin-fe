import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useStepUp } from '@/hooks/useStepUp'
import { useAuthUser } from '@/lib/auth'
import { authStateForRole } from '@/test/auth-fixture'

vi.mock('@/lib/auth', () => ({ useAuthUser: vi.fn() }))

const mockUseAuthUser = vi.mocked(useAuthUser)

/** Profil aktor dengan 2FA menyala atau mati. */
const signedInWith2FA = (enabled: boolean) => {
  const state = authStateForRole('dev')
  return { ...state, user: { ...state.user!, two_factor_enabled: enabled } }
}

const apiError = (message: string) => ({ response: { data: { message } } })

describe('useStepUp', () => {
  beforeEach(() => vi.clearAllMocks())

  // Gate ini menaikkan jaminan bagi yang punya faktor kedua, bukan memaksa
  // semua orang mengaktifkannya lebih dulu.
  it('tidak meminta kode kalau aktor belum mengaktifkan 2FA', () => {
    mockUseAuthUser.mockReturnValue(signedInWith2FA(false))
    const { result } = renderHook(() => useStepUp())

    expect(result.current.required).toBe(false)
    expect(result.current.canSubmit).toBe(true)
    expect(result.current.otp).toBeUndefined()
  })

  it('menahan aksi sampai enam digit terisi kalau 2FA aktif', () => {
    mockUseAuthUser.mockReturnValue(signedInWith2FA(true))
    const { result } = renderHook(() => useStepUp())

    expect(result.current.required).toBe(true)
    expect(result.current.canSubmit).toBe(false)

    act(() => result.current.changeCode('12345'))
    expect(result.current.canSubmit).toBe(false)
    // Kode setengah jadi tidak boleh ikut terkirim sebagai header.
    expect(result.current.otp).toBeUndefined()

    act(() => result.current.changeCode('123456'))
    expect(result.current.canSubmit).toBe(true)
    expect(result.current.otp).toBe('123456')
  })

  it('mengosongkan kolom dan menampilkan pesan saat kode ditolak', () => {
    mockUseAuthUser.mockReturnValue(signedInWith2FA(true))
    const { result } = renderHook(() => useStepUp())

    act(() => result.current.changeCode('123456'))

    let handled = false
    act(() => {
      handled = result.current.handleError(apiError('STEP_UP_INVALID'))
    })

    expect(handled).toBe(true)
    // Kode yang sudah ditolak tidak akan pernah sah lagi.
    expect(result.current.code).toBe('')
    expect(result.current.canSubmit).toBe(false)
    expect(result.current.error).toBeTruthy()
    expect(result.current.error).not.toMatch(/^STEP_UP_/)
  })

  it('membedakan pesan kode terpakai dari kode salah', () => {
    mockUseAuthUser.mockReturnValue(signedInWith2FA(true))
    const { result } = renderHook(() => useStepUp())

    act(() => void result.current.handleError(apiError('STEP_UP_INVALID')))
    const invalid = result.current.error

    act(() => void result.current.handleError(apiError('STEP_UP_REUSED')))
    expect(result.current.error).not.toBe(invalid)
  })

  // Galat biasa harus lewat, kalau tidak toast-nya ikut hilang.
  it('melepas galat yang bukan dari gate 2FA', () => {
    mockUseAuthUser.mockReturnValue(signedInWith2FA(true))
    const { result } = renderHook(() => useStepUp())

    let handled = true
    act(() => {
      handled = result.current.handleError(apiError('access denied: insufficient permissions'))
    })

    expect(handled).toBe(false)
    expect(result.current.error).toBeNull()
  })

  // Profil di cache bisa tertinggal kalau 2FA baru dinyalakan di tab lain.
  // Yang menentukan akhirnya jawaban server, bukan cache.
  it('memunculkan kolom OTP kalau server menuntutnya walau profil bilang 2FA mati', () => {
    mockUseAuthUser.mockReturnValue(signedInWith2FA(false))
    const { result } = renderHook(() => useStepUp())

    expect(result.current.required).toBe(false)

    act(() => void result.current.handleError(apiError('STEP_UP_REQUIRED')))

    expect(result.current.required).toBe(true)
    expect(result.current.canSubmit).toBe(false)
  })

  it('reset mengosongkan kode dan galat', () => {
    mockUseAuthUser.mockReturnValue(signedInWith2FA(true))
    const { result } = renderHook(() => useStepUp())

    act(() => result.current.changeCode('123456'))
    act(() => void result.current.handleError(apiError('STEP_UP_INVALID')))
    act(() => result.current.reset())

    expect(result.current.code).toBe('')
    expect(result.current.error).toBeNull()
  })

  it('mengetik ulang menghapus pesan galat sebelumnya', () => {
    mockUseAuthUser.mockReturnValue(signedInWith2FA(true))
    const { result } = renderHook(() => useStepUp())

    act(() => void result.current.handleError(apiError('STEP_UP_INVALID')))
    expect(result.current.error).toBeTruthy()

    act(() => result.current.changeCode('1'))
    expect(result.current.error).toBeNull()
  })
})
