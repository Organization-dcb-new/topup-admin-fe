import { useState } from 'react'

/**
 * The latest non-null value. Callers clear a dialog's target the moment it closes, but the dialog
 * still animates out for a moment; showing the retained value keeps its content from collapsing.
 */
export function useRetained<T>(value: T | null): T | null {
  const [retained, setRetained] = useState(value)
  if (value !== null && value !== retained) setRetained(value)
  return value ?? retained
}
