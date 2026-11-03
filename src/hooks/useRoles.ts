import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import { api } from '@/api/axios'
import { PERM } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { refreshAuthSession } from '@/lib/auth'
import type { PermissionGroup, Role, RoleDetail, RolePayload } from '@/types/role'

const ROLES_KEY = ['roles']

export function useRoles(enabled = true) {
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ data: Role[] }>('/admin/roles')
      return data.data
    },
    enabled,
  })
}

export function useRole(id: string | undefined) {
  return useQuery({
    queryKey: [...ROLES_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<{ data: RoleDetail }>(`/admin/roles/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export interface RoleOption {
  slug: string
  /** Missing for the built-in fallback, where only the slug is known. */
  id?: string
  name: string
  description?: string
}

const FALLBACK_ROLE_OPTIONS: RoleOption[] = [
  { slug: 'admin', name: 'Admin' },
  { slug: 'noc', name: 'NOC' },
]

/**
 * Roles an admin account can be given, custom roles included. Dev stays out, as in the picker
 * before RBAC. Without role.view (or on a backend without roles) it falls back to admin and NOC.
 */
export function useRoleOptions(): RoleOption[] {
  const { can } = usePermissions()
  const { data } = useRoles(can(PERM.roleView))
  return useMemo(() => {
    const options = data
      ?.filter((role) => role.slug !== 'dev')
      .map((role) => ({ slug: role.slug, id: role.id, name: role.name, description: role.description }))
    return options?.length ? options : FALLBACK_ROLE_OPTIONS
  }, [data])
}

/** The catalog only changes on deploy, so it is fetched once per session. */
export function usePermissionCatalog() {
  return useQuery({
    queryKey: ['permission-catalog'],
    queryFn: async () => {
      const { data } = await api.get<{ data: PermissionGroup[] }>('/admin/permissions')
      return data.data
    },
    staleTime: Infinity,
  })
}

interface SaveRoleInput {
  /** Absent when creating. */
  role?: RoleDetail
  payload: RolePayload
}

function sameCodes(a: string[], b: string[]) {
  return a.length === b.length && new Set([...a, ...b]).size === a.length
}

/**
 * Creates a role, or updates only what changed: details and permissions are separate endpoints,
 * and a system role's name can't be changed at all.
 */
export function useSaveRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ role, payload }: SaveRoleInput): Promise<string> => {
      if (!role) {
        const { data } = await api.post<{ data: RoleDetail }>('/admin/roles', payload)
        return data.data.id
      }
      const detailsChanged = payload.name !== role.name || payload.description !== role.description
      if (detailsChanged) {
        await api.put(`/admin/roles/${role.id}`, {
          name: role.is_system ? role.name : payload.name,
          description: payload.description,
        })
      }
      if (!sameCodes(payload.permission_codes, role.permissions)) {
        await api.put(`/admin/roles/${role.id}/permissions`, {
          permission_codes: payload.permission_codes,
        })
      }
      return role.id
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ROLES_KEY })
      // The edited role may be the admin's own, which changes what the menu should show.
      await refreshAuthSession(queryClient)
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/roles/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLES_KEY }),
  })
}

/** Backend role errors are fixed Indonesian sentences; map them to translated copy. */
const ROLE_ERRORS: Record<string, string> = {
  'role tidak ditemukan': 'rolesPage.errors.notFound',
  'role bawaan sistem tidak bisa diubah namanya atau dihapus': 'rolesPage.errors.systemRole',
  'role masih dipakai admin': 'rolesPage.errors.inUse',
  'nama role sudah dipakai': 'rolesPage.errors.nameTaken',
  'nama role tidak boleh kosong': 'rolesPage.errors.nameEmpty',
  'ada kode permission yang tidak dikenal': 'rolesPage.errors.unknownPermission',
  'permission manajemen role tidak boleh dicabut dari role terakhir yang memilikinya':
    'rolesPage.errors.lastRoleManager',
}

export function roleErrorKey(err: unknown): { key: string; detail?: string } {
  const message = isAxiosError(err) ? err.response?.data?.message : undefined
  if (typeof message === 'string' && ROLE_ERRORS[message]) return { key: ROLE_ERRORS[message] }
  if (isAxiosError(err) && err.response?.status === 403) return { key: 'rolesPage.errors.forbidden' }
  return { key: 'rolesPage.errors.generic', detail: typeof message === 'string' ? message : undefined }
}
