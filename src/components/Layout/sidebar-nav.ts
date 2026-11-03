import { useTranslation } from 'react-i18next'

import type { Permission } from '@/constants/permissions'
import { sidebarMenus, type SidebarMenu, type SidebarSection } from '@/constants/sidebar-menu'
import { SIDEBAR_I18N_KEY_BY_TEXT } from '@/i18n/sidebar-label-keys'

export type Translate = (original: string) => string

/** Menu labels are fixed Indonesian strings; this maps them to their i18n keys. */
export function useSidebarCopy(): Translate {
  const { t } = useTranslation('common')
  return (original) => {
    const key = SIDEBAR_I18N_KEY_BY_TEXT[original]
    return key ? t(key) : original
  }
}

type Can = (...codes: Permission[]) => boolean

function canSee(item: SidebarMenu, can: Can) {
  return !item.permission || can(item.permission)
}

/** The menu trimmed to what the admin may open; groups with no visible child disappear. */
export function visibleMenus(can: Can): SidebarSection[] {
  return sidebarMenus
    .map((section) => ({
      ...section,
      menus: section.menus
        .filter((menu) => canSee(menu, can))
        .map((menu) => ({
          ...menu,
          children: menu.children?.filter((child) => canSee(child, can)),
        }))
        .filter((menu) => menu.path || menu.children?.length),
    }))
    .filter((section) => section.menus.length > 0)
}

/** Where to send an admin whose role can't open the dashboard, e.g. a content-only role. */
export function firstAccessiblePath(sections: SidebarSection[]) {
  for (const menu of sections.flatMap((section) => section.menus)) {
    const path = menu.path ?? menu.children?.[0]?.path
    if (path) return path
  }
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
