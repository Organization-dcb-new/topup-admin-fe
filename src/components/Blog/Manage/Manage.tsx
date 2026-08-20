import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useGetGameNames } from '@/hooks/useGame'
import { cn } from '@/lib/utils'
import type { Blog } from '@/tables/table-blog'
import { useBlogForm } from '../hooks/useBlog'
import { useCallback, useEffect } from 'react'
import 'react-markdown-editor-lite/lib/index.css'
import { useTranslation } from 'react-i18next'
import ButtonManage from './Button'
import Category from './Category'
import Field from './Field'
import Thumbnail from './Thumbnail'

/** Data awal edit: tipe daftar + field opsional dari API detail. */
export type BlogManageInitialData = Blog & {
  content_markdown?: string
  content?: string
  excerpt?: string
}

interface ManageProps {
  setView: (view: 'list' | 'create' | 'edit') => void
  initialData?: BlogManageInitialData | null
  isEdit?: boolean
}

const EXCERPT_MAX_LENGTH = 150

export default function ManageBlog({ setView, initialData, isEdit = false }: ManageProps) {
  const { t } = useTranslation('common')
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
    [uploadMutation],
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
        tags: initialData.tags || [],
      })
    }
  }, [isEdit, initialData, setFormData])

  const isPublished = formData.status === 'published'
  const statusLabel = (status: 'draft' | 'published') =>
    status === 'published' ? t('blogTable.statusPublished') : t('blogTable.statusDraft')

  return (
    <div className='grid animate-in grid-cols-1 gap-6 fade-in duration-500 lg:grid-cols-4'>
      <div className='space-y-5 lg:col-span-3'>
        <Field
          formData={formData}
          handleEditorImageUpload={handleEditorImageUpload}
          updateField={updateField}
        />

        <Category formData={formData} listCategory={listCategory} updateField={updateField} />

        <div className='nb-frame nb-frame-thick nb-sd space-y-2 bg-white p-4'>
          <div className='flex items-center justify-between gap-2'>
            <Label
              htmlFor='blog-excerpt'
              className='text-[11px] font-black uppercase tracking-[0.14em]'
            >
              {t('blogManage.excerptLabel')}
            </Label>
            <span
              className={cn(
                'nb-frame nb-frame-thin px-1.5 py-0.5 text-[10px] font-black tabular-nums',
                formData.excerpt.length >= EXCERPT_MAX_LENGTH ? 'bg-[#ff4d3d]' : 'bg-[#f5f1e8]',
              )}
            >
              {formData.excerpt.length}/{EXCERPT_MAX_LENGTH}
            </span>
          </div>
          <Textarea
            id='blog-excerpt'
            placeholder={t('blogManage.excerptPlaceholder')}
            value={formData.excerpt}
            maxLength={EXCERPT_MAX_LENGTH}
            onChange={(e) => updateField('excerpt', e.target.value)}
            className='resize-none border-0 bg-transparent p-0 text-sm font-bold shadow-none outline-none focus-visible:ring-0 placeholder:font-medium placeholder:text-[#111]/40'
            rows={3}
          />
        </div>
      </div>

      <div className='space-y-5'>
        {isEdit && (
          <div
            className={cn(
              'nb-frame nb-frame-thick nb-sd flex items-center justify-between gap-2 p-4',
              isPublished ? 'bg-[#c9f24d]' : 'bg-[#ffd84d]',
            )}
          >
            <span className='text-[11px] font-black uppercase tracking-[0.14em]'>
              {t('blogManage.statusLabel')}
            </span>
            <span className='nb-frame nb-frame-thin bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wide'>
              {statusLabel(formData.status)}
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

        <Thumbnail formData={formData} uploadMutation={uploadMutation} />

        {isEdit && (
          <div className='nb-frame nb-frame-thin nb-sd-sm bg-[#6fe3f5] p-3'>
            <p className='text-[11px] font-bold leading-relaxed'>
              {t('blogManage.publishedChangesHint')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
