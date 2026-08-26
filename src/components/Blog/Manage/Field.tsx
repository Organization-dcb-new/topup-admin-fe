import MarkdownIt from 'markdown-it'
import { useId, useMemo } from 'react'
import type { RefObject } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import MdEditor from 'react-markdown-editor-lite'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FieldProps {
  titleField: UseFormRegisterReturn<'title'>
  titleValue: string
  titleError?: string
  content: string
  contentError?: string
  onContentChange: (value: string) => void
  handleEditorImageUpload: (file: File) => Promise<string>
  /** Slug yang sedang dipakai artikel; kosong berarti artikel baru. */
  currentSlug?: string
  /** Backend mengunci slug artikel yang pernah tayang, jadi judul boleh diperbaiki tanpa memutus permalink. */
  isSlugLocked?: boolean
  /** Dipakai pemanggil untuk menyorot blok editor saat submit gagal karena konten kosong. */
  contentSectionRef?: RefObject<HTMLDivElement | null>
}

const mdParser = new MarkdownIt()

/**
 * Cerminan `helpers.GenerateSlug` di backend: lowercase, trim, spasi jadi tanda
 * hubung, buang selain [a-z0-9-], lalu rapatkan tanda hubung ganda. Sengaja
 * tidak memakai `slugify` — charmap-nya mentransliterasi aksen (é → e)
 * sedangkan backend membuangnya, jadi pratinjaunya akan berbohong.
 */
const toSlugPreview = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/ /g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/-{2,}/g, '-')

export default function Field({
  titleField,
  titleValue,
  titleError,
  content,
  contentError,
  onContentChange,
  handleEditorImageUpload,
  currentSlug,
  isSlugLocked = false,
  contentSectionRef,
}: FieldProps) {
  const { t } = useTranslation('common')
  const titleId = useId()
  const titleErrorId = useId()
  const slugHintId = useId()
  const contentErrorId = useId()

  const slugPreview = useMemo(() => toSlugPreview(titleValue), [titleValue])
  const shownSlug = isSlugLocked ? (currentSlug ?? '') : slugPreview
  const willSlugChange = !isSlugLocked && !!currentSlug && !!slugPreview && slugPreview !== currentSlug

  return (
    <div className='space-y-4'>
      <div className='space-y-1.5'>
        <Label htmlFor={titleId} className='sr-only'>
          {t('blogField.titleAria')}
        </Label>
        <input
          id={titleId}
          type='text'
          className={cn(
            'w-full rounded-md border-0 bg-transparent px-1 py-1 text-2xl font-bold tracking-tight',
            'placeholder:text-muted-foreground/40',
            'transition-shadow duration-200 ease-out motion-reduce:transition-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            titleError && 'ring-2 ring-destructive/50',
          )}
          placeholder={t('blogField.titlePlaceholder')}
          aria-invalid={!!titleError}
          aria-describedby={titleError ? `${titleErrorId} ${slugHintId}` : slugHintId}
          {...titleField}
        />

        {titleError && (
          <p id={titleErrorId} role='alert' className='px-1 text-xs font-medium text-destructive'>
            {titleError}
          </p>
        )}

        <p id={slugHintId} className='px-1 text-xs text-muted-foreground'>
          {shownSlug ? (
            <>
              {t('blogField.slugPreviewLabel')}{' '}
              <span className='font-mono italic text-foreground/80'>/{shownSlug}</span>
            </>
          ) : (
            t('blogField.slugPreviewEmpty')
          )}
        </p>

        {isSlugLocked && (
          <p className='px-1 text-xs text-muted-foreground'>
            {t('blogField.slugLocked', { slug: currentSlug })}
          </p>
        )}

        {willSlugChange && (
          <p className='px-1 text-xs font-medium text-warning'>
            {t('blogField.slugWillChange', { from: currentSlug, to: slugPreview })}
          </p>
        )}
      </div>

      <div
        ref={contentSectionRef}
        tabIndex={-1}
        className={cn(
          'scroll-mt-24 overflow-hidden rounded-xl border bg-card shadow-sm outline-none ring-1 ring-gray-900/5',
          'focus:ring-2 focus:ring-ring/50',
          // Tinggi dikendalikan kelas, bukan `style` inline: nilai inline
          // menimpa breakpoint dan membuat editor 550px membelah diri jadi dua
          // pane sempit di ponsel.
          '[&_.rc-md-editor]:h-[60vh] [&_.rc-md-editor]:min-h-[320px] sm:[&_.rc-md-editor]:min-h-[480px]',
          // Pane pratinjau disembunyikan lewat kelas; prop `config` hanya
          // dievaluasi sekali sehingga tidak pernah mengikuti breakpoint.
          '[&_.sec-html]:hidden sm:[&_.sec-html]:block',
          contentError ? 'border-destructive/60' : 'border-border/80',
        )}
      >
        <MdEditor
          renderHTML={(text) => mdParser.render(text)}
          value={content}
          onChange={({ text }) => onContentChange(text)}
          onImageUpload={handleEditorImageUpload}
          placeholder={t('blogField.editorPlaceholder')}
        />
      </div>

      {contentError && (
        <p id={contentErrorId} role='alert' className='px-1 text-xs font-medium text-destructive'>
          {contentError}
        </p>
      )}
    </div>
  )
}
