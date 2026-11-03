import { useEffect, useId, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { ImagePlus, Link2, RefreshCw, UploadCloud } from 'lucide-react'

import { AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudInputIconClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getImageFileValidationError } from '@/helpers/validate'
import { useCreateBanner, useUpdateBanner } from '@/hooks/useBanner'
import { uploadFile } from '@/hooks/useUpload'
import { cn } from '@/lib/utils'
import { bannerSchema, type BannerFormValues } from '@/schemas/banner'
import type { Banner } from '@/types/banner'
import { LINK_KIND_META, linkKind } from './banner-link'

interface BannerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Edit this banner; leave out to add one. */
  banner?: Banner
}

export function BannerFormDialog({ open, onOpenChange, banner }: BannerFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-xl'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {/* Mounted per opening, so a half-finished upload never leaks into the next one. */}
        {open && <BannerForm banner={banner} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

type UploadError = 'invalidType' | 'tooLarge' | 'uploadFailed'

function BannerForm({ banner, onDone }: { banner?: Banner; onDone: () => void }) {
  const { t } = useTranslation()
  const ids = useId()
  const create = useCreateBanner(onDone)
  const update = useUpdateBanner(onDone)
  const pending = create.isPending || update.isPending

  const fileInput = useRef<HTMLInputElement>(null)
  const objectUrl = useRef<string | null>(null)
  const [preview, setPreview] = useState<string | null>(banner?.image ?? null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [uploadError, setUploadError] = useState<UploadError | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitted },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: { image: banner?.image ?? '', redirect_link: banner?.redirect_link ?? '' },
  })
  const [image, link] = useWatch({ control, name: ['image', 'redirect_link'] })
  const kind = linkKind(link)
  const KindIcon = LINK_KIND_META[kind].icon

  // Release the local preview when the form closes.
  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
  }, [])

  const showLocalPreview = (file: File) => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    objectUrl.current = URL.createObjectURL(file)
    setPreview(objectUrl.current)
  }

  const handleFile = async (file: File) => {
    const invalid = getImageFileValidationError(file)
    if (invalid) return setUploadError(invalid)
    setUploadError(null)
    showLocalPreview(file)
    setUploading(true)
    setProgress(0)
    try {
      const res = await uploadFile(file, setProgress)
      setValue('image', res.data.url, { shouldDirty: true, shouldValidate: isSubmitted })
    } catch {
      setUploadError('uploadFailed')
      // Fall back to the image that is actually saved, if any.
      setPreview(image || null)
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const onSubmit = (values: BannerFormValues) => {
    if (banner) update.mutate({ id: banner.id, payload: values })
    else create.mutate(values)
  }

  const imageError = uploadError ? `bannerPage.form.errors.${uploadError}` : errors.image?.message

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <ImagePlus className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>
            {banner ? t('bannerPage.form.editEyebrow') : t('bannerPage.form.addEyebrow')}
          </p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {banner ? t('bannerPage.form.editTitle') : t('bannerPage.form.addTitle')}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>
            {t('bannerPage.form.description')}
          </DialogDescription>
        </div>
      </div>

      <div className='space-y-2'>
        <p id={`${ids}-image`} className={hudLabelClass}>{t('bannerPage.form.imageLabel')}</p>
        <button
          type='button'
          aria-labelledby={`${ids}-image`}
          aria-describedby={`${ids}-image-hint`}
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
            'group relative block aspect-[16/7] w-full overflow-hidden rounded-lg border-2 border-dashed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40',
            dragging
              ? 'border-brand-purple bg-brand-purple/[0.06]'
              : imageError
                ? 'border-rose-300 bg-rose-50/40'
                : 'border-slate-300 bg-slate-50 hover:border-brand-purple/50',
            preview && !dragging && 'border-solid border-slate-200'
          )}
        >
          {preview ? (
            <>
              <img src={preview} alt='' className='size-full object-cover' />
              {!uploading && (
                <span className='absolute inset-0 grid place-items-center bg-slate-950/0 opacity-0 transition-all duration-300 group-hover:bg-slate-950/45 group-hover:opacity-100 group-focus-visible:bg-slate-950/45 group-focus-visible:opacity-100'>
                  <span className='inline-flex items-center gap-2 bg-white px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-800 hud-clip-sm'>
                    <RefreshCw className='size-3.5' aria-hidden />
                    {t('bannerPage.form.replaceImage')}
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
                {dragging ? t('bannerPage.form.dropNow') : t('bannerPage.form.uploadTitle')}
              </span>
              <span className='text-xs text-slate-500'>{t('bannerPage.form.uploadHint')}</span>
            </span>
          )}

          {uploading && (
            <span className='absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 backdrop-blur-[2px]'>
              <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-700'>
                {t('bannerPage.form.uploading', { percent: progress })}
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
        {imageError ? (
          <FieldMessage tone='error'>{t(imageError)}</FieldMessage>
        ) : (
          <p id={`${ids}-image-hint`} className='text-xs text-slate-500'>{t('bannerPage.form.imageHint')}</p>
        )}
      </div>

      <div className='space-y-2'>
        <div className='flex items-center justify-between gap-3'>
          <Label htmlFor={`${ids}-link`} className={hudLabelClass}>
            {t('bannerPage.form.linkLabel')}
          </Label>
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] transition-colors duration-300 hud-clip-sm',
              LINK_KIND_META[kind].chip
            )}
          >
            <KindIcon className='size-3' aria-hidden />
            {t(`bannerPage.linkKind.${kind}`)}
          </span>
        </div>
        <div className='relative'>
          <Link2 className={hudInputIconClass} aria-hidden />
          <Input
            id={`${ids}-link`}
            inputMode='url'
            autoComplete='off'
            spellCheck={false}
            placeholder={t('bannerPage.form.linkPlaceholder')}
            aria-invalid={!!errors.redirect_link}
            aria-describedby={`${ids}-link-hint`}
            className={cn(hudInputClass, 'pl-11')}
            {...register('redirect_link')}
          />
        </div>
        {errors.redirect_link?.message ? (
          <FieldMessage tone='error'>{t(errors.redirect_link.message)}</FieldMessage>
        ) : (
          <p id={`${ids}-link-hint`} className='text-xs leading-relaxed text-slate-500'>{t('bannerPage.form.linkHint')}</p>
        )}
      </div>

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onDone}
          disabled={pending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('bannerPage.form.cancel')}
        </button>
        <div className='sm:w-52'>
          <AuthSubmitButton
            pending={pending}
            pendingLabel={t('bannerPage.form.saving')}
            cooldown={0}
            disabled={uploading}
          >
            {banner ? t('bannerPage.form.save') : t('bannerPage.form.create')}
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  )
}
