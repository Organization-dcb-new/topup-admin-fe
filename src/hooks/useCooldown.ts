import { useCallback, useEffect, useRef, useState } from 'react'

/** Countdown in whole seconds, e.g. to lock a form after the server rate-limits it. */
export function useCooldown() {
  const [remaining, setRemaining] = useState(0)
  const endsAt = useRef(0)
  const active = remaining > 0

  useEffect(() => {
    if (!active) return
    // Derive from the end time instead of decrementing, so throttled background tabs stay accurate.
    const id = setInterval(() => {
      setRemaining(Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000)))
    }, 500)
    return () => clearInterval(id)
  }, [active])

  const start = useCallback((seconds: number) => {
    endsAt.current = Date.now() + seconds * 1000
    setRemaining(seconds)
  }, [])

  return { remaining, active, start }
}
