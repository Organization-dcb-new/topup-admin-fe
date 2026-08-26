import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import i18n from '@/i18n'
import { api } from '@/api/axios'
import { apiErrorMessage } from '@/lib/api-error'
import { isStepUpError, stepUpConfig } from '@/lib/step-up'
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

/**
 * Penolakan permission (mis. 403 karena aktor tak punya `role.view`) tidak
 * akan berubah kalau diulang, jadi langsung dilaporkan sebagai `isError`
 * supaya pemanggil bisa membedakannya dari "berhasil, nol role". Kegagalan
 * sementara tetap diulang agar halaman Role tidak jatuh ke daftar kosong
 * hanya karena satu permintaan meleset.
 */
export function useRoles() {
  return useQuery({
    queryKey: rolesQueryKey,
    queryFn: async () => {
      const { data } = await api.get<RoleListResponse>('/admin/roles')
      return data.data ?? []
    },
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) return false
      return failureCount < 2
    },
    staleTime: 60_000,
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

/**
 * Dijaga verifikasi 2FA per aksi di backend: `CreateRolePayload` membawa
 * `permission_codes`, jadi satu permintaan ini sudah cukup untuk melahirkan
 * role berhak penuh.
 */
export function useCreateRole(onDone?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ otp, ...payload }: CreateRolePayload & { otp?: string }) => {
      const { data } = await api.post('/admin/roles', payload, stepUpConfig(otp))
      return data
    },
    onSuccess: () => {
      toast.success(i18n.t('rolePage.createdOk', { ns: 'common' }))
      invalidateAfterRoleChange(queryClient)
      onDone?.()
    },
    // Penolakan gate 2FA ditampilkan di kolom OTP, bukan sebagai toast kedua.
    onError: (err) => {
      if (isStepUpError(err)) return
      toast.error(apiErrorMessage(err, i18n.t('rolePage.createFailed', { ns: 'common' })))
    },
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
 *
 * Dijaga verifikasi 2FA per aksi di backend. `PUT /admin/roles/:id` yang hanya
 * mengubah nama dan deskripsi sengaja tidak dijaga, sehingga satu kali simpan
 * di form role tetap cukup satu kode.
 */
export function useSetRolePermissions(id: string, onDone?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      otp,
      ...payload
    }: SetRolePermissionsPayload & { otp?: string }) => {
      const { data } = await api.put(
        `/admin/roles/${id}/permissions`,
        payload,
        stepUpConfig(otp),
      )
      return data
    },
    onSuccess: () => {
      toast.success(i18n.t('rolePage.permissionsOk', { ns: 'common' }))
      invalidateAfterRoleChange(queryClient)
      onDone?.()
    },
    onError: (err) => {
      if (isStepUpError(err)) return
      toast.error(apiErrorMessage(err, i18n.t('rolePage.permissionsFailed', { ns: 'common' })))
    },
  })
}

/**
 * Dijaga verifikasi 2FA per aksi di backend. Bukan karena bisa menaikkan hak
 * akses — service menolak menghapus role bawaan sistem maupun role yang masih
 * dipegang admin — tapi karena definisi role beserta seluruh centang
 * permissionnya hilang dan tidak bisa dikembalikan.
 */
export function useDeleteRole(onDone?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, otp }: { id: string; otp?: string }) => {
      await api.delete(`/admin/roles/${id}`, stepUpConfig(otp))
    },
    onSuccess: () => {
      toast.success(i18n.t('rolePage.deletedOk', { ns: 'common' }))
      invalidateAfterRoleChange(queryClient)
      onDone?.()
    },
    onError: (err) => {
      if (isStepUpError(err)) return
      toast.error(apiErrorMessage(err, i18n.t('rolePage.deleteFailed', { ns: 'common' })))
    },
  })
}
