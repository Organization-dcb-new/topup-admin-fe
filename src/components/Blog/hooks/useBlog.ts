import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { BlogFormValues } from '../types/blog'
import { api } from '@/api/axios'
import toast from 'react-hot-toast'

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
    thumbnail: '',
    status: 'draft',
  }

  const [formData, setFormData] = useState<BlogFormValues>(initialValue)

  const resetForm = () => setFormData(initialValue)

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const data = new FormData()
      data.append('file', file)
      const res = await api.post('/upload/new', data)
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
    onSuccess: () => {
      const message = blogId ? 'Artikel diperbarui!' : 'Artikel dipublish!'
      toast.success(message)

      queryClient.invalidateQueries({ queryKey: ['blogs'] })

      if (!blogId) {
        resetForm()
        setView('list')
      }
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Terjadi kesalahan pada server'
      toast.error(blogId ? `Gagal update: ${errMsg}` : `Gagal create: ${errMsg}`)
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

  const updateField = (field: keyof BlogFormValues, value: string) => {
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

export const useGetBlogs = () => {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const res = await api.get('/blogs')
      return res.data
    },
  })
}

export const useDeleteBlog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/blogs/admin/${id}`)
    },
    onSuccess: () => {
      toast.success('Artikel berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
    onError: () => toast.error('Gagal menghapus artikel'),
  })
}
