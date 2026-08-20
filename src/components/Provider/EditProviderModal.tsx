import { useEffect, useId, useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { useUpdateProvider } from '@/hooks/useProvider'
import {
  nbAccent,
  nbDialog,
  nbDialogBody,
  nbDialogButton,
  nbDialogFooter,
  nbDialogHeader,
  nbDialogIcon,
  nbDialogTitle,
  nbError,
  nbHint,
  nbIconButton,
  nbInput,
  nbLabel,
  nbTextarea,
} from '@/lib/nb'
import { cn } from '@/lib/utils'
import type { Provider, ProviderFormValues } from '@/types/provider'
import { Eye, EyeOff, Loader2, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type Props = {
  provider: Provider
}

export function EditProviderModal({ provider }: Props) {
  const { t } = useTranslation('common')
  const [showApiKey, setShowApiKey] = useState(false)
  const [open, setOpen] = useState(false)

  const nameId = useId()
  const codeId = useId()
  const apiUrlId = useId()
  const apiKeyId = useId()
  const priorityId = useId()
  const configId = useId()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProviderFormValues>()

  const mutation = useUpdateProvider()

  useEffect(() => {
    if (open && provider) {
      reset({
        name: provider.name,
        code: provider.code,
        api_url: provider.api_url,
        api_key_encrypted: provider.api_key_encrypted,
        priority: provider.priority,
        config: JSON.stringify(provider.config, null, 2),
      })
    } else if (!open) {
      reset()
      /* eslint-disable react-hooks/set-state-in-effect -- reset tampilan kunci API saat dialog ditutup */
      setShowApiKey(false)
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open, provider, reset])

  const onSubmit = (v: ProviderFormValues) => {
    const payload: Record<string, unknown> = { ...v, config: v.config }

    if (!v.api_key_encrypted) {
      delete payload.api_key_encrypted
    }

    mutation.mutate({
      id: provider.id,
      payload: payload as Provider,
    })
  }

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className={cn(nbIconButton, nbAccent.yellow)}
        aria-label={t('providerEdit.triggerAria', { name: provider.name })}
      >
        <Pencil className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={nbDialog} showCloseButton={false}>
          <div className={cn(nbDialogHeader, nbAccent.yellow)}>
            <DialogHeader className='gap-2 text-left'>
              <div className='flex items-center gap-2.5'>
                <span className={nbDialogIcon}>
                  <Pencil className='h-4 w-4' strokeWidth={3} aria-hidden />
                </span>
                <DialogTitle className={nbDialogTitle}>{t('providerEdit.title')}</DialogTitle>
              </div>
              <DialogDescription className={nbHint}>
                {t('providerEdit.description')}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className={cn(nbDialogBody, 'max-h-[70vh] overflow-y-auto')}
          >
            <div className='space-y-2'>
              <Label htmlFor={nameId} className={nbLabel}>
                {t('providerEdit.nameLabel')}
              </Label>
              <Input
                id={nameId}
                autoComplete='off'
                className={cn(nbInput, errors.name && 'nb-invalid')}
                aria-invalid={!!errors.name}
                {...register('name', { required: t('providerEdit.nameRequired') })}
              />
              {errors.name && (
                <p className={nbError} role='alert'>
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor={codeId} className={nbLabel}>
                {t('providerEdit.codeLabel')}
              </Label>
              <Input
                id={codeId}
                disabled
                className={cn(nbInput, 'bg-[#f5f1e8] font-mono disabled:opacity-100')}
                {...register('code')}
              />
              <p className={nbHint}>{t('providerEdit.codeHint')}</p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor={apiUrlId} className={nbLabel}>
                {t('providerEdit.apiUrlLabel')}
              </Label>
              <Input
                id={apiUrlId}
                autoComplete='off'
                className={cn(nbInput, errors.api_url && 'nb-invalid')}
                aria-invalid={!!errors.api_url}
                {...register('api_url', {
                  required: t('providerEdit.apiUrlRequired'),
                  pattern: {
                    value: /^https?:\/\//,
                    message: t('providerEdit.apiUrlInvalid'),
                  },
                })}
              />
              {errors.api_url && (
                <p className={nbError} role='alert'>
                  {errors.api_url.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor={apiKeyId} className={nbLabel}>
                {t('providerEdit.apiKeyLabel')}
              </Label>
              <p className={nbHint}>{t('providerEdit.apiKeyHint')}</p>
              <div className='relative'>
                <Input
                  id={apiKeyId}
                  type={showApiKey ? 'text' : 'password'}
                  autoComplete='off'
                  className={cn(nbInput, 'pr-12')}
                  placeholder={t('providerEdit.apiKeyPlaceholder')}
                  {...register('api_key_encrypted')}
                />
                <button
                  type='button'
                  onClick={() => setShowApiKey((prev) => !prev)}
                  className='nb-focus absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center border-2 border-[#111] bg-white'
                  aria-label={
                    showApiKey ? t('providerEdit.hideApiKey') : t('providerEdit.showApiKey')
                  }
                >
                  {showApiKey ? (
                    <EyeOff className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
                  ) : (
                    <Eye className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
                  )}
                </button>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor={priorityId} className={nbLabel}>
                {t('providerEdit.priorityLabel')}
              </Label>
              <Input
                id={priorityId}
                type='number'
                min={0}
                className={cn(nbInput, 'tabular-nums')}
                {...register('priority', { valueAsNumber: true })}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor={configId} className={nbLabel}>
                {t('providerEdit.configLabel')}
              </Label>
              <Textarea
                id={configId}
                rows={4}
                className={cn(
                  nbTextarea,
                  'max-h-36 min-h-[5rem] resize-y',
                  errors.config && 'nb-invalid',
                )}
                aria-invalid={!!errors.config}
                {...register('config', {
                  required: t('providerEdit.configRequired'),
                  validate: (value) => {
                    const s = typeof value === 'string' ? value : String(value ?? '')
                    try {
                      JSON.parse(s)
                      return true
                    } catch {
                      return t('providerEdit.configInvalid')
                    }
                  },
                })}
              />
              {errors.config?.message && (
                <p className={nbError} role='alert'>
                  {errors.config.message}
                </p>
              )}
            </div>

            <DialogFooter className={nbDialogFooter}>
              <button
                type='button'
                className={cn(nbDialogButton, nbAccent.white)}
                onClick={() => setOpen(false)}
              >
                {t('providerEdit.cancel')}
              </button>
              <button
                type='submit'
                disabled={mutation.isPending}
                className={cn(nbDialogButton, nbAccent.yellow)}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                    {t('providerEdit.saving')}
                  </>
                ) : (
                  t('providerEdit.save')
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
