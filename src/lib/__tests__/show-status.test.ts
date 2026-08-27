import { describe, expect, it } from 'vitest'

import {
  getEffectiveShowBadge,
  getOverriddenShowBadges,
  getShowLiveStatus,
  isShowLive,
} from '@/lib/show-status'
import type { Show } from '@/types/show'

const show = (overrides: Partial<Show> = {}): Show => ({
  id: 'show-1',
  name: 'Etalase',
  alias: 'etalase',
  image: '',
  is_hot: false,
  is_new: false,
  is_popular: false,
  is_show: true,
  sort_order: 0,
  visible_game_count: 3,
  games: [],
  ...overrides,
})

describe('getShowLiveStatus', () => {
  it('tayang dengan game tampil berarti live', () => {
    expect(getShowLiveStatus(show())).toBe('live')
    expect(isShowLive(show())).toBe(true)
  })

  it('tayang tanpa game tampil tidak pernah sampai ke storefront', () => {
    const s = show({ visible_game_count: 0 })
    expect(getShowLiveStatus(s)).toBe('noVisibleGames')
    expect(isShowLive(s)).toBe(false)
  })

  it('is_show=false selalu tersembunyi, berapa pun game yang tampil', () => {
    expect(getShowLiveStatus(show({ is_show: false, visible_game_count: 9 }))).toBe('hidden')
  })
})

describe('getEffectiveShowBadge', () => {
  it('tanpa penanda menghasilkan null', () => {
    expect(getEffectiveShowBadge(show())).toBeNull()
  })

  it('popular mengalahkan new dan hot', () => {
    expect(
      getEffectiveShowBadge(show({ is_popular: true, is_new: true, is_hot: true })),
    ).toBe('is_popular')
  })

  it('new mengalahkan hot', () => {
    expect(getEffectiveShowBadge(show({ is_new: true, is_hot: true }))).toBe('is_new')
  })

  it('hot menang kalau sendirian', () => {
    expect(getEffectiveShowBadge(show({ is_hot: true }))).toBe('is_hot')
  })
})

describe('getOverriddenShowBadges', () => {
  it('menyebut penanda yang tersimpan tapi tidak dirender storefront', () => {
    expect(getOverriddenShowBadges(show({ is_popular: true, is_new: true, is_hot: true }))).toEqual([
      'is_new',
      'is_hot',
    ])
  })

  it('satu penanda tidak mengalahkan apa pun', () => {
    expect(getOverriddenShowBadges(show({ is_hot: true }))).toEqual([])
  })

  it('tanpa penanda tidak ada yang dikalahkan', () => {
    expect(getOverriddenShowBadges(show())).toEqual([])
  })
})
