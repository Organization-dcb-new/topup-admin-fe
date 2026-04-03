import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { BlogFormValues } from '../types/blog'
import { api } from '@/api/axios'
import toast from 'react-hot-toast'
import type { Blog } from '@/tables/table-blog'
import type { PaginationMeta } from '@/types/game'

type ViewMode = 'list' | 'create'

interface useBlogFormProps {
  setView: (view: ViewMode) => void
  blogId?: string
}

export const useBlogForm = ({ setView, blogId }: useBlogFormProps) => {
  const queryClient = useQueryClient()

  const initialValue: BlogFormValues = {
    title: '',
    category: '',
    content_markdown: '',
    excerpt: '',
    tags: [],
    thumbnail: '',
    status: 'draft',
  }

  const [formData, setFormData] = useState<BlogFormValues>(initialValue)

  const resetForm = () => setFormData(initialValue)

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const data = new FormData()
      data.append('image', file)
      const res = await api.post('/upload', data)
      return res.data.data.url
    },
    onSuccess: (url) => {
      setFormData((prev) => ({ ...prev, thumbnail: url }))
      toast.success('Thumbnail berhasil diunggah')
    },
    onError: () => toast.error('Gagal mengunggah gambar'),
  })

  const blogMutation = useMutation({
    mutationFn: async (payload: BlogFormValues) => {
      if (blogId) {
        return api.patch(`/blogs/admin/${blogId}`, payload)
      }
      return api.post('/blogs/admin', payload)
    },
    onSuccess: (_data, variables) => {
      if (blogId) {
        toast.success('Artikel berhasil diperbarui')
      } else {
        toast.success(
          variables.status === 'published'
            ? 'Artikel berhasil dipublikasikan'
            : 'Artikel disimpan sebagai draf',
        )
      }

      queryClient.invalidateQueries({ queryKey: ['blogs'] })

      if (!blogId) {
        resetForm()
        setView('list')
      }
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? String(
              (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? '',
            )
          : ''
      const errMsg = msg || 'Terjadi kesalahan pada server'
      toast.error(blogId ? `Gagal memperbarui artikel: ${errMsg}` : `Gagal menyimpan artikel: ${errMsg}`)
    },
  })

  const isFormValid = useMemo(() => {
    const checks = {
      title: String(formData?.title || '').trim() !== '',
      category: String(formData?.category || '').trim() !== '',
      content: String(formData?.content_markdown || '').trim() !== '',
      excerpt: String(formData?.excerpt || '').trim() !== '',
      thumbnail: String(formData?.thumbnail || '').trim() !== '',
    }

    return Object.values(checks).every(Boolean)
  }, [formData])

  const updateField = <K extends keyof BlogFormValues>(field: K, value: BlogFormValues[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return {
    formData,
    updateField,
    uploadMutation,
    setFormData,
    blogMutation,
    isFormValid,
    handlePublish: (status: 'draft' | 'published') => blogMutation.mutate({ ...formData, status }),
  }
}

/** Tipe `blogMutation` dari hook — selaras inferensi `useMutation` (hindari mismatch generik Error vs unknown). */
export type BlogFormBlogMutationResult = ReturnType<typeof useBlogForm>['blogMutation']

export interface BlogResponse {
  data: Blog[]
  meta: PaginationMeta
  message: string
  status: 'success' | 'error'
}

export const useGetBlogs = (page: number, limit: number) => {
  const query = useQuery<BlogResponse>({
    queryKey: ['blogs', page, limit],
    queryFn: async () => {
      const res = await api.get('/blogs/admin/private', {
        params: { page, limit },
      })
      return res.data
    },
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (!query.isPending) return
    const id = toast.loading('Sedang memuat daftar artikel…')
    return () => {
      toast.dismiss(id)
    }
  }, [query.isPending])

  const lastResultSignature = useRef<string | null>(null)
  const hadError = useRef(false)

  useEffect(() => {
    if (!query.isFetchedAfterMount) return

    if (query.isError) {
      if (!hadError.current) {
        hadError.current = true
        toast.error('Gagal memuat daftar artikel')
      }
      return
    }

    hadError.current = false

    if (!query.isSuccess || !query.data) return

    const signature = `${page}-${limit}-${query.dataUpdatedAt}`
    if (lastResultSignature.current === signature) return
    lastResultSignature.current = signature

    if (query.data.data.length === 0) {
      toast.success('Belum ada artikel')
    } else {
      toast.success('Berhasil memuat daftar artikel')
    }
  }, [
    query.isSuccess,
    query.isError,
    query.isFetchedAfterMount,
    query.data,
    query.dataUpdatedAt,
    page,
    limit,
  ])

  return query
}

export const useDeleteBlog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/blogs/admin/${id}`)
    },
    onMutate: () => toast.loading('Menghapus artikel…'),
    onSuccess: (_data, _id, toastId) => {
      if (toastId != null) {
        toast.success('Artikel berhasil dihapus', { id: toastId as string })
      } else {
        toast.success('Artikel berhasil dihapus')
      }
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
    onError: (_err, _id, toastId) => {
      if (toastId != null) {
        toast.error('Gagal menghapus artikel', { id: toastId as string })
      } else {
        toast.error('Gagal menghapus artikel')
      }
    },
  })
}
