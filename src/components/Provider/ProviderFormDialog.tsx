import { useId, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, KeyRound, Server } from 'lucide-react'

import { AuthAlert, AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { providerErrorMessage, useCreateProvider, useUpdateProvider } from '@/hooks/useProvider'
import { useRetained } from '@/hooks/useRetained'
import { cn } from '@/lib/utils'
import { providerSchema, type ProviderFormInput, type ProviderFormValues } from '@/schemas/provider'
import type { Provider, ProviderStatus } from '@/types/provider'

interface ProviderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Edit this provider; leave out to add one. */
  provider?: Provider
  /** Suggested priority for a new provider, e.g. after the last one. */
  nextPriority?: number
}

export function ProviderFormDialog({ open, onOpenChange, provider, nextPriority = 1 }: ProviderFormDialogProps) {
  const target = useRetained(open ? (provider ?? 'new') : null)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-xl'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {/* The retained target keeps the form filled while the dialog animates out; Radix unmounts it afterwards, so every opening still starts fresh. */}
        {target && (
          <ProviderForm
            key={target === 'new' ? 'new' : target.id}
            provider={target === 'new' ? undefined : target}
            nextPriority={nextPriority}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

const STATUSES: ProviderStatus[] = ['ACTIVE', 'INACTIVE']

function ProviderForm({ provider, nextPriority, onDone }: { provider?: Provider; nextPriority: number; onDone: () => void }) {
  const { t } = useTranslation('common')
  const ids = useId()
  const isEdit = !!provider
  const create = useCreateProvider(onDone)
  const update = useUpdateProvider(onDone)
  const pending = create.isPending || update.isPending
  const [showKey, setShowKey] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    setFocus,
    control,
    formState: { errors },
  } = useForm<ProviderFormInput, unknown, ProviderFormValues>({
    resolver: zodResolver(providerSchema(isEdit)),
    defaultValues: {
      name: provider?.name ?? '',
      code: provider?.code ?? '',
      api_url: provider?.api_url ?? '',
      api_key: '',
      priority: provider?.priority ?? nextPriority,
      status: provider?.status ?? 'ACTIVE',
      config: JSON.stringify(provider?.config ?? { timeout: 30 }, null, 2),
    },
  })
  const status = useWatch({ control, name: 'status' })
  const codeField = register('code')

  const onSubmit = (v: ProviderFormValues) => {
    const config = JSON.stringify(JSON.parse(v.config))
    if (provider) {
      update.mutate({
        id: provider.id,
        payload: {
          name: v.name,
          api_url: v.api_url,
          // The backend overwrites the key with whatever arrives, so an empty field resends the current one.
          api_key_encrypted: v.api_key.trim() || provider.api_key_encrypted,
          status: v.status,
          priority: v.priority,
          config,
        },
      })
      return
    }
    create.mutate(
      { name: v.name, code: v.code, api_url: v.api_url, api_key_encrypted: v.api_key.trim(), priority: v.priority, config },
      {
        onError: (err) => {
          if (providerErrorMessage(err) === 'provider code already exists') {
            setError('code', { message: 'providerPage.form.errors.codeTaken' })
            setFocus('code')
          } else {
            setError('root', { message: 'providerPage.form.errors.generic' })
          }
        },
      }
    )
  }

  const textField = (name: 'name' | 'api_url', extra?: string) => ({
    id: `${ids}-${name}`,
    'aria-invalid': !!errors[name],
    className: cn(hudInputClass, extra),
    ...register(name),
  })

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-5 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <Server className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{isEdit ? t('providerPage.form.editEyebrow') : t('providerPage.form.addEyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {isEdit ? t('providerPage.form.editTitle') : t('providerPage.form.addTitle')}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>
            {isEdit ? t('providerPage.form.editDescription') : t('providerPage.form.addDescription')}
          </DialogDescription>
        </div>
      </div>

      {errors.root?.message && <AuthAlert>{t(errors.root.message)}</AuthAlert>}

      <div className='grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]'>
        <div className='space-y-2'>
          <Label htmlFor={`${ids}-name`} className={hudLabelClass}>{t('providerPage.form.nameLabel')}</Label>
          <Input autoFocus autoComplete='off' placeholder='Digiflazz' {...textField('name')} />
          {errors.name?.message && <FieldMessage tone='error'>{t(errors.name.message)}</FieldMessage>}
        </div>
        <div className='space-y-2'>
          <Label htmlFor={`${ids}-code`} className={hudLabelClass}>{t('providerPage.form.codeLabel')}</Label>
          <Input
            id={`${ids}-code`}
            readOnly={isEdit}
            autoComplete='off'
            autoCapitalize='characters'
            spellCheck={false}
            placeholder='DIGIFLAZZ'
            aria-invalid={!!errors.code}
            className={cn(hudInputClass, 'font-mono uppercase read-only:cursor-not-allowed read-only:bg-slate-100 read-only:text-slate-500')}
            {...codeField}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase().replace(/\s+/g, '_')
              void codeField.onChange(e)
            }}
          />
          {errors.code?.message ? (
            <FieldMessage tone='error'>{t(errors.code.message)}</FieldMessage>
          ) : (
            isEdit && <p className='text-xs text-slate-500'>{t('providerPage.form.codeLocked')}</p>
          )}
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor={`${ids}-api_url`} className={hudLabelClass}>{t('providerPage.form.urlLabel')}</Label>
        <Input inputMode='url' autoComplete='off' spellCheck={false} placeholder='https://api.provider.com/v1/' {...textField('api_url', 'font-mono text-sm')} />
        {errors.api_url?.message && <FieldMessage tone='error'>{t(errors.api_url.message)}</FieldMessage>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor={`${ids}-key`} className={cn(hudLabelClass, 'flex items-center gap-1.5')}>
          <KeyRound className='size-3.5' aria-hidden />
          {t('providerPage.form.keyLabel')}
        </Label>
        <div className='relative'>
          <Input
            id={`${ids}-key`}
            type={showKey ? 'text' : 'password'}
            autoComplete='new-password'
            spellCheck={false}
            placeholder={isEdit ? t('providerPage.form.keyKeepPlaceholder') : ''}
            aria-invalid={!!errors.api_key}
            aria-describedby={`${ids}-key-hint`}
            className={cn(hudInputClass, 'pr-11 font-mono text-sm')}
            {...register('api_key')}
          />
          <button
            type='button'
            onClick={() => setShowKey((v) => !v)}
            aria-label={showKey ? t('providerPage.hideKey') : t('providerPage.showKey')}
            aria-pressed={showKey}
            className='absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 transition-colors hover:text-brand-purple focus-visible:text-brand-purple focus-visible:outline-none'
          >
            {showKey ? <EyeOff className='size-4' aria-hidden /> : <Eye className='size-4' aria-hidden />}
          </button>
        </div>
        {errors.api_key?.message ? (
          <FieldMessage tone='error'>{t(errors.api_key.message)}</FieldMessage>
        ) : (
          <p id={`${ids}-key-hint`} className='text-xs text-slate-500'>
            {isEdit ? t('providerPage.form.keyKeepHint') : t('providerPage.form.keyHint')}
          </p>
        )}
      </div>

      <div className='grid gap-4 sm:grid-cols-[9rem_minmax(0,1fr)]'>
        <div className='space-y-2'>
          <Label htmlFor={`${ids}-priority`} className={hudLabelClass}>{t('providerPage.form.priorityLabel')}</Label>
          <Input
            id={`${ids}-priority`}
            type='number'
            inputMode='numeric'
            min={0}
            step={1}
            aria-invalid={!!errors.priority}
            className={cn(hudInputClass, 'tabular-nums')}
            {...register('priority')}
          />
        </div>
        {isEdit ? (
          <div className='space-y-2'>
            <p className={hudLabelClass}>{t('providerPage.form.statusLabel')}</p>
            <div role='radiogroup' aria-label={t('providerPage.form.statusLabel')} className='grid grid-cols-2 gap-2'>
              {STATUSES.map((value) => {
                const selected = status === value
                return (
                  <button
                    key={value}
                    type='button'
                    role='radio'
                    aria-checked={selected}
                    onClick={() => setValue('status', value, { shouldDirty: true })}
                    className={cn(
                      'h-11 rounded-md px-3 text-sm font-medium ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40',
                      selected
                        ? value === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-300'
                          : 'bg-slate-100 text-slate-700 ring-slate-300'
                        : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50'
                    )}
                  >
                    {t(`providerPage.status.${value}`)}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <p className='self-end pb-2 text-xs leading-relaxed text-slate-500'>{t('providerPage.form.priorityHint')}</p>
        )}
      </div>
      {errors.priority?.message && <FieldMessage tone='error'>{t(errors.priority.message)}</FieldMessage>}

      <div className='space-y-2'>
        <Label htmlFor={`${ids}-config`} className={hudLabelClass}>{t('providerPage.form.configLabel')}</Label>
        <Textarea
          id={`${ids}-config`}
          rows={5}
          spellCheck={false}
          aria-invalid={!!errors.config}
          className='resize-y rounded-md border-slate-200 bg-slate-950 font-mono text-xs leading-relaxed text-slate-100 focus-visible:border-brand-purple/50'
          {...register('config')}
        />
        {errors.config?.message ? (
          <FieldMessage tone='error'>{t(errors.config.message)}</FieldMessage>
        ) : (
          <p className='text-xs text-slate-500'>{t('providerPage.form.configHint')}</p>
        )}
      </div>

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onDone}
          disabled={pending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('providerPage.form.cancel')}
        </button>
        <div className='sm:min-w-52'>
          <AuthSubmitButton pending={pending} pendingLabel={t('providerPage.form.saving')} cooldown={0}>
            {isEdit ? t('providerPage.form.save') : t('providerPage.form.create')}
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  )
}
