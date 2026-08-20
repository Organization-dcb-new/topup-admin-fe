import { FallbackImage } from '@/components/ui/fallback-image'
import { cn } from '@/lib/utils'
import type { BlogFormValues } from '../types/blog'
import type { UseMutationResult } from '@tanstack/react-query'
import { Loader2, UploadCloud } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ThumbnailProps {
  formData: BlogFormValues
  uploadMutation: UseMutationResult<string, Error, File, unknown>
}

export default function Thumbnail({ formData, uploadMutation }: ThumbnailProps) {
  const { t } = useTranslation('common')
  const isUploading = uploadMutation.isPending

  return (
    <div className='nb-frame nb-frame-thick nb-sd bg-white p-4'>
      <div className='mb-3 flex items-center justify-between gap-2'>
        <p className='text-[11px] font-black uppercase tracking-[0.14em]'>
          {t('blogThumbnail.label')}
        </p>
        {formData.thumbnail && !isUploading && (
          <span className='nb-frame nb-frame-thin bg-[#6fe3f5] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider'>
            {t('blogThumbnail.ratioBadge')}
          </span>
        )}
      </div>

      <div
        className={cn(
          'nb-frame nb-frame-thick nb-sd-sm nb-drop relative flex aspect-video items-center justify-center overflow-hidden bg-[#f5f1e8]',
          isUploading && 'pointer-events-none',
        )}
      >
        {formData.thumbnail ? (
          <FallbackImage
            src={formData.thumbnail}
            alt={t('blogThumbnail.previewAlt')}
            label={t('blogTable.noImage')}
            className={cn(
              'h-full w-full object-cover transition-opacity duration-300',
              isUploading && 'opacity-40',
            )}
          />
        ) : (
          <div className='px-4 text-center'>
            <span className='nb-frame nb-frame-thin nb-sd-sm mx-auto mb-2 flex h-11 w-11 items-center justify-center bg-[#6fe3f5]'>
              <UploadCloud className='h-5 w-5' strokeWidth={2.5} aria-hidden />
            </span>
            <p className='text-[11px] font-black uppercase tracking-wide'>
              {isUploading ? t('blogThumbnail.uploading') : t('blogThumbnail.uploadHint')}
            </p>
          </div>
        )}

        {isUploading && (
          <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f5f1e8]/95'>
            <Loader2 className='h-7 w-7 animate-spin' strokeWidth={3} aria-hidden />
            <span className='text-[11px] font-black uppercase tracking-[0.12em]'>
              {t('blogThumbnail.uploading')}
            </span>
          </div>
        )}

        <input
          type='file'
          accept='image/*'
          disabled={isUploading}
          className={cn(
            'absolute inset-0 cursor-pointer opacity-0',
            isUploading && 'cursor-not-allowed',
          )}
          aria-label={t('blogThumbnail.uploadAria')}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadMutation.mutate(file)
            // Direset supaya memilih berkas yang sama dua kali tetap memicu onChange.
            e.target.value = ''
          }}
        />
      </div>

      <p className='mt-2 text-center text-[10px] font-bold text-[#111]/55'>
        {t('blogThumbnail.sizeHint')}
      </p>
    </div>
  )
}
