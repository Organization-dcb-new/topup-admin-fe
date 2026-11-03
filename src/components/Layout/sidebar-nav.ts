import { useTranslation } from 'react-i18next'

import { sidebarMenus, type SidebarMenu, type SidebarSection } from '@/constants/sidebar-menu'
import { SIDEBAR_I18N_KEY_BY_TEXT } from '@/i18n/sidebar-label-keys'

/** Menu labels NOC may see; mirrors the RoleGuards in routes/route.tsx. */
const NOC_ALLOWED = ['Dasbor', 'Transaksi', 'Ikhtisar', 'Konten', 'Banner', 'Acara', 'Artikel', 'Inventaris', 'Game', 'Produk', 'Kategori produk', 'Produk anomali', 'Field input']
const DEV_ONLY_LABELS = ['Pembatas laju', 'Pengguna']

export type Translate = (original: string) => string

/** Menu labels are fixed Indonesian strings (used for role checks); this maps them to i18n. */
export function useSidebarCopy(): Translate {
  const { t } = useTranslation('common')
  return (original) => {
    const key = SIDEBAR_I18N_KEY_BY_TEXT[original]
    return key ? t(key) : original
  }
}

function canSee(role: string | null, label: string) {
  if (role === 'dev') return true
  if (role === 'noc' && !NOC_ALLOWED.includes(label)) return false
  return !DEV_ONLY_LABELS.includes(label)
}

export function menusForRole(role: string | null): SidebarSection[] {
  return sidebarMenus
    .map((section) => ({
      ...section,
      menus: section.menus
        .filter((menu) => canSee(role, menu.label))
        .map((menu) => ({
          ...menu,
          children: menu.children?.filter((child) => canSee(role, child.label)),
        }))
        .filter((menu) => menu.path || menu.children?.length),
    }))
    .filter((section) => section.menus.length > 0)
}

function matchesPath(pathname: string, path: string) {
  return path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`)
}

/** The most specific menu path for the URL, so detail pages (e.g. /games/:id) light up their list page. */
export function findActivePath(sections: SidebarSection[], pathname: string) {
  let best: string | undefined
  for (const item of sections.flatMap((s) => s.menus.flatMap((m) => m.children ?? [m]))) {
    if (item.path && matchesPath(pathname, item.path) && item.path.length > (best?.length ?? -1)) {
      best = item.path
    }
  }
  return best
}

export interface NavTrail {
  group?: SidebarMenu
  item: SidebarMenu
}

export function findTrail(sections: SidebarSection[], activePath: string): NavTrail | undefined {
  for (const menu of sections.flatMap((section) => section.menus)) {
    if (menu.path === activePath) return { item: menu }
    const child = menu.children?.find((c) => c.path === activePath)
    if (child) return { group: menu, item: child }
  }
}
