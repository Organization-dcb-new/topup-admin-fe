import { useCallback, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import { api } from '@/api/axios'
import { apiErrorMessage } from '@/lib/api-error'
import { uploadFile } from '@/hooks/useUpload'
import type {
  Blog,
  BlogDetail,
  BlogFormValues,
  BlogPaginationMeta,
  BlogStatus,
  BlogTaxonomy,
} from '../types/blog'

export interface BlogListParams {
  page: number
  limit: number
  search?: string
  status?: BlogStatus | ''
  category?: string
}

export interface BlogListResponse {
  data: Blog[]
  meta: BlogPaginationMeta
  message: string
  status: 'success' | 'error'
}

export const blogKeys = {
  all: ['blogs'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (params: BlogListParams) => [...blogKeys.lists(), params] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (id: string) => [...blogKeys.details(), id] as const,
  taxonomy: () => [...blogKeys.all, 'taxonomy'] as const,
}

interface ApiErrorLike {
  response?: { status?: number }
}

function errorStatus(err: unknown): number | undefined {
  return (err as ApiErrorLike | null | undefined)?.response?.status
}

/**
 * `tags` dan `published_at` dinormalkan sekali di sini supaya komponen tidak
 * perlu menjaga `?? []` / `?? null` di setiap tempat pemakaian.
 */
function normalizeBlog<T extends Blog>(raw: T): T {
  return {
    ...raw,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    published_at: raw.published_at ?? null,
  }
}

export const useGetBlogs = (params: BlogListParams) =>
  useQuery({
    queryKey: blogKeys.list(params),
    queryFn: async () => {
      const search = params.search?.trim()
      const category = params.category?.trim()
      const { data } = await api.get<BlogListResponse>('/blogs/admin/private', {
        params: {
          page: params.page,
          limit: params.limit,
          ...(search ? { search } : {}),
          ...(params.status ? { status: params.status } : {}),
          ...(category ? { category } : {}),
        },
      })
      return { ...data, data: (data.data ?? []).map(normalizeBlog) }
    },
    // Daftar lama tetap terpampang saat halaman/filter berikutnya dimuat, jadi
    // tinggi kontainer tidak mengempis dan posisi scroll tidak melompat.
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  })

export const useGetBlogById = (id?: string) =>
  useQuery({
    queryKey: blogKeys.detail(id ?? ''),
    queryFn: async () => {
      const { data } = await api.get<{ data: BlogDetail }>(`/blogs/admin/${id}`)
      return normalizeBlog(data.data)
    },
    enabled: !!id,
    staleTime: 30_000,
  })

export const useGetBlogTaxonomy = () =>
  useQuery({
    queryKey: blogKeys.taxonomy(),
    queryFn: async () => {
      const { data } = await api.get<{ data: BlogTaxonomy }>('/blogs/admin/taxonomy')
      return {
        categories: data.data?.categories ?? [],
        tags: data.data?.tags ?? [],
      }
    },
    staleTime: 60_000,
  })

export const useDeleteBlog = () => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<{ status: string; message: string }>(`/blogs/admin/${id}`)
      return data
    },
    onMutate: () => toast.loading(t('blogToasts.deleteLoading')),
    onSuccess: (_data, _id, toastId) => {
      toast.success(t('blogToasts.deleteSuccess'), { id: toastId })
      queryClient.invalidateQueries({ queryKey: blogKeys.all })
    },
    onError: (err: unknown, _id, toastId) => {
      // 404 berarti artikelnya memang sudah tidak ada di server — muat ulang
      // daftar supaya baris hantunya ikut hilang, bukan dibiarkan tertinggal.
      if (errorStatus(err) === 404) {
        queryClient.invalidateQueries({ queryKey: blogKeys.all })
      }
      toast.error(apiErrorMessage(err, t('blogToasts.deleteError')), { id: toastId })
    },
  })
}

interface UseBlogMutationsOptions {
  blogId?: string
  onSuccess?: (blog: BlogDetail) => void
}

interface UploadEnvelope {
  data?: { url?: string }
}

export const useBlogMutations = ({ blogId, onSuccess }: UseBlogMutationsOptions = {}) => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSlugConflict, setIsSlugConflict] = useState(false)

  const runUpload = useCallback(async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)
    try {
      const res: UploadEnvelope = await uploadFile(file, setUploadProgress)
      const url = res.data?.url
      if (!url) throw new Error('upload: server did not return a url')
      return url
    } finally {
      setIsUploading(false)
    }
  }, [])

  /**
   * Kedua kanal unggah sengaja hanya mengembalikan URL. Sebelumnya satu mutasi
   * dipakai bersama dan `onSuccess`-nya menulis `thumbnail` tanpa syarat, jadi
   * setiap gambar yang disisipkan ke badan artikel menimpa thumbnailnya.
   */
  const uploadThumbnail = useCallback(
    async (file: File) => {
      try {
        const url = await runUpload(file)
        toast.success(t('blogToasts.thumbnailUploadSuccess'))
        return url
      } catch (err) {
        toast.error(apiErrorMessage(err, t('blogToasts.thumbnailUploadError')))
        throw err
      }
    },
    [runUpload, t],
  )

  const uploadInlineImage = useCallback(
    async (file: File) => {
      try {
        return await runUpload(file)
      } catch (err) {
        toast.error(apiErrorMessage(err, t('blogToasts.inlineImageUploadError')))
        throw err
      }
    },
    [runUpload, t],
  )

  const mutation = useMutation({
    mutationFn: async (values: BlogFormValues) => {
      const payload: BlogFormValues = { ...values, tags: values.tags ?? [] }
      if (blogId) {
        const { data } = await api.patch<{ data: BlogDetail }>(`/blogs/admin/${blogId}`, payload)
        return data.data
      }
      const { data } = await api.post<{ data: BlogDetail }>('/blogs/admin', payload)
      return data.data
    },
    onMutate: () => setIsSlugConflict(false),
    onSuccess: (blog, variables) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all })
      if (blogId) {
        toast.success(t('blogToasts.updateSuccess'))
      } else {
        toast.success(
          variables.status === 'published'
            ? t('blogToasts.publishSuccess')
            : t('blogToasts.draftSavedSuccess'),
        )
      }
      onSuccess?.(blog)
    },
    onError: (err: unknown) => {
      // 409 dari backend berarti judul menghasilkan slug yang sudah dipakai —
      // pemanggil bisa membaca `isSlugConflict` untuk menandai field judulnya.
      if (errorStatus(err) === 409) {
        setIsSlugConflict(true)
        toast.error(t('blogToasts.slugConflict'))
        return
      }
      const errMsg = apiErrorMessage(err, t('blogToasts.serverErrorFallback'))
      toast.error(
        blogId
          ? t('blogToasts.updateFailed', { error: errMsg })
          : t('blogToasts.saveFailed', { error: errMsg }),
      )
    },
  })

  const { mutateAsync } = mutation

  const submit = useCallback(
    async (values: BlogFormValues) => {
      try {
        await mutateAsync(values)
      } catch {
        // Kegagalan sudah dilaporkan lewat toast di `onError`; jangan biarkan
        // promise-nya menolak dan memaksa setiap pemanggil memasang try/catch.
      }
    },
    [mutateAsync],
  )

  const clearSlugConflict = useCallback(() => setIsSlugConflict(false), [])

  return {
    submit,
    isSubmitting: mutation.isPending,
    uploadThumbnail,
    uploadInlineImage,
    isUploading,
    uploadProgress,
    isSlugConflict,
    clearSlugConflict,
  }
}
