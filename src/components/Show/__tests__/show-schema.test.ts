import { describe, it, expect } from 'vitest'

import {
  createShowDefaults,
  createShowSchema,
  showToFormValues,
  toShowAlias,
  updateShowSchema,
} from '@/schemas/show'
import type { Show } from '@/types/show'

/**
 * Uji skema Show sengaja tinggal di folder komponen Show, bukan di
 * src/schemas/__tests__, supaya seluruh berkas uji modul ini berada di satu
 * tempat dan tidak bertabrakan dengan uji skema modul lain.
 */

const IMAGE = 'https://cdn.example.com/shows/free-fire.png'

const validCreate = {
  name: 'Free Fire',
  alias: 'Free Fire',
  image: IMAGE,
  is_show: false,
}

const validUpdate = {
  ...validCreate,
  sort_order: 0,
  is_hot: false,
  is_new: false,
  is_popular: false,
  is_show: true,
}

/** Jalur galat yang tersentuh, tanpa bergantung pada teks pesan. */
const issuePaths = (result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
  result.success ? [] : (result.error?.issues.map((issue) => issue.path.join('.')) ?? [])

describe('toShowAlias', () => {
  it('mengubah nama bebas menjadi slug', () => {
    expect(toShowAlias('Mobile Legends: Bang Bang')).toBe('mobile-legends-bang-bang')
  })

  it('membuang spasi tepi dan tanda hubung menggantung', () => {
    expect(toShowAlias('  --Free  Fire--  ')).toBe('free-fire')
  })

  it('menghasilkan string kosong bila tidak ada karakter yang bisa dipakai', () => {
    expect(toShowAlias('   ###   ')).toBe('')
  })

  it('idempoten — menormalkan slug yang sudah rapi tidak mengubahnya', () => {
    const once = toShowAlias('Genshin Impact 2.0')
    expect(toShowAlias(once)).toBe(once)
  })
})

describe('createShowSchema', () => {
  it('menormalkan alias jadi slug sebelum sampai ke handleSubmit', () => {
    const parsed = createShowSchema.parse({
      ...validCreate,
      alias: '  Mobile Legends: Bang Bang  ',
    })
    expect(parsed.alias).toBe('mobile-legends-bang-bang')
  })

  it('men-trim nama', () => {
    expect(createShowSchema.parse({ ...validCreate, name: '  Free Fire  ' }).name).toBe(
      'Free Fire',
    )
  })

  it('menolak alias yang menormal jadi kosong', () => {
    const result = createShowSchema.safeParse({ ...validCreate, alias: '###' })
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('alias')
  })

  it('menolak nama kosong maupun yang hanya berisi spasi', () => {
    expect(createShowSchema.safeParse({ ...validCreate, name: '   ' }).success).toBe(false)
  })

  it('menolak nama lebih dari 100 karakter', () => {
    const result = createShowSchema.safeParse({ ...validCreate, name: 'a'.repeat(101) })
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('name')
  })

  // `image` dirender sebagai src; begitu diisi, hanya URL absolut yang sah.
  it.each([
    ['path relatif', '/uploads/show.png'],
    ['protocol-relative', '//evil.example.com/show.png'],
    ['skema javascript', 'javascript:alert(1)'],
    ['bukan URL', 'show.png'],
  ])('menolak image %s', (_label, image) => {
    const result = createShowSchema.safeParse({ ...validCreate, image })
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('image')
  })

  // Storefront tidak pernah merender gambar show, jadi kolomnya opsional —
  // yang ditegakkan hanya bentuknya begitu diisi.
  it('menerima image kosong', () => {
    const result = createShowSchema.safeParse({ ...validCreate, image: '' })
    expect(result.success).toBe(true)
    expect(issuePaths(result)).not.toContain('image')
  })

  it('menerima URL http/https absolut', () => {
    expect(createShowSchema.safeParse({ ...validCreate, image: IMAGE }).success).toBe(true)
    expect(
      createShowSchema.safeParse({ ...validCreate, image: 'http://cdn.example.com/a.png' })
        .success,
    ).toBe(true)
  })

  // Nilai awal form memang belum sah: tombol simpan tidak boleh lolos begitu saja.
  // `image` tidak lagi ikut karena kolomnya opsional.
  it('nilai default form belum lolos validasi', () => {
    const result = createShowSchema.safeParse(createShowDefaults)
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toEqual(expect.arrayContaining(['name', 'alias']))
    expect(issuePaths(result)).not.toContain('image')
  })

  // Show baru dibuat sebagai draf; menayangkannya adalah pilihan sadar.
  it('nilai awal form tidak menayangkan show', () => {
    expect(createShowDefaults.is_show).toBe(false)
  })
})

describe('updateShowSchema', () => {
  it('menerima kolom lengkap', () => {
    expect(updateShowSchema.safeParse(validUpdate).success).toBe(true)
  })

  it('menormalkan alias sama seperti skema pembuatan', () => {
    expect(updateShowSchema.parse({ ...validUpdate, alias: 'Free Fire' }).alias).toBe('free-fire')
  })

  it('menolak sort_order negatif', () => {
    const result = updateShowSchema.safeParse({ ...validUpdate, sort_order: -1 })
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('sort_order')
  })

  it('menerima sort_order 0', () => {
    expect(updateShowSchema.safeParse({ ...validUpdate, sort_order: 0 }).success).toBe(true)
  })

  it('menolak sort_order pecahan', () => {
    expect(updateShowSchema.safeParse({ ...validUpdate, sort_order: 1.5 }).success).toBe(false)
  })

  // `valueAsNumber` pada kolom kosong menghasilkan NaN; pesannya harus berbeda
  // dari pesan "tidak boleh negatif" supaya admin tahu kolomnya belum diisi.
  it('membedakan kolom urutan kosong (NaN) dari nilai negatif', () => {
    const empty = updateShowSchema.safeParse({ ...validUpdate, sort_order: Number.NaN })
    const negative = updateShowSchema.safeParse({ ...validUpdate, sort_order: -3 })

    expect(empty.success).toBe(false)
    expect(negative.success).toBe(false)
    if (!empty.success && !negative.success) {
      expect(empty.error.issues[0].message).not.toBe(negative.error.issues[0].message)
    }
  })

  it('menolak sort_order tak hingga', () => {
    expect(
      updateShowSchema.safeParse({ ...validUpdate, sort_order: Number.POSITIVE_INFINITY })
        .success,
    ).toBe(false)
  })

  it('menuntut seluruh flag hadir', () => {
    const result = updateShowSchema.safeParse({
      name: validUpdate.name,
      alias: validUpdate.alias,
      image: validUpdate.image,
      sort_order: 0,
      is_hot: false,
      is_new: false,
      is_popular: false,
    })
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('is_show')
  })
})

describe('showToFormValues', () => {
  const show: Show = {
    id: 'show-1',
    name: 'Free Fire',
    alias: 'free-fire',
    image: IMAGE,
    is_hot: true,
    is_new: false,
    is_popular: true,
    is_show: false,
    sort_order: 7,
    visible_game_count: 2,
    games: [],
  }

  it('memindahkan seluruh kolom yang bisa disunting', () => {
    expect(showToFormValues(show)).toEqual({
      name: 'Free Fire',
      alias: 'free-fire',
      image: IMAGE,
      sort_order: 7,
      is_hot: true,
      is_new: false,
      is_popular: true,
      is_show: false,
    })
  })

  it('hasilnya langsung lolos skema edit', () => {
    expect(updateShowSchema.safeParse(showToFormValues(show)).success).toBe(true)
  })
})
