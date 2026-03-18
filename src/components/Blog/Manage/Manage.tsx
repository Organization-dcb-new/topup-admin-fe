import { useEffect, useCallback } from 'react'
import 'react-markdown-editor-lite/lib/index.css'

import { useBlogForm } from '../hooks/useBlog'
import { useGetGameNames } from '@/hooks/useGame'
import Thubmnail from './Thumbnail'
import Category from './Category'
import Field from './Field'
import { Textarea } from '@/components/ui/textarea'
import ButtonManage from './Button'

interface ManageProps {
  setView: (view: 'list' | 'create' | 'edit') => void
  initialData?: any
  isEdit?: boolean
}

export default function ManageBlog({ setView, initialData, isEdit = false }: ManageProps) {
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
        tags: initialData?.tags || [],
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

        <Category formData={formData} listCategory={listCategory} updateField={updateField} />

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
        {isEdit && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm ${
              formData.status === 'published'
                ? 'bg-green-50 border-green-100'
                : 'bg-orange-50 border-orange-100'
            }`}
          >
            <span className="text-[10px] font-black uppercase text-gray-400">Status</span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                formData.status === 'published'
                  ? 'bg-green-500 text-white'
                  : 'bg-orange-500 text-white'
              }`}
            >
              {formData.status}
            </span>
          </div>
        )}
        <ButtonManage
          isEdit={isEdit}
          blogMutation={blogMutation}
          handlePublish={handlePublish}
          currentStatusValue={formData.status}
          isFormValid={isFormValid}
          onStatusChange={(status) => updateField('status', status)}
        />

        <Thubmnail formData={formData} uploadMutation={uploadMutation} />

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
