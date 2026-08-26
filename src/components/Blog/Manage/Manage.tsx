import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { FieldErrors } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import 'react-markdown-editor-lite/lib/index.css'

import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { EXCERPT_MAX_LENGTH, blogSchema } from '@/schemas/blog'

import { BlogStatusBadge } from '../BlogStatusBadge'
import { useBlogMutations, useGetBlogById, useGetBlogTaxonomy } from '../hooks/useBlog'
import type { Blog, BlogDetail, BlogFormValues, BlogStatus } from '../types/blog'
import ButtonManage from './Button'
import Category from './Category'
import Field from './Field'
import Thumbnail from './Thumbnail'

/** Baris daftar yang diklik admin; nilai lengkapnya diambil ulang lewat `GET /blogs/admin/:id`. */
export type BlogManageInitialData = Blog

interface ManageProps {
  setView: (view: 'list' | 'create' | 'edit') => void
  initialData?: BlogManageInitialData | null
  isEdit?: boolean
  /** Dipanggil tiap kali status "ada perubahan belum tersimpan" berubah. Bungkus dengan `useCallback`. */
  onDirtyChange?: (dirty: boolean) => void
}

const EMPTY_FORM: BlogFormValues = {
  title: '',
  category: '',
  content_markdown: '',
  excerpt: '',
  tags: [],
  thumbnail: '',
  status: 'draft',
}

const toFormValues = (source: Blog | BlogDetail | null): BlogFormValues => {
  if (!source) return EMPTY_FORM
  return {
    title: source.title ?? '',
    category: source.category ?? '',
    content_markdown: 'content_markdown' in source ? (source.content_markdown ?? '') : '',
    excerpt: source.excerpt ?? '',
    tags: source.tags ?? [],
    thumbnail: source.thumbnail ?? '',
    status: source.status ?? 'draft',
  }
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const focusSection = (section: RefObject<HTMLDivElement | null>) => {
  const node = section.current
  if (!node) return
  node.focus({ preventScroll: true })
  node.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

export default function ManageBlog({
  setView,
  initialData,
  isEdit = false,
  onDirtyChange,
}: ManageProps) {
  const blogId = isEdit ? initialData?.id : undefined
  const { data: detail, isLoading } = useGetBlogById(blogId)

  // Payload daftar sudah tidak membawa `content_markdown`, jadi form edit tidak
  // boleh dirender sebelum detail tiba — editor kosong yang tiba-tiba terisi
  // adalah cara paling mudah kehilangan tulisan.
  if (blogId && isLoading && !detail) return <ManageBlogSkeleton />

  return (
    <ManageBlogForm
      key={blogId ?? 'new'}
      blogId={blogId}
      source={detail ?? initialData ?? null}
      isEdit={isEdit}
      setView={setView}
      onDirtyChange={onDirtyChange}
    />
  )
}

function ManageBlogSkeleton() {
  return (
    <div aria-busy className='grid grid-cols-1 gap-8 lg:grid-cols-4'>
      <div className='space-y-6 lg:col-span-3'>
        <Skeleton className='h-10 w-2/3' />
        <Skeleton className='h-[60vh] min-h-80 w-full rounded-xl' />
      </div>
      <div className='space-y-6'>
        <Skeleton className='h-48 w-full rounded-xl' />
        <Skeleton className='h-56 w-full rounded-xl' />
      </div>
    </div>
  )
}

interface ManageBlogFormProps {
  blogId?: string
  source: Blog | BlogDetail | null
  isEdit: boolean
  setView: (view: 'list' | 'create' | 'edit') => void
  onDirtyChange?: (dirty: boolean) => void
}

function ManageBlogForm({ blogId, source, isEdit, setView, onDirtyChange }: ManageBlogFormProps) {
  const { t } = useTranslation('common')
  const excerptId = useId()
  const excerptHintId = useId()
  const excerptCounterId = useId()
  const excerptErrorId = useId()
  const contentSectionRef = useRef<HTMLDivElement>(null)
  const categorySectionRef = useRef<HTMLDivElement>(null)
  const thumbnailSectionRef = useRef<HTMLDivElement>(null)
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    setFocus,
    watch,
    formState: { errors, isDirty },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: toFormValues(source),
  })

  const values = watch()

  const {
    submit,
    isSubmitting,
    uploadInlineImage,
    isUploading: isInlineUploading,
    isSlugConflict,
  } = useBlogMutations({
    blogId,
    onSuccess: (blog) => {
      // Setelah simpan, nilai server jadi baseline baru: `isDirty` kembali
      // false sehingga penjaga `beforeunload` ikut padam.
      if (isEdit) {
        reset(toFormValues(blog))
        return
      }
      setView('list')
    },
  })

  const { data: taxonomy } = useGetBlogTaxonomy()

  // Cleanup mengabarkan `false` saat form dilepas, supaya pemanggil tidak
  // tertinggal menyangka masih ada perubahan yang belum tersimpan.
  useEffect(() => {
    onDirtyChange?.(isDirty)
    return () => onDirtyChange?.(false)
  }, [isDirty, onDirtyChange])

  useEffect(() => {
    if (!isDirty) return
    const warnOnLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnOnLeave)
    return () => window.removeEventListener('beforeunload', warnOnLeave)
  }, [isDirty])

  // 409 dari backend berarti judul menghasilkan slug yang sudah dipakai —
  // itu milik field judul, bukan pesan melayang di sudut layar.
  useEffect(() => {
    if (!isSlugConflict) return
    setError('title', { type: 'server', message: t('blogForm.errors.slugTaken') })
    setFocus('title')
  }, [isSlugConflict, setError, setFocus, t])

  const handleContentChange = useCallback(
    (markdown: string) => {
      setValue('content_markdown', markdown, { shouldDirty: true, shouldValidate: true })
    },
    [setValue],
  )

  const handleCategoryChange = useCallback(
    (category: string) => {
      setValue('category', category, { shouldDirty: true, shouldValidate: true })
    },
    [setValue],
  )

  const handleTagsChange = useCallback(
    (tags: string[]) => {
      setValue('tags', tags, { shouldDirty: true, shouldValidate: true })
    },
    [setValue],
  )

  const handleThumbnailChange = useCallback(
    (url: string) => {
      setValue('thumbnail', url, { shouldDirty: true, shouldValidate: true })
    },
    [setValue],
  )

  const handleStatusChange = useCallback(
    (status: BlogStatus) => {
      setValue('status', status, { shouldDirty: true, shouldValidate: true })
    },
    [setValue],
  )

  const handleEditorImageUpload = useCallback(
    (file: File) => uploadInlineImage(file),
    [uploadInlineImage],
  )

  const onSubmit = useCallback(
    (formValues: BlogFormValues) => {
      void submit(formValues)
    },
    [submit],
  )

  // Tombol simpan tidak lagi dimatikan diam-diam, jadi submit yang gagal
  // validasi wajib menunjukkan field mana yang bermasalah.
  const onInvalid = useCallback(
    (formErrors: FieldErrors<BlogFormValues>) => {
      if (formErrors.title) {
        setFocus('title')
        return
      }
      if (formErrors.content_markdown) {
        focusSection(contentSectionRef)
        return
      }
      if (formErrors.category || formErrors.tags) {
        focusSection(categorySectionRef)
        return
      }
      if (formErrors.excerpt) {
        setFocus('excerpt')
        return
      }
      if (formErrors.thumbnail) focusSection(thumbnailSectionRef)
    },
    [setFocus],
  )

  const excerptLength = values.excerpt.length
  const excerptDescribedBy = errors.excerpt
    ? `${excerptHintId} ${excerptCounterId} ${excerptErrorId}`
    : `${excerptHintId} ${excerptCounterId}`

  const isUploading = isInlineUploading || isThumbnailUploading

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      noValidate
      className='grid grid-cols-1 gap-8 lg:grid-cols-4'
    >
      <div className='space-y-6 lg:col-span-3'>
        <Field
          titleField={register('title')}
          titleValue={values.title}
          titleError={errors.title?.message}
          content={values.content_markdown}
          contentError={errors.content_markdown?.message}
          onContentChange={handleContentChange}
          handleEditorImageUpload={handleEditorImageUpload}
          currentSlug={source?.slug}
          isSlugLocked={isEdit && !!source?.published_at}
          contentSectionRef={contentSectionRef}
        />

        <div
          ref={categorySectionRef}
          tabIndex={-1}
          className='scroll-mt-24 rounded-xl outline-none focus:ring-2 focus:ring-ring/50'
        >
          <Category
            category={values.category}
            tags={values.tags}
            categoryOptions={taxonomy?.categories ?? []}
            tagOptions={taxonomy?.tags ?? []}
            onCategoryChange={handleCategoryChange}
            onTagsChange={handleTagsChange}
            categoryError={errors.category?.message}
            tagsError={errors.tags?.message}
          />
        </div>

        <div className='space-y-2 rounded-xl border border-border/80 bg-card p-4 shadow-sm ring-1 ring-gray-900/5 sm:p-5'>
          <div className='flex items-center justify-between gap-2'>
            <Label htmlFor={excerptId} className='text-xs font-semibold text-muted-foreground'>
              {t('blogManage.excerptLabel')}
            </Label>
            <span
              id={excerptCounterId}
              role='status'
              aria-live='polite'
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums',
                excerptLength >= EXCERPT_MAX_LENGTH
                  ? 'bg-destructive/15 text-destructive'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {excerptLength}/{EXCERPT_MAX_LENGTH}
            </span>
          </div>

          <Textarea
            id={excerptId}
            placeholder={t('blogManage.excerptPlaceholder')}
            maxLength={EXCERPT_MAX_LENGTH}
            rows={3}
            className='resize-none text-sm'
            aria-invalid={!!errors.excerpt}
            aria-describedby={excerptDescribedBy}
            {...register('excerpt')}
          />

          <p id={excerptHintId} className='text-xs text-muted-foreground'>
            {t('blogManage.excerptHint', { max: EXCERPT_MAX_LENGTH })}
          </p>

          {errors.excerpt?.message && (
            <p id={excerptErrorId} role='alert' className='text-xs font-medium text-destructive'>
              {errors.excerpt.message}
            </p>
          )}
        </div>
      </div>

      <div className='space-y-6'>
        {isEdit && (
          <div className='flex items-center justify-between gap-2 rounded-xl border border-border/80 bg-card p-4 shadow-sm ring-1 ring-gray-900/5'>
            <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              {t('blogManage.statusLabel')}
            </span>
            <BlogStatusBadge status={values.status} />
          </div>
        )}

        <ButtonManage
          isEdit={isEdit}
          isPending={isSubmitting}
          isUploading={isUploading}
          currentStatusValue={values.status}
          onStatusChange={handleStatusChange}
        />

        <div
          ref={thumbnailSectionRef}
          tabIndex={-1}
          className='scroll-mt-24 rounded-xl outline-none focus:ring-2 focus:ring-ring/50'
        >
          <Thumbnail
            value={values.thumbnail}
            onChange={handleThumbnailChange}
            onUploadingChange={setIsThumbnailUploading}
            error={errors.thumbnail?.message}
            disabled={isSubmitting}
          />
        </div>

        {isEdit && (
          <div className='rounded-xl border border-primary/20 bg-primary/5 p-4 ring-1 ring-gray-900/5'>
            <p className='text-xs leading-relaxed text-muted-foreground'>
              {t('blogManage.publishedChangesHint')}
            </p>
          </div>
        )}
      </div>
    </form>
  )
}
