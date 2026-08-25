import { describe, it, expect } from 'vitest'
import { sidebarMenus, type SidebarMenu } from '@/constants/sidebar-menu'
import { ROUTE_PERMISSIONS, canAccessPath } from '@/constants/route-permissions'
import { filterMenusByPermission } from '@/lib/sidebar-access'
import { permissionsForRole } from '@/test/auth-fixture'
import { PERM } from '@/constants/permissions'

const ROLES = ['dev', 'admin', 'noc'] as const

/** Membuat `can` dari himpunan permission, seperti yang dihasilkan usePermission. */
const canFor = (role: string | null) => {
  const granted = new Set(permissionsForRole(role))
  return (code: string) => granted.has(code)
}

function flatten(menus: SidebarMenu[]): SidebarMenu[] {
  return menus.flatMap((menu) => [menu, ...flatten(menu.children ?? [])])
}

const allMenuEntries = flatten(sidebarMenus.flatMap((s) => s.menus))
const pathEntries = allMenuEntries.filter((m) => m.path)

const visiblePathsFor = (role: string | null) =>
  flatten(filterMenusByPermission(sidebarMenus, canFor(role)).flatMap((s) => s.menus))
    .filter((m) => m.path)
    .map((m) => m.path!)

describe('konsistensi menu sidebar dengan izin route', () => {
  it('setiap menu ber-path punya entri di ROUTE_PERMISSIONS', () => {
    const missing = pathEntries
      .filter((m) => !ROUTE_PERMISSIONS[m.path!])
      .map((m) => `${m.label} (${m.path})`)
    expect(missing).toEqual([])
  })

  it('setiap permission di ROUTE_PERMISSIONS ada di katalog', () => {
    const catalog = new Set<string>(Object.values(PERM))
    const unknown = Object.entries(ROUTE_PERMISSIONS)
      .filter(([, code]) => !catalog.has(code))
      .map(([path, code]) => `${path} → ${code}`)
    expect(unknown).toEqual([])
  })

  it.each(ROLES)(
    'menu yang terlihat oleh role %s selalu lolos guard route-nya',
    (role) => {
      const can = canFor(role)
      const wouldBeRejected = visiblePathsFor(role).filter(
        (path) => !canAccessPath(path, can),
      )
      expect(wouldBeRejected).toEqual([])
    },
  )

  it.each(ROLES)(
    'setiap route yang boleh diakses role %s tetap muncul di menu',
    (role) => {
      const can = canFor(role)
      const visible = new Set(visiblePathsFor(role))
      const menuPaths = new Set(pathEntries.map((m) => m.path!))

      // Hanya path yang memang punya entri menu (route detail & /summary tidak)
      const hiddenButAllowed = [...menuPaths].filter(
        (path) => canAccessPath(path, can) && !visible.has(path),
      )
      expect(hiddenButAllowed).toEqual([])
    },
  )
})

describe('filterMenusByPermission fail-closed', () => {
  it('sesi tanpa permission menghasilkan menu kosong', () => {
    expect(filterMenusByPermission(sidebarMenus, () => false)).toEqual([])
  })

  it('role tak dikenal menghasilkan menu kosong', () => {
    expect(filterMenusByPermission(sidebarMenus, canFor('finance'))).toEqual([])
  })

  it('tidak menyisakan grup induk tanpa anak', () => {
    for (const role of ROLES) {
      const sections = filterMenusByPermission(sidebarMenus, canFor(role))
      for (const section of sections) {
        expect(section.menus.length).toBeGreaterThan(0)
        for (const menu of section.menus) {
          if (menu.children) expect(menu.children.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('noc tidak melihat menu manajemen pengguna maupun role', () => {
    const nocPaths = visiblePathsFor('noc')
    expect(nocPaths).not.toContain('/admin')
    expect(nocPaths).not.toContain('/roles')
    expect(nocPaths).not.toContain('/rate-limit')
    expect(nocPaths).toContain('/games')
    // Koreksi temuan 04: noc kini boleh mengatur 2FA akun sendiri.
    expect(nocPaths).toContain('/2fa-setup')
  })

  it('hanya dev yang melihat manajemen role', () => {
    expect(visiblePathsFor('dev')).toContain('/roles')
    expect(visiblePathsFor('admin')).not.toContain('/roles')
  })
})

describe('canAccessPath', () => {
  const dev = canFor('dev')
  const admin = canFor('admin')
  const noc = canFor('noc')

  it('menolak path yang tidak terdaftar', () => {
    expect(canAccessPath('/path-tidak-ada', dev)).toBe(false)
  })

  it('menolak sesi tanpa permission walau path terdaftar', () => {
    expect(canAccessPath('/games', () => false)).toBe(false)
  })

  it('mengizinkan kombinasi yang benar', () => {
    expect(canAccessPath('/admin', dev)).toBe(true)
    expect(canAccessPath('/admin', admin)).toBe(false)
    expect(canAccessPath('/games', noc)).toBe(true)
  })
})
