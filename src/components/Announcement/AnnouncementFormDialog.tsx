import { useId, useState, type ComponentProps } from 'react'
import { useForm, useWatch, type PathValue } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Clock, Eye, Link2, Megaphone, Trash2 } from 'lucide-react'

import { AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudInputIconClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { LINK_KIND_META, linkKind } from '@/components/Banner/banner-link'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  addMinutesToDatetimeLocal,
  datetimeLocalToIso,
  isoToDatetimeLocal,
  nowAsDatetimeLocal,
} from '@/helpers/maintenance-datetime'
import { useCreateAnnouncement, useUpdateAnnouncement } from '@/hooks/useAnnouncement'
import { useRetained } from '@/hooks/useRetained'
import { cn } from '@/lib/utils'
import {
  ANNOUNCEMENT_BODY_MAX,
  ANNOUNCEMENT_DISPLAYS,
  ANNOUNCEMENT_LEVELS,
  ANNOUNCEMENT_LINK_LABEL_MAX,
  ANNOUNCEMENT_TITLE_MAX,
  announcementSchema,
  charCount,
  type AnnouncementFormValues,
} from '@/schemas/announcement'
import type { Announcement, AnnouncementInput } from '@/types/announcement'
import { AnnouncementPreview } from './AnnouncementParts'
import { DISPLAY_META, LEVEL_META } from './announcement-status'

/** Quick "show for N days" presets for the end time. */
const DURATION_DAYS = [1, 3, 7]

interface AnnouncementFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Edit this announcement; leave out to write a new one. */
  announcement?: Announcement
}

export function AnnouncementFormDialog({ open, onOpenChange, announcement }: AnnouncementFormDialogProps) {
  const target = useRetained(open ? (announcement ?? 'new') : null)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-3xl'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {/* The retained target keeps the form filled while the dialog animates out; Radix unmounts it afterwards, so every opening still starts fresh. */}
        {target && (
          <AnnouncementForm
            key={target === 'new' ? 'new' : target.id}
            announcement={target === 'new' ? undefined : target}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function defaultValues(a?: Announcement): AnnouncementFormValues {
  return {
    title: a?.title ?? '',
    body: a?.body ?? '',
    level: a?.level ?? 'info',
    display: a?.display ?? 'bar',
    link_url: a?.link_url ?? '',
    link_label: a?.link_label ?? '',
    image_url: a?.image_url ?? '',
    is_active: a?.is_active ?? true,
    starts_at: isoToDatetimeLocal(a?.starts_at),
    ends_at: isoToDatetimeLocal(a?.ends_at),
  }
}

function Counter({ value, max }: { value: string; max: number }) {
  const count = charCount(value)
  return (
    <span
      className={cn(
        'font-display text-[10px] font-semibold tabular-nums tracking-[0.1em]',
        count > max ? 'text-rose-600' : count > max * 0.9 ? 'text-amber-600' : 'text-slate-400'
      )}
    >
      {count}/{max}
    </span>
  )
}

const choiceClass =
  'flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'

function AnnouncementForm({ announcement, onDone }: { announcement?: Announcement; onDone: () => void }) {
  const { t } = useTranslation()
  const ids = useId()
  const create = useCreateAnnouncement(onDone)
  const update = useUpdateAnnouncement(onDone)
  const pending = create.isPending || update.isPending
  const [uploading, setUploading] = useState(false)
  // Bumped on "remove", so the dropzone also forgets its preview of the file picked before.
  const [dropzoneKey, setDropzoneKey] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    control,
    formState: { errors, isSubmitted },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: defaultValues(announcement),
  })
  const [title, body, level, display, linkUrl, linkLabel, imageUrl, isActive, start, end] = useWatch({
    control,
    name: ['title', 'body', 'level', 'display', 'link_url', 'link_label', 'image_url', 'is_active', 'starts_at', 'ends_at'],
  })
  const kind = linkKind(linkUrl)
  const KindIcon = LINK_KIND_META[kind].icon

  // Pickers and buttons bypass the inputs, so re-check once the admin has tried to submit.
  const set = <K extends keyof AnnouncementFormValues>(field: K, value: AnnouncementFormValues[K]) => {
    setValue(field, value as PathValue<AnnouncementFormValues, K>, { shouldDirty: true, shouldValidate: isSubmitted })
    // The start/end order error sits on the end field, so a new start re-checks it too.
    if (isSubmitted && field === 'starts_at') void trigger('ends_at')
  }

  const showFor = (days: number) => set('ends_at', addMinutesToDatetimeLocal(start || nowAsDatetimeLocal(), days * 24 * 60))

  const onSubmit = (values: AnnouncementFormValues) => {
    const payload: AnnouncementInput = {
      title: values.title,
      body: values.body,
      level: values.level,
      display: values.display,
      link_url: values.link_url,
      link_label: values.link_label,
      // Only a popup shows an image, so a bar keeps none rather than a hidden one.
      image_url: values.display === 'popup' ? values.image_url : '',
      is_active: values.is_active,
      starts_at: datetimeLocalToIso(values.starts_at) ?? null,
      ends_at: datetimeLocalToIso(values.ends_at) ?? null,
    }
    if (announcement) update.mutate({ id: announcement.id, payload })
    else create.mutate(payload)
  }

  const scheduleError = errors.ends_at?.message ?? errors.starts_at?.message

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <Megaphone className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>
            {announcement ? t('announcementPage.form.editEyebrow') : t('announcementPage.form.addEyebrow')}
          </p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {announcement ? t('announcementPage.form.editTitle') : t('announcementPage.form.addTitle')}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>
            {t('announcementPage.form.description')}
          </DialogDescription>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-[minmax(0,1fr)_16rem]'>
        <div className='min-w-0 space-y-6'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between gap-3'>
              <Label htmlFor={`${ids}-title`} className={hudLabelClass}>
                {t('announcementPage.form.titleLabel')}
              </Label>
              <Counter value={title} max={ANNOUNCEMENT_TITLE_MAX} />
            </div>
            <Input
              id={`${ids}-title`}
              autoFocus
              autoComplete='off'
              placeholder={t('announcementPage.form.titlePlaceholder')}
              aria-invalid={!!errors.title}
              className={hudInputClass}
              {...register('title')}
            />
            {errors.title?.message && <FieldMessage tone='error'>{t(errors.title.message)}</FieldMessage>}
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between gap-3'>
              <Label htmlFor={`${ids}-body`} className={hudLabelClass}>
                {t('announcementPage.form.bodyLabel')}
              </Label>
              <Counter value={body} max={ANNOUNCEMENT_BODY_MAX} />
            </div>
            <Textarea
              id={`${ids}-body`}
              rows={4}
              placeholder={t('announcementPage.form.bodyPlaceholder')}
              aria-invalid={!!errors.body}
              aria-describedby={`${ids}-body-hint`}
              className='max-h-60 resize-none rounded-md border-slate-200 bg-slate-50 text-sm focus-visible:bg-white'
              {...register('body')}
            />
            {errors.body?.message ? (
              <FieldMessage tone='error'>{t(errors.body.message)}</FieldMessage>
            ) : (
              <p id={`${ids}-body-hint`} className='text-xs text-slate-500'>{t('announcementPage.form.bodyHint')}</p>
            )}
          </div>

          <div className='space-y-2'>
            <p id={`${ids}-display`} className={hudLabelClass}>{t('announcementPage.form.displayLabel')}</p>
            <div role='radiogroup' aria-labelledby={`${ids}-display`} className='grid gap-2 sm:grid-cols-2'>
              {ANNOUNCEMENT_DISPLAYS.map((value) => {
                const selected = display === value
                const Icon = DISPLAY_META[value].icon
                return (
                  <button
                    key={value}
                    type='button'
                    role='radio'
                    aria-checked={selected}
                    onClick={() => set('display', value)}
                    className={cn(
                      choiceClass,
                      'items-start',
                      selected
                        ? 'bg-brand-purple/[0.06] text-brand-purple ring-brand-purple/40'
                        : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
                    )}
                  >
                    <Icon className='mt-0.5 size-4 shrink-0' aria-hidden />
                    <span className='min-w-0'>
                      <span className='block'>{t(`announcementPage.display.${value}`)}</span>
                      <span className='block text-xs font-normal leading-snug text-slate-500'>
                        {t(`announcementPage.form.displayHint.${value}`)}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className='space-y-2'>
            <p id={`${ids}-level`} className={hudLabelClass}>{t('announcementPage.form.levelLabel')}</p>
            <div role='radiogroup' aria-labelledby={`${ids}-level`} className='grid grid-cols-3 gap-2'>
              {ANNOUNCEMENT_LEVELS.map((value) => {
                const selected = level === value
                const Icon = LEVEL_META[value].icon
                return (
                  <button
                    key={value}
                    type='button'
                    role='radio'
                    aria-checked={selected}
                    onClick={() => set('level', value)}
                    className={cn(
                      choiceClass,
                      'justify-center',
                      selected ? LEVEL_META[value].selected : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50'
                    )}
                  >
                    <Icon className='size-4 shrink-0' aria-hidden />
                    <span className='truncate'>{t(`announcementPage.level.${value}`)}</span>
                  </button>
                )
              })}
            </div>
            <p className='text-xs text-slate-500'>{t(`announcementPage.form.levelHint.${level}`)}</p>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between gap-3'>
              <Label htmlFor={`${ids}-link`} className={hudLabelClass}>
                {t('announcementPage.form.linkLabel')}
              </Label>
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] transition-colors duration-300 hud-clip-sm',
                  LINK_KIND_META[kind].chip
                )}
              >
                <KindIcon className='size-3' aria-hidden />
                {t(`announcementPage.linkKind.${kind}`)}
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
                placeholder={t('announcementPage.form.linkPlaceholder')}
                aria-invalid={!!errors.link_url}
                aria-describedby={`${ids}-link-hint`}
                className={cn(hudInputClass, 'pl-11')}
                {...register('link_url')}
              />
            </div>
            {errors.link_url?.message ? (
              <FieldMessage tone='error'>{t(errors.link_url.message)}</FieldMessage>
            ) : (
              <p id={`${ids}-link-hint`} className='text-xs leading-relaxed text-slate-500'>
                {t('announcementPage.form.linkHint')}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between gap-3'>
              <Label htmlFor={`${ids}-link-label`} className={hudLabelClass}>
                {t('announcementPage.form.linkLabelLabel')}
              </Label>
              <Counter value={linkLabel} max={ANNOUNCEMENT_LINK_LABEL_MAX} />
            </div>
            <Input
              id={`${ids}-link-label`}
              autoComplete='off'
              placeholder={t('announcementPage.form.linkLabelPlaceholder')}
              aria-invalid={!!errors.link_label}
              aria-describedby={`${ids}-link-label-hint`}
              className={hudInputClass}
              {...register('link_label')}
            />
            {errors.link_label?.message ? (
              <FieldMessage tone='error'>{t(errors.link_label.message)}</FieldMessage>
            ) : (
              <p id={`${ids}-link-label-hint`} className='text-xs text-slate-500'>
                {t('announcementPage.form.linkLabelHint')}
              </p>
            )}
          </div>

          {display === 'popup' && (
            <div className='space-y-2 animate-in fade-in slide-in-from-top-1 duration-300 ease-hud'>
              <div className='flex items-center justify-between gap-3'>
                <p id={`${ids}-image`} className={hudLabelClass}>{t('announcementPage.form.imageLabel')}</p>
                {imageUrl && !uploading && (
                  <button
                    type='button'
                    onClick={() => {
                      set('image_url', '')
                      setDropzoneKey((k) => k + 1)
                    }}
                    className='inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30'
                  >
                    <Trash2 className='size-3.5' aria-hidden />
                    {t('announcementPage.form.imageRemove')}
                  </button>
                )}
              </div>
              <ImageDropzone
                key={dropzoneKey}
                value={imageUrl}
                onChange={(url) => set('image_url', url)}
                onUploadingChange={setUploading}
                aspectClassName='aspect-video'
                labelledBy={`${ids}-image`}
                hint={t('announcementPage.form.imageHint')}
                error={errors.image_url?.message && t(errors.image_url.message)}
              />
            </div>
          )}

          <fieldset className='space-y-3'>
            <div className='flex items-center justify-between gap-3'>
              <legend className={hudLabelClass}>{t('announcementPage.form.scheduleLabel')}</legend>
              <span className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>
                {t('announcementPage.wib')}
              </span>
            </div>
            <div className='grid gap-3 sm:grid-cols-2'>
              <ScheduleInput
                id={`${ids}-start`}
                label={t('announcementPage.form.startLabel')}
                hint={t('announcementPage.form.startHint')}
                value={start}
                invalid={!!errors.starts_at}
                onClear={() => set('starts_at', '')}
                {...register('starts_at', { deps: 'ends_at' })}
              />
              <ScheduleInput
                id={`${ids}-end`}
                label={t('announcementPage.form.endLabel')}
                hint={t('announcementPage.form.endHint')}
                value={end}
                min={start || undefined}
                invalid={!!errors.ends_at}
                onClear={() => set('ends_at', '')}
                {...register('ends_at')}
              />
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='inline-flex items-center gap-1 text-xs text-slate-500'>
                <Clock className='size-3.5' aria-hidden />
                {t('announcementPage.form.showFor')}
              </span>
              {DURATION_DAYS.map((days) => {
                const selected = !!end && end === addMinutesToDatetimeLocal(start || nowAsDatetimeLocal(), days * 24 * 60)
                return (
                  <button
                    key={days}
                    type='button'
                    onClick={() => showFor(days)}
                    aria-pressed={selected}
                    className={cn(
                      'h-7 px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.1em] hud-clip-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40',
                      selected
                        ? 'bg-brand-purple text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-brand-purple/10 hover:text-brand-purple'
                    )}
                  >
                    {t('announcementPage.form.days', { count: days })}
                  </button>
                )
              })}
            </div>
            {scheduleError && <FieldMessage tone='error'>{t(scheduleError)}</FieldMessage>}
          </fieldset>

          <label
            className={cn(
              'flex cursor-pointer items-center justify-between gap-4 rounded-md border px-4 py-3 transition-colors',
              isActive ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-200 hover:bg-slate-50'
            )}
          >
            <span className='min-w-0'>
              <span className='block text-sm font-medium text-slate-800'>{t('announcementPage.form.activeLabel')}</span>
              <span className='block text-xs text-slate-500'>
                {isActive ? t('announcementPage.form.activeOnHint') : t('announcementPage.form.activeOffHint')}
              </span>
            </span>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => set('is_active', checked)}
              className='data-[state=checked]:bg-emerald-500'
            />
          </label>
        </div>

        <aside className='min-w-0 space-y-2 md:sticky md:top-4 md:self-start'>
          <p className={cn(hudLabelClass, 'inline-flex items-center gap-1.5')}>
            <Eye className='size-3.5' aria-hidden />
            {t('announcementPage.preview.label')}
          </p>
          <AnnouncementPreview
            title={title}
            body={body}
            level={level}
            display={display}
            linkUrl={linkUrl}
            linkLabel={linkLabel}
            imageUrl={display === 'popup' ? imageUrl : ''}
          />
          <p className='text-[11px] leading-snug text-slate-400'>{t('announcementPage.preview.note')}</p>
        </aside>
      </div>

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onDone}
          disabled={pending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('announcementPage.form.cancel')}
        </button>
        <div className='sm:min-w-52'>
          <AuthSubmitButton
            pending={pending}
            pendingLabel={t('announcementPage.form.saving')}
            cooldown={0}
            disabled={uploading}
          >
            {announcement ? t('announcementPage.form.save') : t('announcementPage.form.create')}
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  )
}

interface ScheduleInputProps extends Omit<ComponentProps<'input'>, 'value'> {
  id: string
  label: string
  hint: string
  /** Watched value, to know whether there is anything to clear. */
  value: string
  invalid: boolean
  onClear: () => void
}

function ScheduleInput({ id, label, hint, value, invalid, onClear, ...field }: ScheduleInputProps) {
  const { t } = useTranslation()
  return (
    <div className='space-y-1.5'>
      <div className='flex h-5 items-center justify-between gap-2'>
        <Label htmlFor={id} className='text-xs font-medium text-slate-500'>
          {label}
        </Label>
        {value && (
          <button
            type='button'
            onClick={onClear}
            className='rounded px-1 text-[11px] font-medium text-slate-400 transition-colors hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'
          >
            {t('announcementPage.form.clear')}
          </button>
        )}
      </div>
      <Input
        id={id}
        type='datetime-local'
        aria-invalid={invalid}
        aria-describedby={`${id}-hint`}
        className={cn(hudInputClass, 'tabular-nums')}
        {...field}
      />
      <p id={`${id}-hint`} className='text-[11px] leading-snug text-slate-500'>{hint}</p>
    </div>
  )
}
