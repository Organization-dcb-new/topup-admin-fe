import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axios'
import type { PermissionCatalogResponse } from '@/types/permission'

/**
 * Katalog permission untuk matriks centang. Isinya milik kode backend dan
 * hanya berubah saat deploy, jadi aman di-cache lama.
 */
export function usePermissionCatalog() {
  return useQuery({
    queryKey: ['permission-catalog'],
    queryFn: async () => {
      const { data } = await api.get<PermissionCatalogResponse>('/admin/permissions')
      return data.data ?? []
    },
    staleTime: 10 * 60_000,
  })
}
