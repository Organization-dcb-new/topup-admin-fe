/**
 * LapakGaming sells per country (topup-be: internal/services/supplier_region.go). A supplier
 * brand and the game it supplies have a region; which regions a sync pulls is the provider's
 * config, e.g. {"regions": ["id", "my"]}.
 */

/** The storefront's own market. A catalog without regions in the config is this one only. */
export const HOME_REGION = 'id'

/** The country's name in the admin's language, e.g. "Malaysia" for my; the code when unknown. */
export function regionName(code: string, locale?: string): string {
  const upper = code.trim().toUpperCase()
  try {
    return new Intl.DisplayNames([locale || 'id'], { type: 'region' }).of(upper) ?? upper
  } catch {
    return upper
  }
}

/** The regions a provider's config lists, home region alone when it lists none. */
export function providerRegions(config: Record<string, unknown> | null | undefined): string[] {
  const raw = config?.regions
  const list = Array.isArray(raw) ? raw.filter((r): r is string => typeof r === 'string' && r.trim() !== '') : []
  const unique = [...new Set(list.map((r) => r.trim().toLowerCase()))]
  return unique.length > 0 ? unique : [HOME_REGION]
}
