import { useId, useRef, useState, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Gamepad2, Lock, Shapes } from 'lucide-react'

import { AuthAlert, AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { PERM } from '@/constants/permissions'
import { isDuplicateSlugError, useCreateCategoryProduct, useRenameCategoryProduct } from '@/hooks/useCategoryProduct'
import { useGetGameNames } from '@/hooks/useGame'
import { usePermissions } from '@/hooks/usePermissions'
import { useRetained } from '@/hooks/useRetained'
import { toSlug } from '@/lib/slug'
import { cn } from '@/lib/utils'
import {
  createCategoryProductSchema,
  renameCategoryProductSchema,
  type CreateCategoryProductInput,
  type CreateCategoryProductValues,
  type RenameCategoryProductValues,
} from '@/schemas/category-product'
import type { CategoryProduct } from '@/types/category-product'
import { GamePicker } from './GamePicker'

interface CategoryProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Rename this category; leave out to create one. */
  category?: CategoryProduct
}

export function CategoryProductFormDialog({ open, onOpenChange, category }: CategoryProductFormDialogProps) {
  const target = useRetained(open ? (category ?? 'new') : null)
  const done = () => onOpenChange(false)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl',
          category ? 'sm:max-w-lg' : 'sm:max-w-xl'
        )}
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {/* The retained target keeps the form filled while the dialog animates out; Radix unmounts it afterwards, so every opening still starts fresh. */}
        {target === 'new' ? <CreateForm onDone={done} /> : target && <RenameForm key={target.id} category={target} onDone={done} />}
      </DialogContent>
    </Dialog>
  )
}

function DialogHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className='flex items-start gap-4'>
      <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
        <Shapes className='size-5' aria-hidden />
      </span>
      <div className='min-w-0 space-y-1'>
        <p className={hudEyebrowClass}>{eyebrow}</p>
        <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>{title}</DialogTitle>
        <DialogDescription className='text-sm leading-relaxed text-slate-500'>{description}</DialogDescription>
      </div>
    </div>
  )
}

function FormFooter({ pending, disabled, cancelLabel, submitLabel, onCancel }: {
  pending: boolean
  disabled?: boolean
  cancelLabel: string
  submitLabel: string
  onCancel: () => void
}) {
  const { t } = useTranslation('common')
  return (
    <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
      <button
        type='button'
        onClick={onCancel}
        disabled={pending}
        className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
      >
        {cancelLabel}
      </button>
      <div className='sm:min-w-52'>
        <AuthSubmitButton pending={pending} pendingLabel={t('categoryProductPage.form.saving')} cooldown={0} disabled={disabled}>
          {submitLabel}
        </AuthSubmitButton>
      </div>
    </div>
  )
}

function CreateForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation('common')
  const ids = useId()
  const { can } = usePermissions()
  const canListGames = can(PERM.gameView)
  const { data: games = [], isLoading: gamesLoading } = useGetGameNames(canListGames)
  const create = useCreateCategoryProduct(onDone)
  const [uploading, setUploading] = useState(false)
  // The slug follows "<game> <name>" until it is edited by hand: slugs must be unique across games.
  const slugTouched = useRef(false)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    setFocus,
    control,
    formState: { errors, isSubmitted },
  } = useForm<CreateCategoryProductInput, unknown, CreateCategoryProductValues>({
    resolver: zodResolver(createCategoryProductSchema),
    defaultValues: { game_id: '', name: '', slug: '', icon_url: '', description: '', is_active: true },
  })
  const [gameId, icon, isActive] = useWatch({ control, name: ['game_id', 'icon_url', 'is_active'] })
  const nameField = register('name')
  const slugField = register('slug')

  const syncSlug = (gameName: string, name: string) => {
    if (slugTouched.current) return
    setValue('slug', toSlug(`${gameName} ${name}`).replace(/-+$/, ''), { shouldValidate: isSubmitted })
  }
  const gameName = (id: string) => games.find((g) => g.id === id)?.name ?? ''

  const onSubmit = (v: CreateCategoryProductValues) =>
    create.mutate(v, {
      onError: (err) => {
        if (isDuplicateSlugError(err)) {
          setError('slug', { message: 'categoryProductPage.form.errors.slugTaken' })
          setFocus('slug')
        } else {
          setError('root', { message: 'categoryProductPage.form.errors.generic' })
        }
      },
    })

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-6 sm:p-7'>
      <DialogHeading
        eyebrow={t('categoryProductPage.form.addEyebrow')}
        title={t('categoryProductPage.form.addTitle')}
        description={t('categoryProductPage.form.addDescription')}
      />

      {errors.root?.message && <AuthAlert>{t(errors.root.message)}</AuthAlert>}

      <div className='space-y-2'>
        <Label htmlFor={`${ids}-game`} className={hudLabelClass}>{t('categoryProductPage.form.gameLabel')}</Label>
        <GamePicker
          id={`${ids}-game`}
          value={gameId}
          games={games}
          loading={gamesLoading}
          invalid={!!errors.game_id}
          onChange={(game) => {
            setValue('game_id', game.id, { shouldDirty: true, shouldValidate: isSubmitted })
            syncSlug(game.name, getValues('name'))
          }}
        />
        {!canListGames ? (
          <FieldMessage tone='warning'>{t('categoryProductPage.form.gamesForbidden')}</FieldMessage>
        ) : errors.game_id?.message ? (
          <FieldMessage tone='error'>{t(errors.game_id.message)}</FieldMessage>
        ) : (
          <p className='text-xs text-slate-500'>{t('categoryProductPage.form.gameHint')}</p>
        )}
      </div>

      <div className='grid gap-5 sm:grid-cols-[8rem_minmax(0,1fr)]'>
        <div className='space-y-2'>
          <p id={`${ids}-icon`} className={hudLabelClass}>{t('categoryProductPage.form.iconLabel')}</p>
          <ImageDropzone
            value={icon ?? ''}
            onChange={(url) => setValue('icon_url', url, { shouldDirty: true })}
            onUploadingChange={setUploading}
            aspectClassName='aspect-square'
            fit='contain'
            labelledBy={`${ids}-icon`}
            hint={t('imageDropzone.formatsShort')}
          />
        </div>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor={`${ids}-name`} className={hudLabelClass}>{t('categoryProductPage.form.nameLabel')}</Label>
            <Input
              id={`${ids}-name`}
              autoComplete='off'
              placeholder={t('categoryProductPage.form.namePlaceholder')}
              aria-invalid={!!errors.name}
              className={hudInputClass}
              {...nameField}
              onChange={(e) => {
                void nameField.onChange(e)
                syncSlug(gameName(getValues('game_id')), e.target.value)
              }}
            />
            {errors.name?.message && <FieldMessage tone='error'>{t(errors.name.message)}</FieldMessage>}
          </div>
          <div className='space-y-2'>
            <Label htmlFor={`${ids}-slug`} className={hudLabelClass}>{t('categoryProductPage.form.slugLabel')}</Label>
            <Input
              id={`${ids}-slug`}
              autoComplete='off'
              autoCapitalize='none'
              spellCheck={false}
              placeholder='mobile-legends-diamonds'
              aria-invalid={!!errors.slug}
              aria-describedby={`${ids}-slug-hint`}
              className={cn(hudInputClass, 'font-mono text-sm')}
              {...slugField}
              onChange={(e) => {
                slugTouched.current = true
                e.target.value = toSlug(e.target.value)
                void slugField.onChange(e)
              }}
            />
            {errors.slug?.message ? (
              <FieldMessage tone='error'>{t(errors.slug.message)}</FieldMessage>
            ) : (
              <p id={`${ids}-slug-hint`} className='text-xs text-slate-500'>{t('categoryProductPage.form.slugHint')}</p>
            )}
          </div>
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor={`${ids}-description`} className={hudLabelClass}>{t('categoryProductPage.form.descriptionLabel')}</Label>
        <Textarea
          id={`${ids}-description`}
          rows={3}
          placeholder={t('categoryProductPage.form.descriptionPlaceholder')}
          className='resize-none rounded-md border-slate-200 bg-slate-50 text-sm focus-visible:bg-white'
          {...register('description')}
        />
      </div>

      <label
        className={cn(
          'flex cursor-pointer items-center justify-between gap-4 rounded-md border px-4 py-3 transition-colors',
          isActive ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
        )}
      >
        <span className='min-w-0'>
          <span className='block text-sm font-medium text-slate-800'>{t('categoryProductPage.form.activeLabel')}</span>
          <span className='block text-xs text-slate-500'>{t('categoryProductPage.form.activeHint')}</span>
        </span>
        <Switch
          checked={!!isActive}
          onCheckedChange={(checked) => setValue('is_active', checked, { shouldDirty: true })}
          className='data-[state=checked]:bg-emerald-500'
        />
      </label>

      <FormFooter
        pending={create.isPending}
        disabled={uploading}
        cancelLabel={t('categoryProductPage.form.cancel')}
        submitLabel={t('categoryProductPage.form.create')}
        onCancel={onDone}
      />
    </form>
  )
}

function RenameForm({ category, onDone }: { category: CategoryProduct; onDone: () => void }) {
  const { t } = useTranslation('common')
  const ids = useId()
  const rename = useRenameCategoryProduct(onDone)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RenameCategoryProductValues>({
    resolver: zodResolver(renameCategoryProductSchema),
    defaultValues: { name: category.name },
  })
  const name = useWatch({ control, name: 'name' })
  const unchanged = name.trim() === category.name

  return (
    <form
      noValidate
      onSubmit={handleSubmit((v) => rename.mutate({ id: category.id, name: v.name }))}
      className='space-y-6 p-6 sm:p-7'
    >
      <DialogHeading
        eyebrow={t('categoryProductPage.form.editEyebrow')}
        title={t('categoryProductPage.form.editTitle')}
        description={t('categoryProductPage.form.editDescription')}
      />

      <div className='space-y-2'>
        <Label htmlFor={`${ids}-name`} className={hudLabelClass}>{t('categoryProductPage.form.nameLabel')}</Label>
        <Input
          id={`${ids}-name`}
          autoFocus
          autoComplete='off'
          aria-invalid={!!errors.name}
          className={hudInputClass}
          {...register('name')}
        />
        {errors.name?.message && <FieldMessage tone='error'>{t(errors.name.message)}</FieldMessage>}
      </div>

      <dl className='grid gap-3 rounded-md bg-slate-50 p-4 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_auto]'>
        <LockedFact label={t('categoryProductPage.form.gameLabel')}>
          <span className='inline-flex min-w-0 items-center gap-1.5'>
            <Gamepad2 className='size-3.5 shrink-0 text-slate-400' aria-hidden />
            <span className='truncate'>{category.game_name || '—'}</span>
          </span>
        </LockedFact>
        <LockedFact label={t('categoryProductPage.form.slugLabel')}>
          <span className='block truncate font-mono text-xs' title={category.slug}>{category.slug}</span>
        </LockedFact>
        <LockedFact label={t('categoryProductPage.form.statusLabel')}>
          {category.is_active ? t('categoryProductPage.status.active') : t('categoryProductPage.status.inactive')}
        </LockedFact>
        <p className='flex items-start gap-1.5 text-xs leading-relaxed text-slate-500 sm:col-span-full'>
          <Lock className='mt-0.5 size-3 shrink-0' aria-hidden />
          {t('categoryProductPage.form.lockedHint')}
        </p>
      </dl>

      <FormFooter
        pending={rename.isPending}
        disabled={unchanged}
        cancelLabel={t('categoryProductPage.form.cancel')}
        submitLabel={t('categoryProductPage.form.save')}
        onCancel={onDone}
      />
    </form>
  )
}

function LockedFact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='min-w-0'>
      <dt className='mb-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>{label}</dt>
      <dd className='min-w-0 font-medium text-slate-700'>{children}</dd>
    </div>
  )
}
