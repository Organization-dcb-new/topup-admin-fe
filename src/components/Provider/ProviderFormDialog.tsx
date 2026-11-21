import { useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { KeyRound, Server } from 'lucide-react'

import { AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ProviderCredentials } from '@/components/Provider/ProviderCredentials'
import { useUpdateProvider } from '@/hooks/useProvider'
import { useRetained } from '@/hooks/useRetained'
import { cn } from '@/lib/utils'
import { providerSchema, type ProviderFormInput, type ProviderFormValues } from '@/schemas/provider'
import type { Provider, ProviderStatus } from '@/types/provider'

interface ProviderFormDialogProps {
  /** The provider to edit; the dialog is open while one is set. Providers are created by the backend, never here. */
  provider: Provider | null
  onClose: () => void
}

export function ProviderFormDialog({ provider, onClose }: ProviderFormDialogProps) {
  const target = useRetained(provider)
  return (
    <Dialog open={provider !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-xl'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {/* The retained target keeps the form filled while the dialog animates out; Radix unmounts it afterwards, so every opening still starts fresh. */}
        {target && <ProviderForm key={target.id} provider={target} onDone={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

const STATUSES: ProviderStatus[] = ['ACTIVE', 'INACTIVE']

function ProviderForm({ provider, onDone }: { provider: Provider; onDone: () => void }) {
  const { t } = useTranslation('common')
  const ids = useId()
  const update = useUpdateProvider(onDone)
  // The backend refuses to switch on a provider it has no integration for.
  const canActivate = provider.supported !== false

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProviderFormInput, unknown, ProviderFormValues>({
    resolver: zodResolver(providerSchema()),
    defaultValues: {
      api_url: provider.api_url,
      priority: provider.priority,
      status: provider.status,
      config: JSON.stringify(provider.config ?? {}, null, 2),
    },
  })
  const status = useWatch({ control, name: 'status' })

  const onSubmit = (v: ProviderFormValues) => {
    update.mutate({
      id: provider.id,
      payload: {
        api_url: v.api_url,
        status: v.status,
        priority: v.priority,
        config: JSON.stringify(JSON.parse(v.config)),
      },
    })
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-5 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <Server className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{t('providerPage.form.editEyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {t('providerPage.form.editTitle', { name: provider.name })}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>
            <span className='font-mono text-xs text-slate-600'>{provider.code}</span>
            <span aria-hidden> · </span>
            {t('providerPage.form.editDescription')}
          </DialogDescription>
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor={`${ids}-api_url`} className={hudLabelClass}>{t('providerPage.form.urlLabel')}</Label>
        <Input
          id={`${ids}-api_url`}
          autoFocus
          inputMode='url'
          autoComplete='off'
          spellCheck={false}
          placeholder='https://api.provider.com/v1/'
          aria-invalid={!!errors.api_url}
          className={cn(hudInputClass, 'font-mono text-sm')}
          {...register('api_url')}
        />
        {errors.api_url?.message && <FieldMessage tone='error'>{t(errors.api_url.message)}</FieldMessage>}
      </div>

      {/* Credentials are read from the server env, so the form only says which variables they are. */}
      <div className='space-y-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5'>
        <p className={cn(hudLabelClass, 'flex items-center gap-1.5')}>
          <KeyRound className='size-3.5' aria-hidden />
          {t('providerPage.form.credentialsLabel')}
        </p>
        <ProviderCredentials credentials={provider.credentials} />
        <p className='text-xs leading-relaxed text-slate-500'>{t('providerPage.form.credentialsEditHint')}</p>
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
        <div className='space-y-2'>
          <p className={hudLabelClass}>{t('providerPage.form.statusLabel')}</p>
          <div role='radiogroup' aria-label={t('providerPage.form.statusLabel')} className='grid grid-cols-2 gap-2'>
            {STATUSES.map((value) => {
              const selected = status === value
              const disabled = value === 'ACTIVE' && !canActivate
              return (
                <button
                  key={value}
                  type='button'
                  role='radio'
                  aria-checked={selected}
                  disabled={disabled}
                  title={disabled ? t('providerPage.unsupportedHint') : undefined}
                  onClick={() => setValue('status', value, { shouldDirty: true })}
                  className={cn(
                    'h-11 rounded-md px-3 text-sm font-medium ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:cursor-not-allowed disabled:opacity-50',
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
          {!canActivate && <p className='text-xs leading-relaxed text-amber-700'>{t('providerPage.unsupportedHint')}</p>}
        </div>
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
          disabled={update.isPending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('providerPage.form.cancel')}
        </button>
        <div className='sm:min-w-52'>
          <AuthSubmitButton pending={update.isPending} pendingLabel={t('providerPage.form.saving')} cooldown={0}>
            {t('providerPage.form.save')}
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  )
}
