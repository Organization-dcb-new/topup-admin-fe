import type { SidebarSection } from '@/constants/sidebar-menu'
import { canAccessPath } from '@/constants/route-roles'

/**
 * Menyaring menu berdasarkan izin route yang sama dengan RoleGuard.
 * Induk tanpa anak yang tersisa ikut dibuang supaya tidak ada grup kosong,
 * dan role tak dikenal menghasilkan menu kosong (fail-closed).
 */
export function filterMenusByRole(
  sections: SidebarSection[],
  role: string | null,
): SidebarSection[] {
  return sections
    .map((section) => ({
      ...section,
      menus: section.menus
        .map((menu) => ({
          ...menu,
          children: menu.children?.filter((child) =>
            canAccessPath(child.path, role),
          ),
        }))
        .filter((menu) =>
          menu.children ? menu.children.length > 0 : canAccessPath(menu.path, role),
        ),
    }))
    .filter((section) => section.menus.length > 0)
}
