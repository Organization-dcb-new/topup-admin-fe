import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/axios'
import i18n from '@/i18n'
import toast from 'react-hot-toast'
import type { AdminBriefListResponse, AdminResponse, CreateAdminPayload } from '@/types/admin'

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

/** Admin id → display name, e.g. to label who did what in the audit log. */
export function useAdminNames() {
  const { data } = useGetAdminBrief()
  return useMemo(() => new Map((data ?? []).map((admin) => [admin.id, admin.name])), [data])
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
  })
}

export function serverMessage(err: unknown) {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message
}

/** Errors are left to the form, which maps them onto the fields they belong to. */
export function useCreateAdmin(onCreated: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAdminPayload) => api.post('/admin/users', payload),
    onSuccess: (_, payload) => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-brief'] })
      toast.success(i18n.t('adminPage.toasts.created', { name: payload.username }))
      onCreated()
    },
  })
}

export const useAdminMutation = () => {
  const queryClient = useQueryClient()

  const updateRole = useMutation({
    mutationFn: async ({ id, role, roleId }: { id: string; role: string; roleId?: string }) => {
      // The route is PUT. role_id is the RBAC form; the slug keeps pre-RBAC backends working.
      return api.put(`/admin/users/${id}`, { role, ...(roleId && { role_id: roleId }) })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success(i18n.t('adminPage.toasts.roleUpdated'))
    },
    onError: (err: unknown) => {
      toast.error(serverMessage(err) || i18n.t('adminPage.toasts.roleError'))
    },
  })

  const deleteAdmin = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/admin/users/${id}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-brief'] })
      toast.success(i18n.t('adminPage.toasts.deleted'))
    },
    onError: (err: unknown) => {
      toast.error(serverMessage(err) || i18n.t('adminPage.toasts.deleteError'))
    },
  })

  return { updateRole, deleteAdmin }
}
