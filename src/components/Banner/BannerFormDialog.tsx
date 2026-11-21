import { useId, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { ImagePlus, Link2 } from 'lucide-react'

import { AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudInputIconClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateBanner, useUpdateBanner } from '@/hooks/useBanner'
import { useRetained } from '@/hooks/useRetained'
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
  const target = useRetained(open ? (banner ?? 'new') : null)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-xl'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {/* The retained target keeps the form filled while the dialog animates out; Radix unmounts it afterwards, so every opening still starts fresh. */}
        {target && <BannerForm key={target === 'new' ? 'new' : target.id} banner={target === 'new' ? undefined : target} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function BannerForm({ banner, onDone }: { banner?: Banner; onDone: () => void }) {
  const { t } = useTranslation()
  const ids = useId()
  const create = useCreateBanner(onDone)
  const update = useUpdateBanner(onDone)
  const pending = create.isPending || update.isPending

  const [uploading, setUploading] = useState(false)

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

  const onSubmit = (values: BannerFormValues) => {
    if (banner) update.mutate({ id: banner.id, payload: values })
    else create.mutate(values)
  }

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
        <ImageDropzone
          value={image}
          onChange={(url) => setValue('image', url, { shouldDirty: true, shouldValidate: isSubmitted })}
          onUploadingChange={setUploading}
          aspectClassName='aspect-[16/5]'
          labelledBy={`${ids}-image`}
          hint={t('imageDropzone.hints.banner')}
          error={errors.image?.message && t(errors.image.message)}
        />
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
        <div className='group relative'>
          <span className={hudInputIconClass} aria-hidden>
            <Link2 className='size-[18px]' />
          </span>
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
        <div className='sm:min-w-52'>
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
