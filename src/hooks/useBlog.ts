import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { api } from '@/api/axios'
import i18n from '@/i18n'
import type { BlogListResponse, BlogPayload } from '@/types/blog'

export const blogsQueryKey = ['blogs'] as const

export const useGetBlogs = (page: number, limit: number) =>
  useQuery<BlogListResponse>({
    queryKey: [...blogsQueryKey, page, limit],
    queryFn: async () => {
      const res = await api.get('/blogs/admin/private', { params: { page, limit } })
      return res.data
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })

/** Creates the article, or updates it when `blogId` is given. */
export function useSaveBlog(blogId: string | undefined, onSaved?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BlogPayload) =>
      blogId ? api.patch(`/blogs/admin/${blogId}`, payload) : api.post('/blogs/admin', payload),
    onSuccess: (_res, payload) => {
      const key = blogId ? 'updated' : payload.status === 'published' ? 'published' : 'drafted'
      toast.success(i18n.t(`blogPage.toasts.${key}`))
      void queryClient.invalidateQueries({ queryKey: blogsQueryKey })
      onSaved?.()
    },
    onError: () => toast.error(i18n.t(blogId ? 'blogPage.toasts.updateError' : 'blogPage.toasts.createError')),
  })
}

export function useDeleteBlog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/blogs/admin/${id}`),
    onSuccess: () => {
      toast.success(i18n.t('blogPage.toasts.deleted'))
      void queryClient.invalidateQueries({ queryKey: blogsQueryKey })
    },
    onError: () => toast.error(i18n.t('blogPage.toasts.deleteError')),
  })
}
