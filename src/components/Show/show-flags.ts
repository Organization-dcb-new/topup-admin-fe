import { Flame, Sparkles, TrendingUp, type LucideIcon } from 'lucide-react'

export type ShowBadgeKey = 'is_hot' | 'is_new' | 'is_popular'

/** Storefront badges; visibility (`is_show`) is handled on its own. */
export const SHOW_BADGES: { key: ShowBadgeKey; icon: LucideIcon; on: string }[] = [
  { key: 'is_hot', icon: Flame, on: 'bg-rose-50 text-rose-600 ring-rose-200' },
  { key: 'is_new', icon: Sparkles, on: 'bg-cyan-50 text-cyan-700 ring-cyan-200' },
  { key: 'is_popular', icon: TrendingUp, on: 'bg-amber-50 text-amber-700 ring-amber-200' },
]
