import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Pencil } from 'lucide-react'

import { BannerImageField } from '@/components/Banner/BannerImageField'
import { useBannerImage } from '@/components/Banner/useBannerImage'
import type { Banner, BannerFormValues } from '@/types/banner'
import { useUpdateBanner } from '@/hooks/useBanner'
import { safeRedirectHref } from '@/lib/url'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export function UpdateBanner({
  banner,
  triggerClassName,
}: {
  banner: Banner
  triggerClassName?: string
}) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const image = useBannerImage(banner.image)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BannerFormValues>()

  const mutation = useUpdateBanner({ id: banner.id, setOpen })

  const onSubmit = async (values: BannerFormValues) => {
    const imageUrl = await image.upload()
    if (!imageUrl) return
    mutation.mutate({ ...values, image: imageUrl })
  }

  const isBusy = image.isUploading || mutation.isPending

  return (
    <>
      <button
        type='button'
        onClick={() => {
          reset({ redirect_link: banner.redirect_link })
          image.reset(banner.image || null)
          setOpen(true)
        }}
        className={cn(
          'nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-8 cursor-pointer items-center gap-1.5 px-2 text-[10px] font-black uppercase tracking-[0.12em]',
          triggerClassName,
        )}
        aria-label={t('editBannerModal.triggerAria')}
      >
        <Pencil className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
        <span className='hidden sm:inline'>{t('editBannerModal.triggerShort')}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className='nb nb-frame nb-frame-thick nb-sd-lg gap-0 overflow-hidden bg-white p-0 sm:max-w-lg'
          showCloseButton={false}
        >
          <div className='border-b-4 border-[#111] bg-[#ffd84d] px-5 py-4'>
            <DialogHeader className='gap-2 text-left'>
              <div className='flex items-center gap-2.5'>
                <span className='nb-frame nb-frame-thin flex h-9 w-9 shrink-0 items-center justify-center bg-white'>
                  <Pencil className='h-4 w-4' strokeWidth={3} aria-hidden />
                </span>
                <DialogTitle className='text-xl font-black uppercase leading-none tracking-tight'>
                  {t('editBannerModal.title')}
                </DialogTitle>
              </div>
              <DialogDescription className='text-xs font-bold text-[#111]/70'>
                {t('editBannerModal.description')}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5 px-5 py-5'>
            <div className='space-y-2'>
              <Label
                htmlFor='edit-banner-redirect-link'
                className='text-[11px] font-black uppercase tracking-[0.14em]'
              >
                {t('createBannerModal.redirectLabel')}
              </Label>
              <div className='space-y-1.5'>
                <Input
                  id='edit-banner-redirect-link'
                  {...register('redirect_link', {
                    required: t('createBannerModal.redirectRequired'),
                    validate: (value) =>
                      !!safeRedirectHref(value) || t('createBannerModal.redirectInvalid'),
                  })}
                  placeholder='https://...'
                  inputMode='url'
                  autoComplete='url'
                  aria-invalid={!!errors.redirect_link}
                  className={cn(
                    'nb-field nb-frame nb-frame-thin nb-sd-sm h-11 bg-white text-sm font-bold placeholder:font-medium placeholder:text-[#111]/40',
                    errors.redirect_link && 'nb-invalid',
                  )}
                />
                {errors.redirect_link && (
                  <p
                    className='text-[11px] font-black uppercase tracking-wide text-[#ff4d3d]'
                    role='alert'
                  >
                    {errors.redirect_link.message}
                  </p>
                )}
              </div>
              <p className='text-xs font-bold text-[#111]/55'>
                {t('createBannerModal.redirectHint')}
              </p>
            </div>

            <BannerImageField image={image} />

            <DialogFooter className='gap-2 border-t-4 border-[#111] pt-5 sm:pt-5'>
              <button
                type='button'
                className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-11 cursor-pointer bg-white px-5 text-xs font-black uppercase tracking-[0.14em] sm:min-w-[5.5rem]'
                onClick={() => setOpen(false)}
              >
                {t('createBannerModal.cancel')}
              </button>
              <button
                type='submit'
                className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-11 cursor-pointer bg-[#ffd84d] px-5 text-xs font-black uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[5.5rem]'
                disabled={isBusy}
              >
                {isBusy ? t('createBannerModal.saving') : t('createBannerModal.save')}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
