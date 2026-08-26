import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageOff, Loader2, UploadCloud, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { uploadFile } from '@/hooks/useUpload'
import { getImageFileValidationError } from '@/helpers/validate'
import { cn } from '@/lib/utils'

interface ImageDropzoneProps {
  /** URL yang sudah tersimpan (mode edit) */
  value?: string
  onChange: (url: string) => void
  onUploadingChange?: (uploading: boolean) => void
  disabled?: boolean
  error?: string
  label: string
}

/**
 * Dropzone gambar bersama. Sebelumnya markup ini disalin di empat modal
 * pembayaran (dan belasan tempat lain) dengan tiga cacat yang sama:
 * hanya bisa diklik mouse, object URL tidak pernah dilepas, dan galat
 * validasi hanya muncul sebagai toast berbahasa Inggris.
 */
export function ImageDropzone({
  value,
  onChange,
  onUploadingChange,
  disabled,
  error,
  label,
}: ImageDropzoneProps) {
  const { t } = useTranslation('common')
  const inputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value ?? null)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const inputId = useId()
  const errorId = useId()

  // Object URL wajib dilepas; versi lama membuatnya tiap pilih berkas
  // dan tidak pernah memanggil revokeObjectURL
  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    },
    [],
  )

  const setBusy = (busy: boolean) => {
    setIsUploading(busy)
    onUploadingChange?.(busy)
  }

  const handleFile = async (file: File) => {
    const validation = getImageFileValidationError(file)
    if (validation) {
      setLocalError(t(`imageDropzone.${validation}`))
      return
    }
    setLocalError(null)
    setFailed(false)

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const localPreview = URL.createObjectURL(file)
    objectUrlRef.current = localPreview
    setPreview(localPreview)

    try {
      setBusy(true)
      setProgress(0)
      const res = await uploadFile(file, setProgress)
      onChange(res.data.url)
    } catch {
      setLocalError(t('imageDropzone.uploadFailed'))
      setPreview(value ?? null)
    } finally {
      setBusy(false)
    }
  }

  const openPicker = () => {
    if (disabled || isUploading) return
    inputRef.current?.click()
  }

  const clear = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setPreview(null)
    setFailed(false)
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const shownError = error ?? localError

  return (
    <div className='space-y-2'>
      <label htmlFor={inputId} className='text-sm font-medium text-foreground'>
        {label}
      </label>

      <div
        role='button'
        tabIndex={disabled || isUploading ? -1 : 0}
        aria-describedby={shownError ? errorId : undefined}
        aria-disabled={disabled || isUploading}
        onClick={openPicker}
        onKeyDown={(e) => {
          // Dropzone lama hanya bereaksi pada klik mouse
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openPicker()
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (disabled || isUploading) return
          const file = e.dataTransfer.files[0]
          if (file) void handleFile(file)
        }}
        className={cn(
          'group relative flex h-36 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/20 transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          !disabled && !isUploading && 'hover:border-primary hover:bg-muted/40',
          (disabled || isUploading) && 'cursor-not-allowed opacity-60',
          shownError && 'border-destructive/60',
        )}
      >
        {preview && !failed ? (
          <img
            src={preview}
            alt={label}
            className='h-full w-full object-contain'
            onError={() => setFailed(true)}
          />
        ) : (
          <div className='flex flex-col items-center gap-2 px-4 text-center text-muted-foreground'>
            {failed ? (
              <ImageOff className='h-6 w-6' aria-hidden />
            ) : (
              <UploadCloud className='h-6 w-6' aria-hidden />
            )}
            <span className='text-sm'>
              {failed ? t('imageDropzone.broken') : t('imageDropzone.hint')}
            </span>
          </div>
        )}

        {isUploading && (
          <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 bg-foreground/60 text-background'>
            <Loader2 className='h-5 w-5 animate-spin' aria-hidden />
            <span className='text-sm font-medium'>
              {t('imageDropzone.uploading', { percent: progress })}
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type='file'
        accept='image/*'
        className='sr-only'
        disabled={disabled || isUploading}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />

      {isUploading && <Progress value={progress} />}

      <div className='flex items-center justify-between gap-2'>
        <p className='text-xs text-muted-foreground'>{t('imageDropzone.limit')}</p>
        {preview && !isUploading && (
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={clear}
            disabled={disabled}
            className='h-7 gap-1 text-xs text-muted-foreground hover:text-destructive'
          >
            <X className='h-3 w-3' aria-hidden />
            {t('imageDropzone.remove')}
          </Button>
        )}
      </div>

      {shownError && (
        <p id={errorId} role='alert' className='text-xs font-medium text-destructive'>
          {shownError}
        </p>
      )}
    </div>
  )
}
