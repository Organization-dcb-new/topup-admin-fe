import { useId, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import { ArrowLeft, FileText, Globe, PenLine, Undo2 } from 'lucide-react'

import { AuthAlert, AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { DangerDialog } from '@/components/Auth/DangerDialog'
import { hudEyebrowClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import { Textarea } from '@/components/ui/textarea'
import { getImageFileValidationError } from '@/helpers/validate'
import { useSaveBlog } from '@/hooks/useBlog'
import { useGetGameNames } from '@/hooks/useGame'
import { uploadFile } from '@/hooks/useUpload'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { MAX_FILE_SIZE_LABEL } from '@/lib/file'
import { cn } from '@/lib/utils'
import { EXCERPT_MAX_LENGTH, blogSchema, type BlogFormValues } from '@/schemas/blog'
import type { Blog, BlogStatus } from '@/types/blog'
import { CategoryPicker, TagsInput } from './BlogTaxonomy'

const mdParser = new MarkdownIt()

/** Order of the "fix these first" summary, top of the page to the bottom. */
const FIELD_ORDER: (keyof BlogFormValues)[] = ['title', 'content_markdown', 'excerpt', 'thumbnail', 'category']

const panelClass = 'bg-slate-200/80 p-px hud-clip'
const panelBodyClass = 'space-y-3 bg-white p-5 hud-clip'

interface BlogEditorProps {
  /** Edit this article; leave out to write a new one. */
  blog?: Blog
  onClose: () => void
}

export function BlogEditor({ blog, onClose }: BlogEditorProps) {
  const { t } = useTranslation('common')
  const ids = useId()
  const { data: games = [] } = useGetGameNames()
  const [uploading, setUploading] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isDirty, isSubmitted },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: blog?.title ?? '',
      content_markdown: blog?.content_markdown ?? '',
      excerpt: blog?.excerpt ?? '',
      thumbnail: blog?.thumbnail ?? '',
      category: blog?.category ?? '',
      tags: blog?.tags ?? [],
      status: blog?.status ?? 'draft',
    },
  })
  const values = useWatch({ control }) as BlogFormValues
  const set = <K extends keyof BlogFormValues>(key: K, value: BlogFormValues[K]) =>
    setValue(key, value as never, { shouldDirty: true, shouldValidate: isSubmitted })

  // New articles go back to the list once saved; edits stay open with the saved state as the baseline.
  const save = useSaveBlog(blog?.id, () => (blog ? reset(values) : onClose()))
  const onSubmit = (v: BlogFormValues) => save.mutate(v)

  const leave = () => (isDirty ? setConfirmLeave(true) : onClose())
  const missing = FIELD_ORDER.filter((key) => errors[key])

  const uploadEditorImage = async (file: File) => {
    const invalid = getImageFileValidationError(file)
    if (invalid) {
      toast.error(t(`imageDropzone.errors.${invalid}`, { max: MAX_FILE_SIZE_LABEL }))
      throw new Error(invalid)
    }
    try {
      const res = await uploadFile(file)
      return res.data.url as string
    } catch {
      toast.error(t('imageDropzone.errors.uploadFailed'))
      throw new Error('upload failed')
    }
  }

  const statusOptions: { value: BlogStatus; icon: typeof Globe }[] = [
    { value: 'draft', icon: PenLine },
    { value: 'published', icon: Globe },
  ]

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div className='space-y-2'>
          <button
            type='button'
            onClick={leave}
            className='group inline-flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-brand-purple'
          >
            <ArrowLeft className='size-3.5 transition-transform duration-300 ease-hud group-hover:-translate-x-0.5' aria-hidden />
            {t('blogPage.editor.back')}
          </button>
          <div>
            <p className={hudEyebrowClass}>{blog ? t('blogPage.editor.editEyebrow') : t('blogPage.editor.newEyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>
              {blog ? t('blogPage.editor.editTitle') : t('blogPage.editor.newTitle')}
            </h1>
          </div>
        </div>
        {isDirty && (
          <span className='inline-flex items-center gap-1.5 self-start text-xs font-medium text-amber-700 sm:self-auto'>
            <span className='size-1.5 rounded-full bg-amber-500' aria-hidden />
            {t('blogPage.editor.unsaved')}
          </span>
        )}
      </div>

      <div className='grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]'>
        <div className='min-w-0 space-y-5'>
          <div className={panelClass}>
            <div className={panelBodyClass}>
              <label htmlFor={`${ids}-title`} className={hudLabelClass}>{t('blogPage.editor.titleLabel')}</label>
              <input
                id={`${ids}-title`}
                autoFocus={!blog}
                placeholder={t('blogPage.editor.titlePlaceholder')}
                aria-invalid={!!errors.title}
                className='w-full border-0 bg-transparent font-display text-2xl font-bold tracking-tight text-slate-900 outline-none placeholder:text-slate-300 sm:text-3xl'
                {...register('title')}
              />
              {blog?.slug && <p className='truncate font-mono text-xs text-slate-400'>/blog/{blog.slug}</p>}
              {errors.title?.message && <FieldMessage tone='error'>{t(errors.title.message)}</FieldMessage>}
            </div>
          </div>

          <div className={panelClass}>
            <div className='bg-white hud-clip'>
              <p className={cn(hudLabelClass, 'px-5 pt-5')}>{t('blogPage.editor.contentLabel')}</p>
              <div
                className={cn(
                  'mt-3 border-t [&_.rc-md-editor]:border-0 [&_.rc-md-navigation]:border-slate-100 [&_.rc-md-navigation]:bg-slate-50 [&_.section-container]:!text-sm',
                  errors.content_markdown ? 'border-rose-200' : 'border-slate-100'
                )}
              >
                <MdEditor
                  style={{ height: 520 }}
                  renderHTML={(text) => mdParser.render(text)}
                  value={values.content_markdown ?? ''}
                  onChange={({ text }) => set('content_markdown', text)}
                  onImageUpload={uploadEditorImage}
                  placeholder={t('blogPage.editor.contentPlaceholder')}
                />
              </div>
              {errors.content_markdown?.message && (
                <div className='px-5 py-3'>
                  <FieldMessage tone='error'>{t(errors.content_markdown.message)}</FieldMessage>
                </div>
              )}
            </div>
          </div>

          <div className={panelClass}>
            <div className={panelBodyClass}>
              <div className='flex items-center justify-between gap-3'>
                <label htmlFor={`${ids}-excerpt`} className={hudLabelClass}>{t('blogPage.editor.excerptLabel')}</label>
                <span
                  className={cn(
                    'font-display text-[10px] font-semibold tabular-nums tracking-[0.1em]',
                    (values.excerpt?.length ?? 0) > EXCERPT_MAX_LENGTH - 15 ? 'text-amber-600' : 'text-slate-400'
                  )}
                >
                  {values.excerpt?.length ?? 0}/{EXCERPT_MAX_LENGTH}
                </span>
              </div>
              <Textarea
                id={`${ids}-excerpt`}
                rows={3}
                maxLength={EXCERPT_MAX_LENGTH}
                placeholder={t('blogPage.editor.excerptPlaceholder')}
                aria-invalid={!!errors.excerpt}
                className='resize-none rounded-md border-slate-200 bg-slate-50 text-sm focus-visible:bg-white'
                {...register('excerpt')}
              />
              {errors.excerpt?.message ? (
                <FieldMessage tone='error'>{t(errors.excerpt.message)}</FieldMessage>
              ) : (
                <p className='text-xs text-slate-500'>{t('blogPage.editor.excerptHint')}</p>
              )}
            </div>
          </div>
        </div>

        <aside className='space-y-5 lg:sticky lg:top-20'>
          <div className={panelClass}>
            <div className={panelBodyClass}>
              <p className={hudLabelClass}>{t('blogPage.editor.statusLabel')}</p>
              <div role='radiogroup' aria-label={t('blogPage.editor.statusLabel')} className='grid grid-cols-2 gap-2'>
                {statusOptions.map(({ value, icon: Icon }) => {
                  const selected = values.status === value
                  return (
                    <button
                      key={value}
                      type='button'
                      role='radio'
                      aria-checked={selected}
                      onClick={() => set('status', value)}
                      className={cn(
                        'flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40',
                        selected
                          ? value === 'published'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-300'
                            : 'bg-amber-50 text-amber-700 ring-amber-300'
                          : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50'
                      )}
                    >
                      <Icon className='size-4' aria-hidden />
                      {t(`blogPage.status.${value}`)}
                    </button>
                  )
                })}
              </div>
              <p className='text-xs leading-relaxed text-slate-500'>{t(`blogPage.editor.statusHint.${values.status}`)}</p>
              {blog?.published_at && (
                <p className='text-xs text-slate-500'>
                  {t('blogPage.editor.publishedAt', { date: formatBackendDateTime(blog.published_at, 'dd MMM yyyy, HH:mm') })}
                </p>
              )}
              {missing.length > 0 && (
                <AuthAlert>
                  {t('blogPage.editor.missing', {
                    fields: missing.map((key) => t(`blogPage.editor.fieldNames.${key}`)).join(', '),
                  })}
                </AuthAlert>
              )}
              <div className='space-y-2 border-t border-slate-100 pt-4'>
                <AuthSubmitButton pending={save.isPending} pendingLabel={t('blogPage.editor.saving')} cooldown={0} disabled={uploading}>
                  {blog
                    ? t('blogPage.editor.save')
                    : values.status === 'published'
                      ? t('blogPage.editor.publish')
                      : t('blogPage.editor.saveDraft')}
                </AuthSubmitButton>
                {blog && isDirty && (
                  <button
                    type='button'
                    onClick={() => reset()}
                    className='inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900'
                  >
                    <Undo2 className='size-3.5' aria-hidden />
                    {t('blogPage.editor.discard')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={panelClass}>
            <div className={panelBodyClass}>
              <p id={`${ids}-thumb`} className={hudLabelClass}>{t('blogPage.editor.thumbnailLabel')}</p>
              <ImageDropzone
                value={values.thumbnail ?? ''}
                onChange={(url) => set('thumbnail', url)}
                onUploadingChange={setUploading}
                aspectClassName='aspect-video'
                labelledBy={`${ids}-thumb`}
                hint={t('imageDropzone.hints.blogThumbnail')}
                error={errors.thumbnail?.message && t(errors.thumbnail.message)}
              />
            </div>
          </div>

          <div className={panelClass}>
            <div className={panelBodyClass}>
              <label htmlFor={`${ids}-category`} className={hudLabelClass}>{t('blogPage.editor.categoryLabel')}</label>
              <CategoryPicker
                id={`${ids}-category`}
                value={values.category ?? ''}
                games={games}
                onChange={(name) => set('category', name)}
                invalid={!!errors.category}
              />
              {errors.category?.message && <FieldMessage tone='error'>{t(errors.category.message)}</FieldMessage>}

              <label htmlFor={`${ids}-tags`} className={cn(hudLabelClass, 'block pt-2')}>{t('blogPage.editor.tagsLabel')}</label>
              <TagsInput
                id={`${ids}-tags`}
                value={values.tags ?? []}
                suggestions={games.map((g) => g.name)}
                onChange={(tags) => set('tags', tags)}
              />
            </div>
          </div>
        </aside>
      </div>

      <DangerDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        icon={FileText}
        eyebrow={t('blogPage.leaveConfirm.eyebrow')}
        title={t('blogPage.leaveConfirm.title')}
        description={t('blogPage.leaveConfirm.description')}
        confirmLabel={t('blogPage.leaveConfirm.confirm')}
        cancelLabel={t('blogPage.leaveConfirm.cancel')}
        pending={false}
        onConfirm={onClose}
      />
    </form>
  )
}
