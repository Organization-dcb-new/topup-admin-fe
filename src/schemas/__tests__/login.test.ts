import { describe, it, expect } from 'vitest'
import { loginSchema } from '@/schemas/login'

describe('loginSchema', () => {
  it('menerima input valid dan men-trim identifier', () => {
    const result = loginSchema.parse({
      email_or_username: '  admin  ',
      password: 'secret123',
    })
    expect(result.email_or_username).toBe('admin')
  })

  it('menolak identifier terlalu pendek (setelah trim) dengan pesan i18n', () => {
    const result = loginSchema.safeParse({
      email_or_username: '  ab  ',
      password: 'secret123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email or username is required')
    }
  })

  it('menolak password kurang dari 6 karakter', () => {
    const result = loginSchema.safeParse({
      email_or_username: 'admin',
      password: '12345',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Password must be at least 6 characters',
      )
    }
  })
})
