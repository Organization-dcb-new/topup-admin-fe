import { describe, it, expect } from 'vitest'
import { normalizeRecoveryCode } from '@/lib/auth'

describe('normalizeRecoveryCode', () => {
  it('membuang spasi dan mengubah ke huruf besar', () => {
    expect(normalizeRecoveryCode('  ab12cd34ef ')).toBe('AB12CD34EF')
  })

  it('membiarkan kode yang sudah bersih apa adanya', () => {
    expect(normalizeRecoveryCode('AB12CD34EF')).toBe('AB12CD34EF')
  })
})
