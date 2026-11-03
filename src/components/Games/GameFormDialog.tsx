import { useId, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Gamepad2, Pencil, Star, type LucideIcon } from 'lucide-react'

import { AuthAlert, AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { PERM } from '@/constants/permissions'
import { gameServerMessage, useCreateGame, useUpdateGame } from '@/hooks/useGame'
import { usePermissions } from '@/hooks/usePermissions'
import { useGetProvider } from '@/hooks/useProvider'
import { cn } from '@/lib/utils'
import {
  gameCreateSchema,
  gameEditSchema,
  type GameCreateFormInput,
  type GameCreateFormValues,
  type GameEditFormInput,
  type GameEditFormValues,
} from '@/schemas/game'
import type { Game, GameUpdateRequest } from '@/types/game'
import { CategorySelect } from './CategorySelect'
import { GameInputsBuilder } from './GameInputsBuilder'
import { gameSelectTriggerClass, toSlug } from './game-utils'

interface GameFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Edit this game; leave out to add one. */
  game?: Game
}

export function GameFormDialog({ open, onOpenChange, game }: GameFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl',
          game ? 'sm:max-w-2xl' : 'sm:max-w-5xl'
        )}
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {/* Mounted per opening, so every open starts from the saved values. */}
        {open && (game ? <EditGameForm game={game} onDone={() => onOpenChange(false)} /> : <CreateGameForm onDone={() => onOpenChange(false)} />)}
      </DialogContent>
    </Dialog>
  )
}

function FormHeader({ icon: Icon, eyebrow, title, description }: { icon: LucideIcon; eyebrow: string; title: string; description: string }) {
  return (
    <div className='flex items-start gap-4'>
      <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
        <Icon className='size-5' aria-hidden />
      </span>
      <div className='min-w-0 space-y-1'>
        <p className={hudEyebrowClass}>{eyebrow}</p>
        <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>{title}</DialogTitle>
        <DialogDescription className='text-sm leading-relaxed text-slate-500'>{description}</DialogDescription>
      </div>
    </div>
  )
}

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('space-y-3', className)}>
      <p className='border-b border-slate-100 pb-2 font-display text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400'>{title}</p>
      {children}
    </section>
  )
}

function Footer({ pending, uploading, onCancel, submitLabel }: { pending: boolean; uploading?: boolean; onCancel: () => void; submitLabel: string }) {
  const { t } = useTranslation('common')
  return (
    <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
      <button
        type='button'
        onClick={onCancel}
        disabled={pending}
        className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
      >
        {t('gameForm.cancel')}
      </button>
      <div className='sm:min-w-52'>
        <AuthSubmitButton pending={pending} pendingLabel={t('gameForm.saving')} cooldown={0} disabled={uploading}>
          {submitLabel}
        </AuthSubmitButton>
      </div>
    </div>
  )
}

/** Backend messages that belong to one field of the create form. */
const CREATE_ERRORS: Record<string, ['slug' | 'category_id' | 'provider_id', string]> = {
  'Slug already exists': ['slug', 'gameForm.errors.slugTaken'],
  'Category Not Found': ['category_id', 'gameForm.errors.categoryMissing'],
  'Provider Not Found': ['provider_id', 'gameForm.errors.providerMissing'],
}

function CreateGameForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation('common')
  const ids = useId()
  const { can } = usePermissions()
  const create = useCreateGame(onDone)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  // The slug follows the name until the admin edits it by hand.
  const slugTouched = useRef(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitted },
  } = useForm<GameCreateFormInput, unknown, GameCreateFormValues>({
    resolver: zodResolver(gameCreateSchema),
    defaultValues: {
      provider_id: '',
      category_id: '',
      name: '',
      slug: '',
      code: '',
      thumbnail_url: '',
      banner_url: '',
      developer: '',
      publisher: '',
      description: '',
      instruction: '',
      inputs: [{ key: 'user_id', label: 'User ID', input_type: 'tel', placeholder: '' }],
    },
  })
  const [thumb, banner] = useWatch({ control, name: ['thumbnail_url', 'banner_url'] })
  const nameField = register('name')
  const slugField = register('slug')

  const onSubmit = (v: GameCreateFormValues) =>
    create.mutate(
      { ...v, inputs: v.inputs.map((input, index) => ({ ...input, sort_order: index + 1, required: true })) },
      {
        onError: (err) => {
          const known = CREATE_ERRORS[gameServerMessage(err) ?? '']
          if (known) setError(known[0], { message: known[1] })
          else setError('root', { message: 'gameForm.errors.createGeneric' })
        },
      }
    )

  const textInput = (name: 'code' | 'developer' | 'publisher', extra?: string) => ({
    id: `${ids}-${name}`,
    autoComplete: 'off',
    'aria-invalid': !!errors[name],
    className: cn(hudInputClass, extra),
    ...register(name),
  })

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-6 sm:p-7'>
      <FormHeader icon={Gamepad2} eyebrow={t('gameForm.addEyebrow')} title={t('gameForm.addTitle')} description={t('gameForm.addDescription')} />

      {errors.root?.message && <AuthAlert>{t(errors.root.message)}</AuthAlert>}

      <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]'>
        <div className='space-y-6'>
          <Section title={t('gameForm.sectionSource')}>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor={`${ids}-provider`} className={hudLabelClass}>{t('gameForm.providerLabel')}</Label>
                {can(PERM.providerView) ? (
                  <Controller
                    control={control}
                    name='provider_id'
                    render={({ field }) => <ProviderSelect id={`${ids}-provider`} value={field.value} onChange={field.onChange} invalid={!!errors.provider_id} />}
                  />
                ) : (
                  <p className='rounded-md bg-amber-50 px-3 py-2.5 text-xs text-amber-800'>{t('gameForm.providerNoAccess')}</p>
                )}
                {errors.provider_id?.message && <FieldMessage tone='error'>{t(errors.provider_id.message)}</FieldMessage>}
              </div>
              <div className='space-y-2'>
                <Label htmlFor={`${ids}-code`} className={hudLabelClass}>{t('gameForm.codeLabel')}</Label>
                <Input placeholder='MOBILELEGENDS' spellCheck={false} {...textInput('code', 'font-mono text-sm')} />
                {errors.code?.message ? (
                  <FieldMessage tone='error'>{t(errors.code.message)}</FieldMessage>
                ) : (
                  <p className='text-[11px] leading-snug text-slate-500'>{t('gameForm.codeHint')}</p>
                )}
              </div>
              <div className='space-y-2 sm:col-span-2'>
                <Label htmlFor={`${ids}-category`} className={hudLabelClass}>{t('gameForm.categoryLabel')}</Label>
                <Controller
                  control={control}
                  name='category_id'
                  render={({ field }) => (
                    <CategorySelect id={`${ids}-category`} value={field.value} onChange={field.onChange} invalid={!!errors.category_id} enabled />
                  )}
                />
                {errors.category_id?.message && <FieldMessage tone='error'>{t(errors.category_id.message)}</FieldMessage>}
              </div>
            </div>
          </Section>

          <Section title={t('gameForm.sectionIdentity')}>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor={`${ids}-name`} className={hudLabelClass}>{t('gameForm.nameLabel')}</Label>
                <Input
                  id={`${ids}-name`}
                  autoFocus
                  autoComplete='off'
                  placeholder='Mobile Legends'
                  aria-invalid={!!errors.name}
                  className={hudInputClass}
                  {...nameField}
                  onChange={(e) => {
                    void nameField.onChange(e)
                    if (!slugTouched.current) setValue('slug', toSlug(e.target.value).replace(/-+$/, ''), { shouldValidate: isSubmitted })
                  }}
                />
                {errors.name?.message && <FieldMessage tone='error'>{t(errors.name.message)}</FieldMessage>}
              </div>
              <div className='space-y-2'>
                <Label htmlFor={`${ids}-slug`} className={hudLabelClass}>{t('gameForm.slugLabel')}</Label>
                <Input
                  id={`${ids}-slug`}
                  autoComplete='off'
                  spellCheck={false}
                  placeholder='mobile-legends'
                  aria-invalid={!!errors.slug}
                  className={cn(hudInputClass, 'font-mono text-sm')}
                  {...slugField}
                  onChange={(e) => {
                    slugTouched.current = true
                    e.target.value = toSlug(e.target.value)
                    void slugField.onChange(e)
                  }}
                />
                {errors.slug?.message && <FieldMessage tone='error'>{t(errors.slug.message)}</FieldMessage>}
              </div>
              <div className='space-y-2'>
                <Label htmlFor={`${ids}-developer`} className={hudLabelClass}>{t('gameForm.developerLabel')}</Label>
                <Input placeholder='Moonton' {...textInput('developer')} />
              </div>
              <div className='space-y-2'>
                <Label htmlFor={`${ids}-publisher`} className={hudLabelClass}>{t('gameForm.publisherLabel')}</Label>
                <Input placeholder='Moonton' {...textInput('publisher')} />
              </div>
            </div>
          </Section>

          <Section title={t('gameForm.sectionImages')}>
            <div className='grid gap-4 sm:grid-cols-[9rem_minmax(0,1fr)]'>
              <div className='space-y-2'>
                <p id={`${ids}-thumb`} className={hudLabelClass}>{t('gameForm.thumbnailLabel')}</p>
                <ImageDropzone
                  value={thumb ?? ''}
                  onChange={(url) => setValue('thumbnail_url', url, { shouldDirty: true, shouldValidate: isSubmitted })}
                  onUploadingChange={setUploadingThumb}
                  aspectClassName='aspect-square'
                  labelledBy={`${ids}-thumb`}
                  hint={t('imageDropzone.formatsShort')}
                  error={errors.thumbnail_url?.message && t(errors.thumbnail_url.message)}
                />
              </div>
              <div className='space-y-2'>
                <p id={`${ids}-banner`} className={hudLabelClass}>{t('gameForm.bannerLabel')}</p>
                <ImageDropzone
                  value={banner ?? ''}
                  onChange={(url) => setValue('banner_url', url, { shouldDirty: true })}
                  onUploadingChange={setUploadingBanner}
                  aspectClassName='aspect-[21/9]'
                  labelledBy={`${ids}-banner`}
                  hint={t('gameForm.bannerHint')}
                />
              </div>
            </div>
          </Section>

          <Section title={t('gameForm.sectionContent')}>
            <TextBlock id={`${ids}-description`} label={t('gameForm.descriptionLabel')} placeholder={t('gameForm.descriptionPlaceholder')} {...register('description')} />
            <TextBlock id={`${ids}-instruction`} label={t('gameForm.instructionLabel')} placeholder={t('gameForm.instructionPlaceholder')} {...register('instruction')} />
          </Section>
        </div>

        <Section title={t('gameForm.sectionInputs')} className='lg:border-l lg:border-slate-100 lg:pl-8'>
          <GameInputsBuilder control={control} register={register} errors={errors.inputs} />
        </Section>
      </div>

      <Footer pending={create.isPending} uploading={uploadingThumb || uploadingBanner} onCancel={onDone} submitLabel={t('gameForm.create')} />
    </form>
  )
}

function ProviderSelect({ id, value, onChange, invalid }: { id: string; value: string; onChange: (id: string) => void; invalid?: boolean }) {
  const { t } = useTranslation('common')
  const { data, isLoading } = useGetProvider()
  const providers = data?.data ?? []
  return (
    <Select value={value || undefined} onValueChange={onChange} disabled={isLoading}>
      <SelectTrigger id={id} aria-invalid={invalid} className={gameSelectTriggerClass}>
        <SelectValue placeholder={isLoading ? t('gameForm.providerLoading') : t('gameForm.providerPlaceholder')} />
      </SelectTrigger>
      <SelectContent>
        {providers.map((provider) => (
          <SelectItem key={provider.id} value={provider.id}>
            {provider.name}
            <span className='ml-1.5 font-mono text-[11px] text-slate-400'>{provider.code}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function TextBlock({ id, label, ...props }: { id: string; label: string } & ComponentProps<typeof Textarea>) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={id} className={hudLabelClass}>{label}</Label>
      <Textarea id={id} rows={3} className='resize-y rounded-md border-slate-200 bg-slate-50 text-sm focus-visible:border-brand-purple focus-visible:bg-white aria-invalid:border-rose-400' {...props} />
    </div>
  )
}

const TEXT_FIELDS = ['name', 'developer', 'publisher', 'description', 'instruction'] as const

function EditGameForm({ game, onDone }: { game: Game; onDone: () => void }) {
  const { t } = useTranslation('common')
  const ids = useId()
  const update = useUpdateGame(onDone)
  const initial: GameEditFormInput = {
    name: game.name ?? '',
    // The detail endpoint has no category_id, only the category object.
    category_id: game.category_id || game.category?.id || '',
    developer: game.developer ?? '',
    publisher: game.publisher ?? '',
    description: game.description ?? '',
    instruction: game.instruction ?? '',
    popularity_score: game.popularity_score ?? 0,
    is_featured: !!game.is_featured,
  }

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<GameEditFormInput, unknown, GameEditFormValues>({
    resolver: zodResolver(gameEditSchema),
    defaultValues: initial,
  })
  const [name, featured] = useWatch({ control, name: ['name', 'is_featured'] })
  const nameChanged = (name ?? '').trim() !== initial.name.trim()

  // Only changed fields are sent: the backend can't clear a field, and resending the name
  // regenerates the slug.
  const onSubmit = (v: GameEditFormValues) => {
    const payload: GameUpdateRequest = {}
    let blocked = false
    for (const key of TEXT_FIELDS) {
      const before = String(initial[key]).trim()
      if (v[key] === before) continue
      if (!v[key]) {
        setError(key, { message: 'gameForm.errors.cannotClear' })
        blocked = true
      } else {
        payload[key] = v[key]
      }
    }
    if (v.popularity_score !== Number(initial.popularity_score)) {
      if (v.popularity_score === 0) {
        setError('popularity_score', { message: 'gameForm.errors.popularityZero' })
        blocked = true
      } else {
        payload.popularity_score = v.popularity_score
      }
    }
    if (v.is_featured !== initial.is_featured) payload.is_featured = v.is_featured
    if (v.category_id && v.category_id !== initial.category_id) payload.category_id = v.category_id
    if (blocked) return
    if (Object.keys(payload).length === 0) return onDone()
    update.mutate({ id: game.id, payload })
  }

  const textInput = (key: 'developer' | 'publisher') => ({
    id: `${ids}-${key}`,
    autoComplete: 'off',
    'aria-invalid': !!errors[key],
    className: hudInputClass,
    ...register(key),
  })

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-6 sm:p-7'>
      <FormHeader icon={Pencil} eyebrow={t('gameForm.editEyebrow')} title={t('gameForm.editTitle')} description={t('gameForm.editDescription')} />

      <div className='flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500'>
        <span>
          <span className='font-display font-semibold uppercase tracking-[0.15em] text-slate-400'>{t('gameForm.codeLabel')} </span>
          <span className='font-mono text-slate-700'>{game.code}</span>
        </span>
        <span>
          <span className='font-display font-semibold uppercase tracking-[0.15em] text-slate-400'>{t('gameForm.slugLabel')} </span>
          <span className='font-mono text-slate-700'>{game.slug}</span>
        </span>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='space-y-2 sm:col-span-2'>
          <Label htmlFor={`${ids}-name`} className={hudLabelClass}>{t('gameForm.nameLabel')}</Label>
          <Input id={`${ids}-name`} autoFocus autoComplete='off' aria-invalid={!!errors.name} className={hudInputClass} {...register('name')} />
          {errors.name?.message ? (
            <FieldMessage tone='error'>{t(errors.name.message)}</FieldMessage>
          ) : (
            nameChanged && <FieldMessage tone='warning'>{t('gameForm.slugWillChange')}</FieldMessage>
          )}
        </div>
        <div className='space-y-2'>
          <Label htmlFor={`${ids}-category`} className={hudLabelClass}>{t('gameForm.categoryLabel')}</Label>
          <Controller
            control={control}
            name='category_id'
            render={({ field }) => (
              <CategorySelect id={`${ids}-category`} value={field.value} onChange={field.onChange} currentName={game.category?.name} enabled />
            )}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor={`${ids}-popularity`} className={hudLabelClass}>{t('gameForm.popularityLabel')}</Label>
          <Input
            id={`${ids}-popularity`}
            type='number'
            inputMode='numeric'
            min={0}
            step={1}
            aria-invalid={!!errors.popularity_score}
            className={cn(hudInputClass, 'tabular-nums')}
            {...register('popularity_score')}
          />
          {errors.popularity_score?.message && <FieldMessage tone='error'>{t(errors.popularity_score.message)}</FieldMessage>}
        </div>
        <div className='space-y-2'>
          <Label htmlFor={`${ids}-developer`} className={hudLabelClass}>{t('gameForm.developerLabel')}</Label>
          <Input {...textInput('developer')} />
          {errors.developer?.message && <FieldMessage tone='error'>{t(errors.developer.message)}</FieldMessage>}
        </div>
        <div className='space-y-2'>
          <Label htmlFor={`${ids}-publisher`} className={hudLabelClass}>{t('gameForm.publisherLabel')}</Label>
          <Input {...textInput('publisher')} />
          {errors.publisher?.message && <FieldMessage tone='error'>{t(errors.publisher.message)}</FieldMessage>}
        </div>
      </div>

      <div className='space-y-4'>
        <div className='space-y-1'>
          <TextBlock id={`${ids}-description`} label={t('gameForm.descriptionLabel')} aria-invalid={!!errors.description} {...register('description')} />
          {errors.description?.message && <FieldMessage tone='error'>{t(errors.description.message)}</FieldMessage>}
        </div>
        <div className='space-y-1'>
          <TextBlock id={`${ids}-instruction`} label={t('gameForm.instructionLabel')} aria-invalid={!!errors.instruction} {...register('instruction')} />
          {errors.instruction?.message && <FieldMessage tone='error'>{t(errors.instruction.message)}</FieldMessage>}
        </div>
      </div>

      <Controller
        control={control}
        name='is_featured'
        render={({ field }) => (
          <label
            className={cn(
              'flex cursor-pointer items-center justify-between gap-4 rounded-md border px-4 py-3 transition-colors',
              featured ? 'border-amber-200 bg-amber-50/60' : 'border-slate-200 hover:bg-slate-50'
            )}
          >
            <span className='flex min-w-0 items-center gap-3'>
              <Star className={cn('size-4 shrink-0', featured ? 'text-amber-500' : 'text-slate-400')} aria-hidden />
              <span className='min-w-0'>
                <span className='block text-sm font-medium text-slate-800'>{t('gameForm.featuredLabel')}</span>
                <span className='block text-xs text-slate-500'>{t('gameForm.featuredHint')}</span>
              </span>
            </span>
            <Switch checked={!!field.value} onCheckedChange={field.onChange} className='data-[state=checked]:bg-amber-500' />
          </label>
        )}
      />

      <p className='text-[11px] leading-snug text-slate-500'>{t('gameForm.editNote')}</p>

      <Footer pending={update.isPending} onCancel={onDone} submitLabel={t('gameForm.save')} />
    </form>
  )
}
