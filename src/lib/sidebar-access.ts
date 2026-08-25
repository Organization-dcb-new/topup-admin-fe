import type { SidebarSection } from '@/constants/sidebar-menu'
import { canAccessPath } from '@/constants/route-permissions'

/**
 * Menyaring menu berdasarkan izin route yang sama dengan guard halaman.
 * Induk tanpa anak yang tersisa ikut dibuang supaya tidak ada grup kosong,
 * dan permission kosong menghasilkan menu kosong (fail-closed).
 */
export function filterMenusByPermission(
  sections: SidebarSection[],
  can: (code: string) => boolean,
): SidebarSection[] {
  return sections
    .map((section) => ({
      ...section,
      menus: section.menus
        .map((menu) => ({
          ...menu,
          children: menu.children?.filter((child) =>
            canAccessPath(child.path, can),
          ),
        }))
        .filter((menu) =>
          menu.children ? menu.children.length > 0 : canAccessPath(menu.path, can),
        ),
    }))
    .filter((section) => section.menus.length > 0)
}
