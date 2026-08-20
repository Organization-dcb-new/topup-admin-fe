import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { UploadCloud } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { BannerImageState } from './useBannerImage'

export function BannerImageField({
  image,
  labelKey = 'createBannerModal.imageLabel',
  hintKey = 'createBannerModal.imageHint',
  ariaKey = 'createBannerModal.uploadAria',
}: {
  image: BannerImageState
  labelKey?: string
  hintKey?: string
  ariaKey?: string
}) {
  const { t } = useTranslation('common')
  const inputRef = useRef<HTMLInputElement>(null)
  const { preview, isUploading, progress, error } = image

  return (
    <div className='space-y-2'>
      <p className='text-[11px] font-black uppercase tracking-[0.14em]'>
        {t(labelKey)}
      </p>
      <p className='text-xs font-bold text-[#111]/70'>{t(hintKey)}</p>

      <button
        type='button'
        aria-label={t(ariaKey)}
        aria-busy={isUploading}
        aria-invalid={!!error}
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) image.selectFile(file)
        }}
        className={cn(
          'nb-frame nb-frame-thick nb-sd-sm nb-drop group relative flex min-h-[11rem] w-full cursor-pointer flex-col items-center justify-center bg-[#f5f1e8] px-4 py-6 outline-none disabled:cursor-not-allowed',
          error && 'nb-invalid',
        )}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt={t('createBannerModal.previewAlt')}
              className='max-h-44 w-full object-contain'
            />
            {!isUploading && (
              <span className='pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:bg-[#111]/45 group-hover:opacity-100'>
                <span className='nb-frame nb-frame-thin bg-[#ffd84d] px-3 py-1.5 text-xs font-black uppercase tracking-wide'>
                  {t('createBannerModal.changeImage')}
                </span>
              </span>
            )}
          </>
        ) : (
          <span className='flex flex-col items-center gap-2 text-center'>
            <span className='nb-frame nb-frame-thin nb-sd-sm flex h-12 w-12 items-center justify-center bg-[#6fe3f5]'>
              <UploadCloud className='h-6 w-6' strokeWidth={2.5} aria-hidden />
            </span>
            <span className='text-sm font-black uppercase tracking-tight'>
              {t('createBannerModal.uploadTitle')}
            </span>
            <span className='max-w-[16rem] text-xs font-bold leading-relaxed text-[#111]/55'>
              {t('createBannerModal.uploadDropHint')}
            </span>
          </span>
        )}

        {isUploading && (
          <span className='absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f5f1e8]/95'>
            <span className='text-xs font-black uppercase tracking-[0.12em]'>
              {t('createBannerModal.uploading', { percent: progress })}
            </span>
            <Progress
              value={progress}
              className='nb-frame nb-frame-thin h-3 w-[min(100%,12rem)] bg-white [&>div]:bg-[#c9f24d]'
            />
          </span>
        )}
      </button>

      {error && (
        <p className='text-[11px] font-black uppercase tracking-wide text-[#ff4d3d]' role='alert'>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type='file'
        accept='image/*,.svg'
        className='hidden'
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) image.selectFile(file)
          // Direset supaya memilih berkas yang sama dua kali tetap memicu onChange.
          e.target.value = ''
        }}
      />
    </div>
  )
}
