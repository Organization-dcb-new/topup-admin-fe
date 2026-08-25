import { describe, it, expect } from 'vitest'
import { resolvePageTitleKey, resolvePageMatch } from '@/lib/title-map'

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

describe('resolvePageMatch', () => {
  it('halaman biasa bukan detail', () => {
    const match = resolvePageMatch('/games')
    expect(match).toMatchObject({ key: 'games', basePath: '/games', isDetail: false })
    expect(match?.detailSegment).toBeUndefined()
  })

  it('halaman detail membawa basePath dan segmen terakhir', () => {
    expect(resolvePageMatch('/games/abc-123')).toMatchObject({
      key: 'games',
      basePath: '/games',
      isDetail: true,
      detailSegment: 'abc-123',
    })
  })

  it('detail bersarang memilih induk terpanjang', () => {
    expect(resolvePageMatch('/products/callback-logs/77')).toMatchObject({
      key: 'productCallbackLogs',
      basePath: '/products/callback-logs',
      isDetail: true,
      detailSegment: '77',
    })
  })

  it('path tak dikenal mengembalikan null', () => {
    expect(resolvePageMatch('/entah-apa')).toBeNull()
  })
})
