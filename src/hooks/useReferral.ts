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
import type {
  CreateReferralCodeRequest,
  ReferralCodeDetailResponse,
  ReferralCodeListResponse,
  ReferralCodeMutationResponse,
  UpdateReferralCodeRequest,
} from '@/types/referral'

const t = (key: string) => i18n.t(key, { ns: 'common' })

export const referralKeys = {
  all: ['referral-codes'] as const,
  lists: () => [...referralKeys.all, 'list'] as const,
  list: (params: { page: number; limit: number }) => [...referralKeys.lists(), params] as const,
  details: () => [...referralKeys.all, 'detail'] as const,
  detail: (id: string) => [...referralKeys.details(), id] as const,
}

/**
 * Daftar dan detail dipisah agar bisa dibatalkan sendiri-sendiri. Sebelumnya
 * keduanya berbagi prefiks yang sama, sehingga satu kali menggeser status
 * memicu pemuatan ulang setiap halaman daftar *dan* setiap detail yang masih
 * tersimpan — padahal detail ikut menghitung ulang pendapatan per transaksi.
 */
function invalidateLists(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: referralKeys.lists() })
}

export const useGetReferralCodes = (params: { page: number; limit: number }) =>
  useQuery({
    queryKey: referralKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get<ReferralCodeListResponse>('/admin/referral-codes', { params })
      return data
    },
    // Halaman sebelumnya tetap tampil saat halaman berikutnya dimuat, supaya
    // tabel dan pagernya tidak ikut lenyap tiap kali nomor halaman berganti.
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  })

export const useGetReferralCodeById = (id?: string) =>
  useQuery({
    queryKey: referralKeys.detail(id ?? ''),
    queryFn: async () => {
      const { data } = await api.get<ReferralCodeDetailResponse>(`/admin/referral-codes/${id}`)
      return data
    },
    enabled: !!id,
    staleTime: 30_000,
  })

export const useCreateReferralCode = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateReferralCodeRequest) => {
      const { data } = await api.post<ReferralCodeMutationResponse>(
        '/admin/referral-codes',
        payload,
      )
      return data
    },
    onSuccess: () => {
      invalidateLists(queryClient)
      toast.success(t('referralToasts.createSuccess'))
      onSuccessCallback?.()
    },
  })
}

export const useUpdateReferralCode = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateReferralCodeRequest }) => {
      const { data } = await api.patch<ReferralCodeMutationResponse>(
        `/admin/referral-codes/${id}`,
        payload,
      )
      return data
    },
    onSuccess: (_data, variables) => {
      invalidateLists(queryClient)
      queryClient.invalidateQueries({ queryKey: referralKeys.detail(variables.id) })
      toast.success(t('referralToasts.updateSuccess'))
      onSuccessCallback?.()
    },
    onError: (err: unknown) => toast.error(apiErrorMessage(err, t('referralToasts.updateError'))),
  })
}

export const useDeleteReferralCode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<{ status: string; message: string }>(
        `/admin/referral-codes/${id}`,
      )
      return data
    },
    onSuccess: (_data, id) => {
      invalidateLists(queryClient)
      queryClient.removeQueries({ queryKey: referralKeys.detail(id) })
      toast.success(t('referralToasts.deleteSuccess'))
    },
    onError: (err: unknown) => toast.error(apiErrorMessage(err, t('referralToasts.deleteError'))),
  })
}
