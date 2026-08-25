import { describe, it, expect } from 'vitest'
import { resolvePageTitleKey } from '@/lib/title-map'

describe('resolvePageTitleKey', () => {
  it('mencocokkan path persis', () => {
    expect(resolvePageTitleKey('/')).toBe('dashboard')
    expect(resolvePageTitleKey('/games')).toBe('games')
    expect(resolvePageTitleKey('/login')).toBe('login')
  })

  it('halaman detail mewarisi judul induknya', () => {
    expect(resolvePageTitleKey('/games/123')).toBe('games')
    expect(resolvePageTitleKey('/transactions/abc-def')).toBe('transactions')
  })

  it('prefix terpanjang menang', () => {
    expect(resolvePageTitleKey('/admin-logs/9')).toBe('adminLogs')
    expect(resolvePageTitleKey('/products/callback-logs/5')).toBe(
      'productCallbackLogs',
    )
    expect(resolvePageTitleKey('/payment-methods-categories')).toBe(
      'paymentMethodCategories',
    )
  })

  it('path tak dikenal mengembalikan null', () => {
    expect(resolvePageTitleKey('/tidak-ada')).toBeNull()
  })
})
