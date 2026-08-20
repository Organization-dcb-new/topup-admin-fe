import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Clapperboard, Plus } from 'lucide-react'

import { BannerImageField } from '@/components/Banner/BannerImageField'
import { useBannerImage } from '@/components/Banner/useBannerImage'
import { useCreateShow } from '@/hooks/useShow'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export type FormValuesShow = {
  name: string
  alias: string
}

export type ShowPayload = {
  name: string
  alias: string
  image: string
}

const FIELD_CLASS =
  'nb-field nb-frame nb-frame-thin nb-sd-sm h-11 bg-white text-sm font-bold placeholder:font-medium placeholder:text-[#5f5f5f]'
const LABEL_CLASS = 'text-[11px] font-black uppercase tracking-[0.14em]'
const ERROR_CLASS = 'text-[11px] font-black uppercase tracking-wide text-[#8f1d10]'

export function CreateShowModal() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  /**
   * Berkas baru diunggah saat submit, bukan saat dipilih. Perilaku lama
   * mengunggah begitu berkas dipilih, jadi setiap kali modal dibatalkan
   * gambarnya sudah telanjur nyangkut di server tanpa acara yang memakainya.
   */
  const image = useBannerImage()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValuesShow>({
    defaultValues: { name: '', alias: '' },
  })

  const setDialogOpen = (value: boolean) => {
    if (!value) {
      reset({ name: '', alias: '' })
      image.reset()
    }
    setOpen(value)
  }

  const mutation = useCreateShow(() => setDialogOpen(false))

  const onSubmit = async (values: FormValuesShow) => {
    const url = await image.upload()
    if (!url) return
    mutation.mutate({ ...values, image: url })
  }

  const isBusy = image.isUploading || mutation.isPending

  return (
    <>
      <button
        type='button'
        className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-9 w-full cursor-pointer items-center justify-center gap-2 bg-[#c9f24d] px-3 text-xs font-black uppercase tracking-[0.12em] sm:w-auto'
        onClick={() => setDialogOpen(true)}
      >
        <Plus className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
        {t('createShowModal.trigger')}
      </button>

      <Dialog open={open} onOpenChange={setDialogOpen}>
        <DialogContent
          className='nb nb-frame nb-frame-thick nb-sd-lg max-h-[min(90vh,44rem)] gap-0 overflow-y-auto bg-white p-0 sm:max-w-lg'
          showCloseButton={false}
        >
          <div className='border-b-4 border-[#111] bg-[#6fe3f5] px-5 py-4'>
            <DialogHeader className='gap-2 text-left'>
              <div className='flex items-center gap-2.5'>
                <span className='nb-frame nb-frame-thin flex h-9 w-9 shrink-0 items-center justify-center bg-white'>
                  <Clapperboard className='h-4 w-4' strokeWidth={3} aria-hidden />
                </span>
                <DialogTitle className='text-xl font-black uppercase leading-none tracking-tight'>
                  {t('createShowModal.title')}
                </DialogTitle>
              </div>
              <DialogDescription className='text-xs font-bold text-[#111]/80'>
                {t('createShowModal.description')}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5 px-5 py-5'>
            <div className='space-y-2'>
              <Label htmlFor='show-name' className={LABEL_CLASS}>
                {t('createShowModal.nameLabel')}
              </Label>
              <Input
                id='show-name'
                {...register('name', { required: t('createShowModal.nameRequired') })}
                placeholder={t('createShowModal.namePlaceholder')}
                aria-invalid={!!errors.name}
                className={cn(FIELD_CLASS, errors.name && 'nb-invalid')}
              />
              {errors.name && (
                <p className={ERROR_CLASS} role='alert'>
                  {errors.name.message}
                </p>
              )}
              <p className='text-xs font-bold text-[#111]/70'>{t('createShowModal.nameHint')}</p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='show-alias' className={LABEL_CLASS}>
                {t('createShowModal.aliasLabel')}
              </Label>
              <Input
                id='show-alias'
                {...register('alias', { required: t('createShowModal.aliasRequired') })}
                placeholder={t('createShowModal.aliasPlaceholder')}
                autoComplete='off'
                aria-invalid={!!errors.alias}
                className={cn(FIELD_CLASS, errors.alias && 'nb-invalid')}
              />
              {errors.alias && (
                <p className={ERROR_CLASS} role='alert'>
                  {errors.alias.message}
                </p>
              )}
              <p className='text-xs font-bold text-[#111]/70'>{t('createShowModal.aliasHint')}</p>
            </div>

            <BannerImageField
              image={image}
              labelKey='createShowModal.imageLabel'
              hintKey='createShowModal.imageHint'
              ariaKey='createShowModal.uploadAria'
            />

            <DialogFooter className='gap-2 border-t-4 border-[#111] pt-5 sm:pt-5'>
              <button
                type='button'
                className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-11 cursor-pointer bg-white px-5 text-xs font-black uppercase tracking-[0.14em] sm:min-w-[5.5rem]'
                onClick={() => setDialogOpen(false)}
              >
                {t('createBannerModal.cancel')}
              </button>
              <button
                type='submit'
                disabled={isBusy}
                className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-11 cursor-pointer bg-[#c9f24d] px-5 text-xs font-black uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[5.5rem]'
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
