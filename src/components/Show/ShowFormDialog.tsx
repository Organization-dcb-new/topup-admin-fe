import { useId, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Clapperboard, Eye } from 'lucide-react'

import { AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useCreateShow, useUpdateShow } from '@/hooks/useShow'
import { cn } from '@/lib/utils'
import { showSchema, type ShowFormInput, type ShowFormValues } from '@/schemas/show'
import type { Show } from '@/types/show'
import { SHOW_BADGES, toAlias } from './show-flags'

interface ShowFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Edit this show; leave out to add one. */
  show?: Show
}

export function ShowFormDialog({ open, onOpenChange, show }: ShowFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-xl'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {open && <ShowForm show={show} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function ShowForm({ show, onDone }: { show?: Show; onDone: () => void }) {
  const { t } = useTranslation()
  const ids = useId()
  const create = useCreateShow(onDone)
  const update = useUpdateShow(onDone)
  const pending = create.isPending || update.isPending
  const [uploading, setUploading] = useState(false)
  // A new show's alias follows its name until the admin edits the alias by hand.
  const aliasTouched = useRef(!!show)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitted },
  } = useForm<ShowFormInput, unknown, ShowFormValues>({
    resolver: zodResolver(showSchema),
    defaultValues: {
      name: show?.name ?? '',
      alias: show?.alias ?? '',
      image: show?.image ?? '',
      is_hot: show?.is_hot ?? false,
      is_new: show?.is_new ?? false,
      is_popular: show?.is_popular ?? false,
      is_show: show?.is_show ?? false,
    },
  })
  const values = useWatch({ control })
  const nameField = register('name')
  const aliasField = register('alias')

  const onSubmit = (v: ShowFormValues) => {
    if (show) update.mutate({ id: show.id, payload: v })
    else create.mutate({ name: v.name, alias: v.alias, image: v.image })
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <Clapperboard className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{show ? t('showPage.form.editEyebrow') : t('showPage.form.addEyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {show ? t('showPage.form.editTitle') : t('showPage.form.addTitle')}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>
            {show ? t('showPage.form.editDescription') : t('showPage.form.addDescription')}
          </DialogDescription>
        </div>
      </div>

      <div className='grid gap-5 sm:grid-cols-[9rem_minmax(0,1fr)]'>
        <div className='space-y-2'>
          <p id={`${ids}-image`} className={hudLabelClass}>{t('showPage.form.imageLabel')}</p>
          <ImageDropzone
            value={values.image ?? ''}
            onChange={(url) => setValue('image', url, { shouldDirty: true })}
            onUploadingChange={setUploading}
            aspectClassName='aspect-square'
            fit='contain'
            labelledBy={`${ids}-image`}
            hint={t('imageDropzone.formatsShort')}
          />
        </div>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor={`${ids}-name`} className={hudLabelClass}>{t('showPage.form.nameLabel')}</Label>
            <Input
              id={`${ids}-name`}
              autoFocus
              placeholder={t('showPage.form.namePlaceholder')}
              aria-invalid={!!errors.name}
              className={hudInputClass}
              {...nameField}
              onChange={(e) => {
                void nameField.onChange(e)
                if (!aliasTouched.current) {
                  setValue('alias', toAlias(e.target.value).replace(/-+$/, ''), { shouldValidate: isSubmitted })
                }
              }}
            />
            {errors.name?.message && <FieldMessage tone='error'>{t(errors.name.message)}</FieldMessage>}
          </div>
          <div className='space-y-2'>
            <Label htmlFor={`${ids}-alias`} className={hudLabelClass}>{t('showPage.form.aliasLabel')}</Label>
            <Input
              id={`${ids}-alias`}
              autoComplete='off'
              autoCapitalize='none'
              spellCheck={false}
              placeholder='topup-hemat'
              aria-invalid={!!errors.alias}
              aria-describedby={`${ids}-alias-hint`}
              className={cn(hudInputClass, 'font-mono')}
              {...aliasField}
              onChange={(e) => {
                aliasTouched.current = true
                e.target.value = toAlias(e.target.value)
                void aliasField.onChange(e)
              }}
            />
            {errors.alias?.message ? (
              <FieldMessage tone='error'>{t(errors.alias.message)}</FieldMessage>
            ) : (
              <p id={`${ids}-alias-hint`} className='text-xs text-slate-500'>{t('showPage.form.aliasHint')}</p>
            )}
          </div>
        </div>
      </div>

      {show ? (
        <fieldset className='space-y-3'>
          <legend className={cn(hudLabelClass, 'mb-3')}>{t('showPage.form.displayLabel')}</legend>
          <label
            className={cn(
              'flex cursor-pointer items-center justify-between gap-4 rounded-md border px-4 py-3 transition-colors',
              values.is_show ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
            )}
          >
            <span className='flex min-w-0 items-center gap-3'>
              <Eye className={cn('size-4 shrink-0', values.is_show ? 'text-emerald-600' : 'text-slate-400')} aria-hidden />
              <span className='min-w-0'>
                <span className='block text-sm font-medium text-slate-800'>{t('showPage.flags.is_show')}</span>
                <span className='block text-xs text-slate-500'>{t('showPage.flags.is_showHint')}</span>
              </span>
            </span>
            <Switch
              checked={!!values.is_show}
              onCheckedChange={(checked) => setValue('is_show', checked, { shouldDirty: true })}
              className='data-[state=checked]:bg-emerald-500'
            />
          </label>
          <div className='grid gap-2 sm:grid-cols-3'>
            {SHOW_BADGES.map(({ key, icon: Icon, on }) => {
              const active = !!values[key]
              return (
                <button
                  key={key}
                  type='button'
                  aria-pressed={active}
                  onClick={() => setValue(key, !active, { shouldDirty: true })}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40',
                    active ? on : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50'
                  )}
                >
                  <Icon className='size-4 shrink-0' aria-hidden />
                  {t(`showPage.flags.${key}`)}
                </button>
              )
            })}
          </div>
        </fieldset>
      ) : (
        <p className='rounded-md bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600'>
          {t('showPage.form.hiddenNote')}
        </p>
      )}

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onDone}
          disabled={pending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('showPage.form.cancel')}
        </button>
        <div className='sm:min-w-52'>
          <AuthSubmitButton pending={pending} pendingLabel={t('showPage.form.saving')} cooldown={0} disabled={uploading}>
            {show ? t('showPage.form.save') : t('showPage.form.create')}
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  )
}
