import { describe, it, expect } from 'vitest'
import {
  diffRecords,
  formatFieldValue,
  hasSnapshot,
} from '@/lib/json-diff'

describe('diffRecords', () => {
  it('menandai field yang nilainya berubah', () => {
    const result = diffRecords({ price: 19000 }, { price: 20500 })
    expect(result).toEqual([
      { key: 'price', kind: 'changed', before: 19000, after: 20500 },
    ])
  })

  it('menandai field yang tidak berubah', () => {
    const result = diffRecords({ name: 'A' }, { name: 'A' })
    expect(result[0].kind).toBe('unchanged')
  })

  it('menandai field baru sebagai added', () => {
    const result = diffRecords({}, { slug: 'honor-of-kings' })
    expect(result[0]).toMatchObject({ key: 'slug', kind: 'added' })
  })

  it('menandai field yang hilang sebagai removed', () => {
    const result = diffRecords({ fee: 2500 }, {})
    expect(result[0]).toMatchObject({ key: 'fee', kind: 'removed' })
  })

  it('menangani snapshot null di salah satu sisi', () => {
    expect(diffRecords(null, { a: 1 })[0].kind).toBe('added')
    expect(diffRecords({ a: 1 }, null)[0].kind).toBe('removed')
    expect(diffRecords(null, null)).toEqual([])
  })

  it('menggabungkan key dari kedua sisi dan mengurutkannya', () => {
    const result = diffRecords({ b: 1, a: 1 }, { c: 1 })
    expect(result.map((r) => r.key)).toEqual(['a', 'b', 'c'])
  })

  it('membandingkan nilai bersarang berdasarkan isi, bukan referensi', () => {
    const before = { meta: { tags: ['x', 'y'] } }
    const after = { meta: { tags: ['x', 'y'] } }
    expect(diffRecords(before, after)[0].kind).toBe('unchanged')

    const changed = diffRecords(before, { meta: { tags: ['x'] } })
    expect(changed[0].kind).toBe('changed')
  })

  it('membedakan null dan undefined dari perubahan nyata', () => {
    expect(diffRecords({ a: null }, { a: undefined })[0].kind).toBe('unchanged')
  })
})

describe('hasSnapshot', () => {
  it('false bila kedua sisi kosong atau null', () => {
    expect(hasSnapshot(null, null)).toBe(false)
    expect(hasSnapshot({}, {})).toBe(false)
    expect(hasSnapshot({}, null)).toBe(false)
  })

  it('true bila salah satu sisi berisi data', () => {
    expect(hasSnapshot({ a: 1 }, null)).toBe(true)
    expect(hasSnapshot(null, { a: 1 })).toBe(true)
  })
})

describe('formatFieldValue', () => {
  it('menampilkan em dash untuk nilai kosong', () => {
    expect(formatFieldValue(null)).toBe('—')
    expect(formatFieldValue(undefined)).toBe('—')
  })

  it('menandai string kosong agar tidak terlihat seperti tidak ada nilai', () => {
    expect(formatFieldValue('')).toBe('""')
  })

  it('meneruskan primitif apa adanya', () => {
    expect(formatFieldValue('halo')).toBe('halo')
    expect(formatFieldValue(0)).toBe('0')
    expect(formatFieldValue(false)).toBe('false')
  })

  it('merapikan objek sebagai JSON berindentasi', () => {
    expect(formatFieldValue({ a: 1 })).toBe('{\n  "a": 1\n}')
  })
})
