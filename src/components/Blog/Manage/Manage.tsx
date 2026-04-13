import { Badge } from '@/components/ui/badge'
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

  const statusLabel = (status: 'draft' | 'published') =>
    status === 'published' ? t('blogTable.statusPublished') : t('blogTable.statusDraft')

  return (
    <div className="grid animate-in grid-cols-1 gap-8 fade-in duration-500 lg:grid-cols-4">
      <div className="space-y-6 lg:col-span-3">
        <Field
          formData={formData}
          handleEditorImageUpload={handleEditorImageUpload}
          updateField={updateField}
        />

        <Category formData={formData} listCategory={listCategory} updateField={updateField} />

        <div className="space-y-2 rounded-xl border border-border/80 bg-card p-4 shadow-sm ring-1 ring-gray-900/5 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="blog-excerpt" className="text-xs font-semibold text-muted-foreground">
              {t('blogManage.excerptLabel')}
            </Label>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums',
                formData.excerpt.length >= EXCERPT_MAX_LENGTH
                  ? 'bg-destructive/15 text-destructive'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {formData.excerpt.length}/{EXCERPT_MAX_LENGTH}
            </span>
          </div>
          <Textarea
            id="blog-excerpt"
            placeholder={t('blogManage.excerptPlaceholder')}
            value={formData.excerpt}
            maxLength={EXCERPT_MAX_LENGTH}
            onChange={(e) => updateField('excerpt', e.target.value)}
            className="resize-none border-0 bg-transparent p-0 text-sm italic shadow-none focus-visible:ring-0"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-6">
        {isEdit && (
          <div
            className={cn(
              'flex items-center justify-between rounded-xl border p-4 shadow-sm ring-1 ring-gray-900/5',
              formData.status === 'published'
                ? 'border-emerald-200/80 bg-emerald-50/90 dark:border-emerald-900/50 dark:bg-emerald-950/40'
                : 'border-amber-200/80 bg-amber-50/90 dark:border-amber-900/50 dark:bg-amber-950/40',
            )}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('blogManage.statusLabel')}
            </span>
            <Badge
              variant={formData.status === 'published' ? 'default' : 'secondary'}
              className={cn(
                'text-xs font-medium',
                formData.status === 'published' &&
                  'border-transparent bg-emerald-600 hover:bg-emerald-600',
              )}
            >
              {statusLabel(formData.status)}
            </Badge>
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
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 ring-1 ring-gray-900/5">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t('blogManage.publishedChangesHint')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
