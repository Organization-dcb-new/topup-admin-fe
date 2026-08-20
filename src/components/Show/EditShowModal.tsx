import { useMemo, useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'

import { Pencil } from 'lucide-react'
import type { Show } from '@/types/show'
import { BannerImageField } from '@/components/Banner/BannerImageField'
import { useBannerImage } from '@/components/Banner/useBannerImage'
import { useUpdateShow } from '@/hooks/useShow'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

type UpdateShowForm = {
  name: string
  alias: string
  is_hot: boolean
  is_new: boolean
  is_popular: boolean
  is_show: boolean
}

const FIELD_CLASS =
  'nb-field nb-frame nb-frame-thin nb-sd-sm h-11 bg-white text-sm font-bold placeholder:font-medium placeholder:text-[#5f5f5f]'
const LABEL_CLASS = 'text-[11px] font-black uppercase tracking-[0.14em]'
const ERROR_CLASS = 'text-[11px] font-black uppercase tracking-wide text-[#8f1d10]'

function showToFormValues(show: Show): UpdateShowForm {
  return {
    name: show.name,
    alias: show.alias,
    is_hot: show.is_hot,
    is_new: show.is_new,
    is_popular: show.is_popular,
    is_show: show.is_show,
  }
}

export function UpdateShowModal({
  show,
  triggerClassName,
}: {
  show: Show
  triggerClassName?: string
}) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const image = useBannerImage(show.image)

  const { register, handleSubmit, reset, setValue, watch, formState } =
    useForm<UpdateShowForm>({ defaultValues: showToFormValues(show) })

  const flagFields = useMemo(
    () =>
      (
        [
          ['is_hot', 'flagHotLabel', 'flagHotDesc'],
          ['is_new', 'flagNewLabel', 'flagNewDesc'],
          ['is_popular', 'flagPopularLabel', 'flagPopularDesc'],
          ['is_show', 'flagShowLabel', 'flagShowDesc'],
        ] as const
      ).map(([key, labelKey, descKey]) => ({
        key,
        label: t(`editShowModal.${labelKey}`),
        description: t(`editShowModal.${descKey}`),
      })),
    [t],
  )

  const setDialogOpen = (value: boolean) => {
    if (value) {
      reset(showToFormValues(show))
      image.reset(show.image)
    }
    setOpen(value)
  }

  const mutation = useUpdateShow({ id: show.id, setOpen: setDialogOpen })

  const onSubmit = async (values: UpdateShowForm) => {
    const url = await image.upload()
    if (!url) return
    mutation.mutate({ ...values, image: url })
  }

  const isBusy = image.isUploading || mutation.isPending

  return (
    <>
      <button
        type='button'
        onClick={() => setDialogOpen(true)}
        className={cn(
          'nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-8 cursor-pointer items-center gap-1.5 px-2 text-[10px] font-black uppercase tracking-[0.12em]',
          triggerClassName,
        )}
        aria-label={t('editShowModal.triggerAria')}
      >
        <Pencil className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
        <span className='hidden sm:inline'>{t('editShowModal.triggerShort')}</span>
      </button>

      <Dialog open={open} onOpenChange={setDialogOpen}>
        <DialogContent
          className='nb nb-frame nb-frame-thick nb-sd-lg max-h-[min(90vh,44rem)] gap-0 overflow-y-auto bg-white p-0 sm:max-w-lg'
          showCloseButton={false}
        >
          <div className='border-b-4 border-[#111] bg-[#ffd84d] px-5 py-4'>
            <DialogHeader className='gap-2 text-left'>
              <div className='flex items-center gap-2.5'>
                <span className='nb-frame nb-frame-thin flex h-9 w-9 shrink-0 items-center justify-center bg-white'>
                  <Pencil className='h-4 w-4' strokeWidth={3} aria-hidden />
                </span>
                <DialogTitle className='text-xl font-black uppercase leading-none tracking-tight'>
                  {t('editShowModal.title')}
                </DialogTitle>
              </div>
              <DialogDescription className='text-xs font-bold text-[#111]/80'>
                {t('editShowModal.description')}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5 px-5 py-5'>
            <div className='space-y-2'>
              <Label htmlFor='edit-show-name' className={LABEL_CLASS}>
                {t('editShowModal.nameLabel')}
              </Label>
              <Input
                id='edit-show-name'
                {...register('name', { required: t('editShowModal.nameRequired') })}
                placeholder={t('editShowModal.namePlaceholder')}
                aria-invalid={!!formState.errors.name}
                className={cn(FIELD_CLASS, formState.errors.name && 'nb-invalid')}
              />
              {formState.errors.name && (
                <p className={ERROR_CLASS} role='alert'>
                  {formState.errors.name.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit-show-alias' className={LABEL_CLASS}>
                {t('editShowModal.aliasLabel')}
              </Label>
              <Input
                id='edit-show-alias'
                {...register('alias', { required: t('editShowModal.aliasRequired') })}
                placeholder={t('editShowModal.aliasPlaceholder')}
                autoComplete='off'
                aria-invalid={!!formState.errors.alias}
                className={cn(FIELD_CLASS, formState.errors.alias && 'nb-invalid')}
              />
              {formState.errors.alias && (
                <p className={ERROR_CLASS} role='alert'>
                  {formState.errors.alias.message}
                </p>
              )}
              <p className='text-xs font-bold text-[#111]/70'>{t('editShowModal.aliasHint')}</p>
            </div>

            <BannerImageField
              image={image}
              labelKey='editShowModal.imageLabel'
              hintKey='createShowModal.imageHint'
              ariaKey='editShowModal.uploadAria'
            />

            <fieldset className='nb-frame nb-frame-thin space-y-3 bg-[#f5f1e8] p-4'>
              <legend className='sr-only'>{t('editShowModal.flagsTitle')}</legend>
              <div>
                <p className='text-[11px] font-black uppercase tracking-[0.14em]'>
                  {t('editShowModal.flagsTitle')}
                </p>
                <p className='text-xs font-bold text-[#111]/70'>{t('editShowModal.flagsHint')}</p>
              </div>
              <div className='grid gap-2 sm:grid-cols-2'>
                {flagFields.map(({ key, label, description }) => (
                  <label
                    key={key}
                    className='nb-frame nb-frame-thin flex cursor-pointer gap-3 bg-white p-2.5 hover:bg-[#ffd84d]'
                  >
                    <Checkbox
                      checked={watch(key)}
                      onCheckedChange={(v) => setValue(key, !!v)}
                      aria-describedby={`${key}-hint`}
                      className='mt-0.5 rounded-none border-2 border-[#111] data-[state=checked]:bg-[#c9f24d] data-[state=checked]:text-[#111]'
                    />
                    <span className='min-w-0 space-y-0.5'>
                      <span className='block text-xs font-black uppercase tracking-tight'>
                        {label}
                      </span>
                      <span id={`${key}-hint`} className='block text-[11px] font-bold text-[#111]/70'>
                        {description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <DialogFooter className='gap-2 border-t-4 border-[#111] pt-5 sm:pt-5'>
              <button
                type='button'
                onClick={() => setOpen(false)}
                className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-11 cursor-pointer bg-white px-5 text-xs font-black uppercase tracking-[0.14em] sm:min-w-[5.5rem]'
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
