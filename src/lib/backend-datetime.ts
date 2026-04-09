import i18n from '@/i18n'
import { format, isValid } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'

/**
 * Parses API datetime strings such as
 * `2026-04-08 14:14:38.671386 +0700 WIB` for display with date-fns.
 */
export function parseBackendDate(raw?: string | null): Date | null {
  if (!raw?.trim()) return null

  const cleaned = raw.replace(/\s*WIB\s*$/i, '').trim()
  const isoLike = cleaned.replace(' ', 'T').replace(/ \+/, '+')
  const date = new Date(isoLike)
  if (isValid(date)) return date

  const base = cleaned.split(' +')[0] ?? cleaned
  const noMs = base.includes('.') ? base.split('.')[0]! : base
  const fallback = new Date(noMs.replace(' ', 'T'))
  return isValid(fallback) ? fallback : null
}

function dateLocale() {
  return i18n.language.startsWith('id') ? idLocale : enUS
}

/** Formatted for UI; returns em dash when parsing fails. */
export function formatBackendDateTime(
  raw?: string | null,
  pattern: string = 'dd MMM yyyy, HH:mm:ss',
): string {
  const d = parseBackendDate(raw)
  if (!d) return '—'
  return format(d, pattern, { locale: dateLocale() })
}
