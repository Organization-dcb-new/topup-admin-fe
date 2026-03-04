import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { BlogFormValues } from '../types/blog'
import { api } from '@/api/axios'
import toast from 'react-hot-toast'

type ViewMode = 'list' | 'create'

interface useBlogFormProps {
  setView: (view: ViewMode) => void
}

export const useBlogForm = ({ setView }: useBlogFormProps) => {
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
    onSuccess: (url) => setFormData((prev) => ({ ...prev, thumbnail: url })),
  })

  const blogMutation = useMutation({
    mutationFn: async (payload: BlogFormValues) => {
      return api.post('/blogs/admin', payload)
    },
    onSuccess: () => {
      toast.success('Success Create Blog')
      resetForm()
      setView('list')
    },
    onError: () => {
      toast.error('Failed Create Blog')
    },
  })

  const isFormValid = useMemo(() => {
    return (
      formData.title.trim() !== '' &&
      formData.category.trim() !== '' &&
      formData.content_markdown.trim() !== '' &&
      formData.excerpt.trim() !== '' &&
      formData.thumbnail.trim() !== ''
    )
  }, [formData])

  const updateField = (field: keyof BlogFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return {
    formData,
    updateField,
    uploadMutation,
    blogMutation,
    isFormValid,
    handlePublish: (status: 'draft' | 'published') => blogMutation.mutate({ ...formData, status }),
  }
}
