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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateProvider } from '@/hooks/useProvider'
import type { ProviderPayload } from '@/types/provider'
import { Eye, EyeOff, Loader2, Plus } from 'lucide-react'
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
      <Button
        type='button'
        className='h-10 shrink-0 gap-2 shadow-sm'
        onClick={() => setOpen(true)}
      >
        <Plus className='h-4 w-4' aria-hidden />
        {t('providerCreate.trigger')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='rounded-xl sm:max-w-lg'>
          <DialogHeader className='space-y-1 text-left'>
            <DialogTitle className='text-lg font-semibold tracking-tight'>{t('providerCreate.title')}</DialogTitle>
            <DialogDescription>
              {t('providerCreate.description')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className='space-y-4'>
            {errors.root && (
              <div className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive' role='alert'>
                {errors.root.message}
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor={nameId} className='text-sm font-medium'>
                {t('providerCreate.nameLabel')}
              </Label>
              <Input
                id={nameId}
                autoComplete='off'
                placeholder={t('providerCreate.namePlaceholder')}
                className='rounded-lg'
                aria-invalid={!!errors.name}
                {...register('name', { required: t('providerCreate.nameRequired') })}
              />
              {errors.name && <p className='text-xs text-destructive'>{errors.name.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor={codeId} className='text-sm font-medium'>
                {t('providerCreate.codeLabel')}
              </Label>
              <Input
                id={codeId}
                autoComplete='off'
                placeholder={t('providerCreate.codePlaceholder')}
                className='rounded-lg font-mono text-sm'
                aria-invalid={!!errors.code}
                {...register('code', { required: t('providerCreate.codeRequired') })}
              />
              {errors.code && <p className='text-xs text-destructive'>{errors.code.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor={apiUrlId} className='text-sm font-medium'>
                {t('providerCreate.apiUrlLabel')}
              </Label>
              <Input
                id={apiUrlId}
                autoComplete='off'
                placeholder={t('providerCreate.apiUrlPlaceholder')}
                className='rounded-lg'
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
                <p className='text-xs text-destructive'>{errors.api_url.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor={apiKeyId} className='text-sm font-medium'>
                {t('providerCreate.apiKeyLabel')}
              </Label>
              <p className='text-xs text-muted-foreground'>
                {t('providerCreate.apiKeyHint')}
              </p>
              <div className='relative'>
                <Input
                  id={apiKeyId}
                  type={showApiKey ? 'text' : 'password'}
                  autoComplete='off'
                  className='rounded-lg pr-10'
                  aria-invalid={!!errors.api_key_encrypted}
                  {...register('api_key_encrypted', {
                    required: t('providerCreate.apiKeyRequired'),
                  })}
                />
                <button
                  type='button'
                  onClick={() => setShowApiKey((v) => !v)}
                  className='absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground'
                  aria-label={showApiKey ? t('providerCreate.hideApiKey') : t('providerCreate.showApiKey')}
                >
                  {showApiKey ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </button>
              </div>
              {errors.api_key_encrypted && (
                <p className='text-xs text-destructive'>{errors.api_key_encrypted.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor={priorityId} className='text-sm font-medium'>
                {t('providerCreate.priorityLabel')}
              </Label>
              <Input
                id={priorityId}
                type='number'
                min={0}
                className='rounded-lg'
                {...register('priority', { valueAsNumber: true })}
              />
              <p className='text-xs text-muted-foreground'>{t('providerCreate.priorityHint')}</p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor={configId} className='text-sm font-medium'>
                {t('providerCreate.configLabel')}
              </Label>
              <Textarea
                id={configId}
                rows={4}
                className='max-h-36 min-h-[5rem] resize-y rounded-lg font-mono text-sm'
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
              {errors.config && <p className='text-xs text-destructive'>{errors.config.message}</p>}
            </div>

            <DialogFooter className='gap-2 sm:gap-2'>
              <Button
                type='button'
                variant='outline'
                className='rounded-xl'
                onClick={() => setOpen(false)}
              >
                {t('providerCreate.cancel')}
              </Button>
              <Button
                type='submit'
                disabled={mutation.isPending}
                className='inline-flex items-center gap-2 rounded-xl'
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 shrink-0 animate-spin' aria-hidden />
                    {t('providerCreate.saving')}
                  </>
                ) : (
                  t('providerCreate.save')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
