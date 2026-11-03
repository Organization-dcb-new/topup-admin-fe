import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { api } from '@/api/axios'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { Game } from '@/types/game'

export interface HeroArt {
  src: string
  name: string
}

/**
 * Character art dropped into `src/assets/characters/` wins (the file name becomes the caption,
 * e.g. `mobile-legends.webp` → "Mobile Legends"); without any, the live game catalog is used.
 */
const BUNDLED_ART: HeroArt[] = Object.entries(
  import.meta.glob<string>('/src/assets/characters/*.{png,webp,jpg,jpeg,avif}', {
    eager: true,
    import: 'default',
  })
).map(([path, src]) => ({ src, name: captionFromPath(path) }))

const MAX_ART = 6
/** Stalled requests (e.g. a deleted bucket) are dropped instead of holding up the hero. */
const IMAGE_TIMEOUT_MS = 6000
const DESKTOP_QUERY = '(min-width: 1024px)'

interface CatalogCategory {
  games: Game[]
}

function captionFromPath(path: string) {
  const file = path.split('/').pop() ?? ''
  return file
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function preload(art: HeroArt): Promise<HeroArt | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const timer = setTimeout(() => resolve(null), IMAGE_TIMEOUT_MS)
    img.onload = () => {
      clearTimeout(timer)
      resolve(art)
    }
    img.onerror = () => {
      clearTimeout(timer)
      resolve(null)
    }
    img.src = art.src
  })
}

/** Game art for the login hero, limited to images that actually load. */
export function useHeroArt(): HeroArt[] {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const { data } = useQuery({
    queryKey: ['auth-hero-games'],
    queryFn: async () => {
      const res = await api.get<{ data: CatalogCategory[] }>('/games/by-categories')
      return res.data.data
    },
    // The hero only shows on desktop, and bundled art makes the catalog unnecessary.
    enabled: isDesktop && BUNDLED_ART.length === 0,
    staleTime: Infinity,
    retry: false,
  })

  const candidates = useMemo(() => {
    if (BUNDLED_ART.length > 0) return BUNDLED_ART
    const byId = new Map<string, Game>()
    for (const game of (data ?? []).flatMap((category) => category.games)) {
      if (game.is_active && game.is_show && game.thumbnail_url) byId.set(game.id, game)
    }
    return [...byId.values()]
      .sort(
        (a, b) =>
          Number(b.is_featured) - Number(a.is_featured) || b.popularity_score - a.popularity_score
      )
      // Extra candidates, since some thumbnails may fail to load.
      .slice(0, MAX_ART * 2)
      .map((game) => ({ src: game.thumbnail_url, name: game.name }))
  }, [data])

  const [loaded, setLoaded] = useState<HeroArt[]>([])

  useEffect(() => {
    let cancelled = false
    Promise.all(candidates.map(preload)).then((results) => {
      if (!cancelled) setLoaded(results.filter((art): art is HeroArt => art !== null))
    })
    return () => {
      cancelled = true
    }
  }, [candidates])

  return loaded.slice(0, MAX_ART)
}
