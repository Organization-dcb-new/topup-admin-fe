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
import { useCreateProvider } from '@/hooks/useProvider'
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
  nbInput,
  nbLabel,
  nbTextarea,
} from '@/lib/nb'
import { cn } from '@/lib/utils'
import type { ProviderPayload } from '@/types/provider'
import { Building2, Eye, EyeOff, Loader2, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function CreateProviderModal() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const mutation = useCreateProvider({ setOpen })
  const [showApiKey, setShowApiKey] = useState(false)

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
  } = useForm<ProviderPayload>({
    defaultValues: {
      priority: 1,
      config: '{"timeout":5000}',
    },
  })

  useEffect(() => {
    if (!open) {
      reset()
      /* eslint-disable react-hooks/set-state-in-effect -- reset tampilan kunci API saat dialog ditutup */
      setShowApiKey(false)
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open, reset])

  return (
    <>
      <button
        type='button'
        className={cn(nbDialogButton, nbAccent.lime, 'h-10 w-full px-4 sm:w-auto')}
        onClick={() => setOpen(true)}
      >
        <Plus className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
        {t('providerCreate.trigger')}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={nbDialog} showCloseButton={false}>
          <div className={cn(nbDialogHeader, nbAccent.lime)}>
            <DialogHeader className='gap-2 text-left'>
              <div className='flex items-center gap-2.5'>
                <span className={nbDialogIcon}>
                  <Building2 className='h-4 w-4' strokeWidth={3} aria-hidden />
                </span>
                <DialogTitle className={nbDialogTitle}>{t('providerCreate.title')}</DialogTitle>
              </div>
              <DialogDescription className={nbHint}>
                {t('providerCreate.description')}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form
            onSubmit={handleSubmit((v) => mutation.mutate(v))}
            className={cn(nbDialogBody, 'max-h-[70vh] overflow-y-auto')}
          >
            {errors.root && (
              <div
                className='nb-frame nb-frame-thin nb-sd-sm bg-[#ff4d3d] p-3 text-xs font-black uppercase tracking-[0.12em]'
                role='alert'
              >
                {errors.root.message}
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor={nameId} className={nbLabel}>
                {t('providerCreate.nameLabel')}
              </Label>
              <Input
                id={nameId}
                autoComplete='off'
                placeholder={t('providerCreate.namePlaceholder')}
                className={cn(nbInput, errors.name && 'nb-invalid')}
                aria-invalid={!!errors.name}
                {...register('name', { required: t('providerCreate.nameRequired') })}
              />
              {errors.name && (
                <p className={nbError} role='alert'>
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor={codeId} className={nbLabel}>
                {t('providerCreate.codeLabel')}
              </Label>
              <Input
                id={codeId}
                autoComplete='off'
                placeholder={t('providerCreate.codePlaceholder')}
                className={cn(nbInput, 'font-mono', errors.code && 'nb-invalid')}
                aria-invalid={!!errors.code}
                {...register('code', { required: t('providerCreate.codeRequired') })}
              />
              {errors.code && (
                <p className={nbError} role='alert'>
                  {errors.code.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor={apiUrlId} className={nbLabel}>
                {t('providerCreate.apiUrlLabel')}
              </Label>
              <Input
                id={apiUrlId}
                autoComplete='off'
                placeholder={t('providerCreate.apiUrlPlaceholder')}
                className={cn(nbInput, errors.api_url && 'nb-invalid')}
                aria-invalid={!!errors.api_url}
                {...register('api_url', {
                  required: t('providerCreate.apiUrlRequired'),
                  pattern: {
                    value: /^https?:\/\//,
                    message: t('providerCreate.apiUrlInvalid'),
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
                {t('providerCreate.apiKeyLabel')}
              </Label>
              <p className={nbHint}>{t('providerCreate.apiKeyHint')}</p>
              <div className='relative'>
                <Input
                  id={apiKeyId}
                  type={showApiKey ? 'text' : 'password'}
                  autoComplete='off'
                  className={cn(nbInput, 'pr-12', errors.api_key_encrypted && 'nb-invalid')}
                  aria-invalid={!!errors.api_key_encrypted}
                  {...register('api_key_encrypted', {
                    required: t('providerCreate.apiKeyRequired'),
                  })}
                />
                <button
                  type='button'
                  onClick={() => setShowApiKey((v) => !v)}
                  className='nb-focus absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center border-2 border-[#111] bg-white'
                  aria-label={
                    showApiKey ? t('providerCreate.hideApiKey') : t('providerCreate.showApiKey')
                  }
                >
                  {showApiKey ? (
                    <EyeOff className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
                  ) : (
                    <Eye className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
                  )}
                </button>
              </div>
              {errors.api_key_encrypted && (
                <p className={nbError} role='alert'>
                  {errors.api_key_encrypted.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor={priorityId} className={nbLabel}>
                {t('providerCreate.priorityLabel')}
              </Label>
              <Input
                id={priorityId}
                type='number'
                min={0}
                className={cn(nbInput, 'tabular-nums')}
                {...register('priority', { valueAsNumber: true })}
              />
              <p className={nbHint}>{t('providerCreate.priorityHint')}</p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor={configId} className={nbLabel}>
                {t('providerCreate.configLabel')}
              </Label>
              <Textarea
                id={configId}
                rows={4}
                className={cn(
                  nbTextarea,
                  'max-h-36 min-h-[5rem] resize-y',
                  errors.config && 'nb-invalid',
                )}
                placeholder={t('providerCreate.configPlaceholder')}
                aria-invalid={!!errors.config}
                {...register('config', {
                  required: t('providerCreate.configRequired'),
                  validate: (v) => {
                    const s = typeof v === 'string' ? v : String(v ?? '')
                    try {
                      JSON.parse(s)
                      return true
                    } catch {
                      return t('providerCreate.configInvalid')
                    }
                  },
                })}
              />
              {errors.config && (
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
                {t('providerCreate.cancel')}
              </button>
              <button
                type='submit'
                disabled={mutation.isPending}
                className={cn(nbDialogButton, nbAccent.lime)}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                    {t('providerCreate.saving')}
                  </>
                ) : (
                  t('providerCreate.save')
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
