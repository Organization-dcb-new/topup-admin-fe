import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw, UploadCloud } from 'lucide-react'

import { FieldMessage } from '@/components/Auth/AuthPanel'
import { getImageFileValidationError } from '@/helpers/validate'
import { uploadFile } from '@/hooks/useUpload'
import { cn } from '@/lib/utils'

type UploadError = 'invalidType' | 'tooLarge' | 'uploadFailed'

interface ImageDropzoneProps {
  /** URL of the image that is saved now. */
  value: string
  onChange: (url: string) => void
  onUploadingChange?: (uploading: boolean) => void
  /** Frame shape, e.g. `aspect-[16/7]` for banners or `aspect-square` for icons. */
  aspectClassName?: string
  fit?: 'cover' | 'contain'
  labelledBy: string
  hint?: string
  /** Validation message from the form, already translated. */
  error?: string
}

/** Click-or-drop image picker that uploads straight away and reports the stored URL. */
export function ImageDropzone({
  value,
  onChange,
  onUploadingChange,
  aspectClassName = 'aspect-video',
  fit = 'cover',
  labelledBy,
  hint,
  error,
}: ImageDropzoneProps) {
  const { t } = useTranslation('common')
  const fileInput = useRef<HTMLInputElement>(null)
  const objectUrl = useRef<string | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [uploadError, setUploadError] = useState<UploadError | null>(null)
  const preview = localPreview ?? (value || null)

  // Release the local preview when the picker goes away.
  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
  }, [])

  const setBusy = (busy: boolean) => {
    setUploading(busy)
    onUploadingChange?.(busy)
  }

  const clearLocalPreview = () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    objectUrl.current = null
    setLocalPreview(null)
  }

  const handleFile = async (file: File) => {
    const invalid = getImageFileValidationError(file)
    if (invalid) return setUploadError(invalid)
    setUploadError(null)
    clearLocalPreview()
    objectUrl.current = URL.createObjectURL(file)
    setLocalPreview(objectUrl.current)
    setBusy(true)
    setProgress(0)
    try {
      const res = await uploadFile(file, setProgress)
      onChange(res.data.url)
    } catch {
      setUploadError('uploadFailed')
      // Fall back to the image that is actually saved, if any.
      clearLocalPreview()
    } finally {
      setBusy(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const message = uploadError ? t(`imageDropzone.errors.${uploadError}`) : error
  const hintId = `${labelledBy}-hint`

  return (
    <div className='space-y-2'>
      <button
        type='button'
        aria-labelledby={labelledBy}
        aria-describedby={hint ? hintId : undefined}
        aria-invalid={!!message}
        disabled={uploading}
        onClick={() => fileInput.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files[0]
          if (file) void handleFile(file)
        }}
        className={cn(
          'group relative block w-full overflow-hidden rounded-lg border-2 border-dashed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40',
          aspectClassName,
          dragging
            ? 'border-brand-purple bg-brand-purple/[0.06]'
            : message
              ? 'border-rose-300 bg-rose-50/40'
              : 'border-slate-300 bg-slate-50 hover:border-brand-purple/50',
          preview && !dragging && !message && 'border-solid border-slate-200'
        )}
      >
        {preview ? (
          <>
            <img src={preview} alt='' className={cn('size-full', fit === 'cover' ? 'object-cover' : 'object-contain p-3')} />
            {!uploading && (
              <span className='absolute inset-0 grid place-items-center bg-slate-950/0 opacity-0 transition-all duration-300 group-hover:bg-slate-950/45 group-hover:opacity-100 group-focus-visible:bg-slate-950/45 group-focus-visible:opacity-100'>
                <span className='inline-flex items-center gap-2 bg-white px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-800 hud-clip-sm'>
                  <RefreshCw className='size-3.5' aria-hidden />
                  {t('imageDropzone.replace')}
                </span>
              </span>
            )}
          </>
        ) : (
          <span className='flex size-full flex-col items-center justify-center gap-2 px-4 text-center'>
            <span className='grid size-11 place-items-center bg-white text-brand-purple shadow-sm ring-1 ring-slate-200 hud-clip-sm'>
              <UploadCloud className='size-5' aria-hidden />
            </span>
            <span className='text-sm font-medium text-slate-800'>
              {dragging ? t('imageDropzone.dropNow') : t('imageDropzone.title')}
            </span>
            <span className='text-xs text-slate-500'>{t('imageDropzone.formats')}</span>
          </span>
        )}

        {uploading && (
          <span className='absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 backdrop-blur-[2px]'>
            <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-700'>
              {t('imageDropzone.uploading', { percent: progress })}
            </span>
            <span className='h-1.5 w-48 max-w-[70%] overflow-hidden rounded-full bg-slate-200'>
              <span
                className='block h-full rounded-full bg-linear-to-r from-brand-purple to-brand-cyan transition-[width] duration-300'
                style={{ width: `${progress}%` }}
              />
            </span>
          </span>
        )}
      </button>
      <input
        ref={fileInput}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />
      {message ? (
        <FieldMessage tone='error'>{message}</FieldMessage>
      ) : (
        hint && <p id={hintId} className='text-xs text-slate-500'>{hint}</p>
      )}
    </div>
  )
}
