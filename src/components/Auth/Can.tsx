import type { ReactNode } from 'react'
import { usePermission } from '@/hooks/usePermission'

/**
 * Menyembunyikan aksi yang tidak boleh dilakukan pemilik sesi.
 *
 * Dipasang di call site, bukan di dalam komponen aksinya. Menaruh
 * `if (!can(...)) return null` di dalam komponen akan melanggar rules-of-hooks:
 * `can` bernilai false selama profil dimuat lalu berubah true, sehingga jumlah
 * hook yang dijalankan berubah antar render.
 *
 * Beberapa kode bersifat OR, sama seperti PermissionGuard dan backend.
 */
export const Can = ({
  perm,
  children,
}: {
  perm: string | string[]
  children: ReactNode
}) => {
  const { canAny } = usePermission()
  const codes = Array.isArray(perm) ? perm : [perm]
  return canAny(...codes) ? <>{children}</> : null
}
