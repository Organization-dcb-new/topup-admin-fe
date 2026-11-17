import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import toast from 'react-hot-toast'

import { api } from '@/api/axios'
import i18n from '@/i18n'
import type { AnnouncementInput, AnnouncementListResponse } from '@/types/announcement'

export const announcementsQueryKey = ['announcements'] as const

/** Already toasted by the API client. */
const RBAC_DENIED = 'access denied: insufficient permissions'

/** The backend's 400/404 messages (announcement contract) mapped to this page's copy. */
const SERVER_ERRORS: Record<string, string> = {
  'title is required and must be at most 100 characters': 'announcementPage.errors.title',
  'body must be at most 500 characters': 'announcementPage.form.errors.bodyMax',
  'level must be info, warning or promo': 'announcementPage.errors.level',
  'display must be bar or popup': 'announcementPage.errors.display',
  'link_url must be empty, a storefront path such as /games/mlbb, or an http(s) URL':
    'announcementPage.form.errors.linkInvalid',
  'link_label must be at most 40 characters': 'announcementPage.form.errors.linkLabelMax',
  'image_url must be empty or an http(s) URL': 'announcementPage.form.errors.imageInvalid',
  'starts_at must be before ends_at': 'announcementPage.form.errors.orderInvalid',
  'invalid announcement id': 'announcementPage.errors.notFound',
  'announcement not found': 'announcementPage.errors.notFound',
}

/** The announcement no longer exists (deleted elsewhere); nothing is left to retry. */
export function isAnnouncementGone(err: unknown) {
  return isAxiosError(err) && err.response?.status === 404
}

function notifyError(err: unknown, fallbackKey: string, queryClient: QueryClient) {
  const res = isAxiosError(err) ? err.response : undefined
  const message = typeof res?.data?.message === 'string' ? res.data.message : ''
  // Someone else deleted it: show the list as it is now.
  if (res?.status === 404) void queryClient.invalidateQueries({ queryKey: announcementsQueryKey })
  if (res?.status === 403 && message === RBAC_DENIED) return
  toast.error(i18n.t(SERVER_ERRORS[message] ?? fallbackKey))
}

export function useGetAnnouncements() {
  return useQuery({
    queryKey: announcementsQueryKey,
    queryFn: async (): Promise<AnnouncementListResponse> => {
      const res = await api.get('/announcements/admin')
      return res.data
    },
  })
}

export function useCreateAnnouncement(onSuccessClose?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AnnouncementInput) => {
      const res = await api.post('/announcements', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(i18n.t('announcementPage.toasts.created'))
      void queryClient.invalidateQueries({ queryKey: announcementsQueryKey })
      onSuccessClose?.()
    },
    onError: (err) => notifyError(err, 'announcementPage.toasts.createError', queryClient),
  })
}

/** PUT replaces the whole announcement, so always send every field. */
export function useUpdateAnnouncement(onSuccessClose?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: AnnouncementInput }) => {
      const res = await api.put(`/announcements/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(i18n.t('announcementPage.toasts.updated'))
      void queryClient.invalidateQueries({ queryKey: announcementsQueryKey })
      onSuccessClose?.()
    },
    onError: (err) => notifyError(err, 'announcementPage.toasts.updateError', queryClient),
  })
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/announcements/${id}`)
    },
    onSuccess: () => {
      toast.success(i18n.t('announcementPage.toasts.deleted'))
      void queryClient.invalidateQueries({ queryKey: announcementsQueryKey })
    },
    onError: (err) => notifyError(err, 'announcementPage.toasts.deleteError', queryClient),
  })
}
