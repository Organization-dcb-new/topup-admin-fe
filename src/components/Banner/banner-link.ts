import { ExternalLink, Link2, Link2Off, type LucideIcon } from 'lucide-react'

export type LinkKind = 'none' | 'internal' | 'external'

export function linkKind(link: string | undefined): LinkKind {
  const value = link?.trim() ?? ''
  if (!value) return 'none'
  return /^https?:\/\//i.test(value) ? 'external' : 'internal'
}

export const LINK_KIND_META: Record<LinkKind, { icon: LucideIcon; chip: string }> = {
  none: { icon: Link2Off, chip: 'bg-slate-100 text-slate-500' },
  internal: { icon: Link2, chip: 'bg-brand-purple/10 text-brand-purple' },
  external: { icon: ExternalLink, chip: 'bg-cyan-50 text-cyan-700' },
}
