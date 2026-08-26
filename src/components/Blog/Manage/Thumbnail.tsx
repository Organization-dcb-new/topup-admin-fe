import { useTranslation } from 'react-i18next'

import { ImageDropzone } from '@/components/ui/image-dropzone'

interface ThumbnailProps {
  value: string
  onChange: (url: string) => void
  /** Disambungkan ke tombol simpan supaya PATCH tidak balapan dengan unggahan. */
  onUploadingChange: (uploading: boolean) => void
  error?: string
  disabled?: boolean
}

/**
 * Uploader bespoke sebelumnya tidak memvalidasi berkas, memakai bar progres
 * palsu, dan tidak punya cara mengosongkan thumbnail. Semua itu sudah ada di
 * `ImageDropzone` bersama, termasuk drag&drop dan akses keyboard.
 */
export default function Thumbnail({
  value,
  onChange,
  onUploadingChange,
  error,
  disabled = false,
}: ThumbnailProps) {
  const { t } = useTranslation('common')

  return (
    <div className='space-y-2 rounded-xl border border-border/80 bg-card p-4 shadow-sm ring-1 ring-gray-900/5'>
      <ImageDropzone
        value={value}
        onChange={onChange}
        onUploadingChange={onUploadingChange}
        error={error}
        disabled={disabled}
        label={t('blogThumbnail.label')}
      />
      <p className='text-xs text-muted-foreground'>{t('blogThumbnail.sizeHint')}</p>
    </div>
  )
}
