import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import toast from 'react-hot-toast'
import i18n from '@/i18n'
import { api } from '@/api/axios'
import { apiErrorMessage } from '@/lib/api-error'
import { isStepUpError, stepUpConfig } from '@/lib/step-up'
import type {
  AdminBriefListResponse,
  AdminResponse,
  CreateAdminPayload,
  CreateAdminResponse,
} from '@/types/admin'

const t = (key: string) => i18n.t(key, { ns: 'common' })

/**
 * Daftar ringkas ikut dimuat ulang: nama admin baru/terhapus dipakai halaman
 * lain (mis. kolom aktor di log admin) untuk memetakan id → nama. Tanpa ini
 * log menampilkan potongan UUID sampai cache 60 detik kedaluwarsa.
 */
function invalidateAdminCaches(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  queryClient.invalidateQueries({ queryKey: ['admin-brief'] })
}

/** Daftar admin ringkas (id + name) untuk filter, dll. */
export function useGetAdminBrief() {
  return useQuery({
    queryKey: ['admin-brief'],
    queryFn: async () => {
      const { data } = await api.get<AdminBriefListResponse>('/admin/brief')
      return data.data ?? []
    },
    staleTime: 60_000,
  })
}

export const useAdminData = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['admin-users', page, limit],
    queryFn: async () => {
      const { data } = await api.get<AdminResponse>('/admin/users/', {
        params: { page, limit },
      })
      return data
    },
    // Halaman sebelumnya tetap tampil selama halaman berikutnya dimuat.
    // Tanpa ini tabel dan paginasi ikut hilang tiap klik dan diganti spinner.
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  })
}

/**
 * Aksi yang mengubah siapa bisa apa dijaga verifikasi 2FA per aksi di backend.
 * `otp` diteruskan sebagai header lewat `stepUpConfig`, bukan disatukan ke
 * body: gate-nya middleware, jadi tidak satu pun handler perlu tahu.
 */
export const useCreateAdmin = (onDone?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ otp, ...payload }: CreateAdminPayload & { otp?: string }) => {
      const { data } = await api.post<CreateAdminResponse>(
        '/admin/users',
        payload,
        stepUpConfig(otp),
      )
      return data
    },
    onSuccess: () => {
      invalidateAdminCaches(queryClient)
      toast.success(t('adminCreate.success'))
      onDone?.()
    },
  })
}

export const useAdminMutation = () => {
  const queryClient = useQueryClient()

  // Backend mendaftarkan endpoint ini sebagai PUT, bukan PATCH.
  // Sebelumnya FE mengirim PATCH dan selalu ditolak 405.
  const updateRole = useMutation({
    mutationFn: async ({
      id,
      roleId,
      otp,
    }: {
      id: string
      roleId: string
      otp?: string
    }) => {
      return api.put(`/admin/users/${id}`, { role_id: roleId }, stepUpConfig(otp))
    },
    onSuccess: () => {
      invalidateAdminCaches(queryClient)
      // Hak akses bisa berubah untuk diri sendiri juga.
      queryClient.invalidateQueries({ queryKey: ['auth-me'] })
      toast.success(t('adminUpdate.success'))
    },
    // Penolakan dari gate 2FA ditampilkan di kolom OTP tempat kodenya diketik.
    // Tanpa penjagaan ini, satu kode salah muncul dua kali: di kolom dan di toast.
    onError: (err: unknown) => {
      if (isStepUpError(err)) return
      toast.error(apiErrorMessage(err, t('adminUpdate.error')))
    },
  })

  const deleteAdmin = useMutation({
    mutationFn: async ({ id, otp }: { id: string; otp?: string }) => {
      return api.delete(`/admin/users/${id}`, stepUpConfig(otp))
    },
    onSuccess: () => {
      invalidateAdminCaches(queryClient)
      toast.success(t('adminDelete.success'))
    },
    onError: (err: unknown) => {
      if (isStepUpError(err)) return
      toast.error(apiErrorMessage(err, t('adminDelete.error')))
    },
  })

  return { updateRole, deleteAdmin }
}
