import { useEffect, useState } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Preferensi gerak minimal milik sistem operasi, dibaca reaktif.
 *
 * Dibutuhkan terpisah dari kelas `motion-reduce:` karena kelas itu hanya
 * mematikan transisi CSS. Animasi yang dikendalikan JavaScript — timer autoplay,
 * atau tinggi panel yang menunggu `transitionend` — tidak ikut mati olehnya, dan
 * justru menggantung: tanpa transisi, `transitionend` tidak pernah menyala.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(REDUCED_MOTION_QUERY).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const query = window.matchMedia(REDUCED_MOTION_QUERY)
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}
