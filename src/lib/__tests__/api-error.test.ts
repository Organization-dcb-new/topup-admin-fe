import { describe, it, expect } from 'vitest'
import { apiErrorMessage } from '@/lib/api-error'

describe('apiErrorMessage', () => {
  it('menerjemahkan 429 jadi pesan rate limit, mengabaikan pesan server', () => {
    const err = {
      response: { status: 429, data: { message: 'Too Many Requests raw' } },
    }
    expect(apiErrorMessage(err)).toBe('Too many attempts. Please try again later.')
  })

  it('meneruskan pesan server bila ada', () => {
    const err = {
      response: { status: 400, data: { message: 'Password salah' } },
    }
    expect(apiErrorMessage(err)).toBe('Password salah')
  })

  it('mengenali timeout axios (ECONNABORTED)', () => {
    expect(apiErrorMessage({ code: 'ECONNABORTED' })).toBe(
      'The request timed out. Please try again.',
    )
  })

  it('mengenali kegagalan jaringan (tanpa response)', () => {
    expect(apiErrorMessage({ code: 'ERR_NETWORK' })).toBe(
      'Cannot reach the server. Check your connection.',
    )
  })

  it('memakai fallback bila server tidak mengirim pesan', () => {
    const err = { response: { status: 500, data: {} } }
    expect(apiErrorMessage(err, 'Fallback khusus')).toBe('Fallback khusus')
  })

  it('memakai pesan generik bila tanpa fallback', () => {
    const err = { response: { status: 500, data: {} } }
    expect(apiErrorMessage(err)).toBe('Something went wrong. Please try again.')
  })
})
