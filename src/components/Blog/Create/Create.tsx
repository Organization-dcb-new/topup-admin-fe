import { useEffect, useCallback } from 'react'
import 'react-markdown-editor-lite/lib/index.css'

import { useBlogForm } from '../hooks/useBlog'
import { useGetGameNames } from '@/hooks/useGame'
import ButtonCreate from './ButtonCreate'
import Thubmnail from './Thumbnail'
import Category from './Category'
import Field from './Field'
import { Textarea } from '@/components/ui/textarea'

interface CreateProps {
  setView: (view: 'list' | 'create' | 'edit') => void
  initialData?: any
  isEdit?: boolean
}

export default function CreateBlog({ setView, initialData, isEdit = false }: CreateProps) {
  const {
    formData,
    setFormData,
    updateField,
    blogMutation,
    handlePublish,
    isFormValid,
    uploadMutation,
  } = useBlogForm({ setView, blogId: isEdit ? initialData?.id : undefined })

  const { data: listCategory } = useGetGameNames()

  const handleEditorImageUpload = useCallback(
    async (file: File) => {
      return await uploadMutation.mutateAsync(file)
    },
    [uploadMutation]
  )
  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        title: initialData.title || '',
        category: initialData.category || '',
        content_markdown: initialData.content_markdown || initialData.content || '',
        excerpt: initialData.excerpt || '',
        thumbnail: initialData.thumbnail || '',
        status: initialData.status || 'draft',
      })
    }
  }, [isEdit, initialData, setFormData])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-3 space-y-6">
        <Field
          formData={formData}
          handleEditorImageUpload={handleEditorImageUpload}
          updateField={updateField}
        />

        <div className="space-y-2 bg-white p-4 rounded-xl border border-gray-100">
          <label className="text-xs font-bold uppercase text-gray-400">Excerpt / Ringkasan</label>
          <Textarea
            placeholder="Tulis ringkasan singkat artikel..."
            value={formData.excerpt}
            onChange={(e) => updateField('excerpt', e.target.value)}
            className="resize-none border-none focus-visible:ring-0 p-0 text-sm italic"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-6">
        <ButtonCreate
          isEdit={isEdit}
          blogMutation={blogMutation}
          handlePublish={handlePublish}
          isFormValid={isFormValid}
        />

        <Thubmnail formData={formData} uploadMutation={uploadMutation} />

        <Category formData={formData} listCategory={listCategory} updateField={updateField} />

        {isEdit && (
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <p className="text-[10px] text-purple-600 font-medium italic">
              * Mengubah artikel yang sudah dipublish akan langsung memperbarui konten di landing
              page.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
