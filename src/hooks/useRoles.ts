import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import i18n from '@/i18n'
import { api } from '@/api/axios'
import { apiErrorMessage } from '@/lib/api-error'
import type {
  CreateRolePayload,
  RoleDetailResponse,
  RoleListResponse,
  SetRolePermissionsPayload,
  UpdateRolePayload,
} from '@/types/permission'

export const rolesQueryKey = ['roles'] as const

/** Profil sendiri ikut dimuat ulang: mengubah permission bisa mengubah hak akses diri sendiri. */
function invalidateAfterRoleChange(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: rolesQueryKey })
  queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  queryClient.invalidateQueries({ queryKey: ['auth-me'] })
}

export function useRoles() {
  return useQuery({
    queryKey: rolesQueryKey,
    queryFn: async () => {
      const { data } = await api.get<RoleListResponse>('/admin/roles')
      return data.data ?? []
    },
  })
}

export function useRoleDetail(id: string | null) {
  return useQuery({
    queryKey: [...rolesQueryKey, id],
    queryFn: async () => {
      const { data } = await api.get<RoleDetailResponse>(`/admin/roles/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateRole(onDone?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateRolePayload) => {
      const { data } = await api.post('/admin/roles', payload)
      return data
    },
    onSuccess: () => {
      toast.success(i18n.t('rolePage.createdOk', { ns: 'common' }))
      invalidateAfterRoleChange(queryClient)
      onDone?.()
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err, i18n.t('rolePage.createFailed', { ns: 'common' }))),
  })
}

export function useUpdateRole(id: string, onDone?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateRolePayload) => {
      const { data } = await api.put(`/admin/roles/${id}`, payload)
      return data
    },
    onSuccess: () => {
      toast.success(i18n.t('rolePage.updatedOk', { ns: 'common' }))
      invalidateAfterRoleChange(queryClient)
      onDone?.()
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err, i18n.t('rolePage.updateFailed', { ns: 'common' }))),
  })
}

/**
 * Mengganti seluruh himpunan permission role — bukan menambah.
 * Kirim daftar lengkap hasil centang, bukan selisihnya.
 */
export function useSetRolePermissions(id: string, onDone?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SetRolePermissionsPayload) => {
      const { data } = await api.put(`/admin/roles/${id}/permissions`, payload)
      return data
    },
    onSuccess: () => {
      toast.success(i18n.t('rolePage.permissionsOk', { ns: 'common' }))
      invalidateAfterRoleChange(queryClient)
      onDone?.()
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err, i18n.t('rolePage.permissionsFailed', { ns: 'common' }))),
  })
}

export function useDeleteRole(onDone?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/roles/${id}`)
    },
    onSuccess: () => {
      toast.success(i18n.t('rolePage.deletedOk', { ns: 'common' }))
      invalidateAfterRoleChange(queryClient)
      onDone?.()
    },
    onError: (err) =>
      toast.error(apiErrorMessage(err, i18n.t('rolePage.deleteFailed', { ns: 'common' }))),
  })
}
