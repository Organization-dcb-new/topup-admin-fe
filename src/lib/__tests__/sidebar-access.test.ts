import { describe, it, expect } from 'vitest'
import { sidebarMenus, type SidebarMenu } from '@/constants/sidebar-menu'
import { ROUTE_ROLES, canAccessPath, type AdminRole } from '@/constants/route-roles'
import { filterMenusByRole } from '@/lib/sidebar-access'

const ROLES: AdminRole[] = ['dev', 'admin', 'noc']

function flatten(menus: SidebarMenu[]): SidebarMenu[] {
  return menus.flatMap((menu) => [menu, ...flatten(menu.children ?? [])])
}

const allMenuEntries = flatten(sidebarMenus.flatMap((s) => s.menus))
const pathEntries = allMenuEntries.filter((m) => m.path)

describe('konsistensi menu sidebar dengan izin route', () => {
  it('setiap menu ber-path punya entri di ROUTE_ROLES', () => {
    const missing = pathEntries
      .filter((m) => !ROUTE_ROLES[m.path!])
      .map((m) => `${m.label} (${m.path})`)
    expect(missing).toEqual([])
  })

  it.each(ROLES)(
    'menu yang terlihat oleh role %s selalu lolos guard route-nya',
    (role) => {
      const visible = filterMenusByRole(sidebarMenus, role)
      const visiblePaths = flatten(visible.flatMap((s) => s.menus))
        .filter((m) => m.path)
        .map((m) => m.path!)

      const wouldBeRejected = visiblePaths.filter(
        (path) => !canAccessPath(path, role),
      )
      expect(wouldBeRejected).toEqual([])
    },
  )

  it.each(ROLES)(
    'setiap route yang boleh diakses role %s tetap muncul di menu',
    (role) => {
      const visiblePaths = new Set(
        flatten(filterMenusByRole(sidebarMenus, role).flatMap((s) => s.menus))
          .filter((m) => m.path)
          .map((m) => m.path!),
      )
      const menuPaths = new Set(pathEntries.map((m) => m.path!))

      // Hanya path yang memang punya entri menu (route detail & /summary tidak)
      const hiddenButAllowed = [...menuPaths].filter(
        (path) => canAccessPath(path, role) && !visiblePaths.has(path),
      )
      expect(hiddenButAllowed).toEqual([])
    },
  )
})

describe('filterMenusByRole fail-closed', () => {
  it('role null menghasilkan menu kosong', () => {
    expect(filterMenusByRole(sidebarMenus, null)).toEqual([])
  })

  it('role tak dikenal menghasilkan menu kosong', () => {
    expect(filterMenusByRole(sidebarMenus, 'finance')).toEqual([])
  })

  it('tidak menyisakan grup induk tanpa anak', () => {
    for (const role of ROLES) {
      const sections = filterMenusByRole(sidebarMenus, role)
      for (const section of sections) {
        expect(section.menus.length).toBeGreaterThan(0)
        for (const menu of section.menus) {
          if (menu.children) expect(menu.children.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('noc tidak melihat menu khusus dev/admin', () => {
    const nocPaths = flatten(
      filterMenusByRole(sidebarMenus, 'noc').flatMap((s) => s.menus),
    )
      .filter((m) => m.path)
      .map((m) => m.path!)

    expect(nocPaths).not.toContain('/admin')
    expect(nocPaths).not.toContain('/rate-limit')
    expect(nocPaths).not.toContain('/2fa-setup')
    expect(nocPaths).toContain('/games')
  })
})

describe('canAccessPath', () => {
  it('menolak path yang tidak terdaftar', () => {
    expect(canAccessPath('/path-tidak-ada', 'dev')).toBe(false)
  })

  it('menolak role kosong walau path terdaftar', () => {
    expect(canAccessPath('/games', null)).toBe(false)
  })

  it('mengizinkan kombinasi yang benar', () => {
    expect(canAccessPath('/admin', 'dev')).toBe(true)
    expect(canAccessPath('/admin', 'admin')).toBe(false)
    expect(canAccessPath('/games', 'noc')).toBe(true)
  })
})
