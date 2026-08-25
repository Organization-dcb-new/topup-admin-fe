import { useCallback, useMemo } from 'react'
import { useAuthUser } from '@/lib/auth'

/**
 * Gating berbasis permission.
 *
 * Selama profil masih dimuat, `can()` mengembalikan **false**. Kalau
 * sebaliknya, tombol aksi berkedip muncul lalu hilang tiap kali halaman
 * dibuka — dan sesaat menampilkan aksi yang belum tentu boleh dilakukan.
 *
 * `can` dan `canAny` sengaja dibungkus useCallback agar identitasnya stabil:
 * keduanya dipakai sebagai dependency useMemo di sidebar dan command palette,
 * dan fungsi baru tiap render akan membuat memo itu tidak pernah kena.
 */
export function usePermission() {
  const { permissions, isLoading } = useAuthUser()

  const granted = useMemo(() => new Set(permissions), [permissions])

  const can = useCallback(
    (code: string) => !isLoading && granted.has(code),
    [granted, isLoading],
  )

  /** Bersifat OR — sama seperti RequirePermission di backend. */
  const canAny = useCallback(
    (...codes: string[]) => codes.some((code) => can(code)),
    [can],
  )

  return { can, canAny, isLoading, permissions }
}
