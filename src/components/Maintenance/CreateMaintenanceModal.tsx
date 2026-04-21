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
import { Switch } from '@/components/ui/switch'
import {
  datetimeLocalToIso,
  isMaintenanceWindowOrderInvalid,
} from '@/helpers/maintenance-datetime'
import { useCreateMaintenance } from '@/hooks/useMaintenance'
import type { CreateMaintenancePayload } from '@/types/maintenance'
import { Loader2, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type FormValues = {
  name: string
  is_maintenance: boolean
  start_time: string
  end_time: string
}

function toCreatePayload(v: FormValues): CreateMaintenancePayload {
  const body: CreateMaintenancePayload = {
    name: v.name.trim(),
    is_maintenance: v.is_maintenance,
  }
  const s = datetimeLocalToIso(v.start_time)
  const e = datetimeLocalToIso(v.end_time)
  if (s) body.start_time = s
  if (e) body.end_time = e
  return body
}

export function CreateMaintenanceModal() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const mutation = useCreateMaintenance(() => setOpen(false))
  const nameId = useId()
  const startId = useId()
  const endId = useId()

  const { register, handleSubmit, reset, watch, setValue, setError, clearErrors, formState } =
    useForm<FormValues>({
      defaultValues: {
        name: '',
        is_maintenance: false,
        start_time: '',
        end_time: '',
      },
    })

  const startTime = watch('start_time')
  const endTime = watch('end_time')

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const nameVal = watch('name')

  useEffect(() => {
    clearErrors('root')
  }, [startTime, endTime, nameVal, clearErrors])

  return (
    <>
      <Button type='button' className='h-10 shrink-0 gap-2 shadow-sm' onClick={() => setOpen(true)}>
        <Plus className='h-4 w-4' aria-hidden />
        {t('maintenanceCreateModal.trigger')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='rounded-xl sm:max-w-lg'>
          <DialogHeader className='space-y-1 text-left'>
            <DialogTitle className='text-lg font-semibold tracking-tight'>
              {t('maintenanceCreateModal.title')}
            </DialogTitle>
            <DialogDescription>{t('maintenanceCreateModal.description')}</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit((v) => {
              if (isMaintenanceWindowOrderInvalid(v.start_time, v.end_time)) {
                setError('root', { message: t('maintenanceForm.orderInvalid') })
                return
              }
              mutation.mutate(toCreatePayload(v))
            })}
            className='space-y-4'
          >
            <div className='space-y-2'>
              <Label htmlFor={nameId}>{t('maintenanceForm.nameLabel')}</Label>
              <Input
                id={nameId}
                autoComplete='off'
                placeholder={t('maintenanceForm.namePlaceholder')}
                className='rounded-lg'
                aria-invalid={!!formState.errors.name}
                {...register('name', {
                  required: t('maintenanceForm.nameRequired'),
                  validate: (v) => v.trim().length > 0 || t('maintenanceForm.nameRequired'),
                })}
              />
              {formState.errors.name && (
                <p className='text-xs text-destructive'>{formState.errors.name.message}</p>
              )}
            </div>

            <div className='flex items-center justify-between gap-4 rounded-lg border border-border/80 bg-muted/20 px-3 py-2.5'>
              <div className='min-w-0 space-y-0.5'>
                <p className='text-sm font-medium'>{t('maintenanceForm.modeLabel')}</p>
                <p className='text-xs text-muted-foreground'>{t('maintenanceForm.modeHint')}</p>
              </div>
              <Switch
                checked={watch('is_maintenance')}
                onCheckedChange={(c) => setValue('is_maintenance', c)}
                aria-label={t('maintenanceForm.modeAria')}
              />
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2 sm:col-span-2'>
                <Label htmlFor={startId}>{t('maintenanceForm.startLabel')}</Label>
                <Input
                  id={startId}
                  type='datetime-local'
                  className='rounded-lg'
                  aria-invalid={!!formState.errors.start_time}
                  {...register('start_time', { required: t('maintenanceForm.startRequired') })}
                />
                {formState.errors.start_time && (
                  <p className='text-xs text-destructive'>{formState.errors.start_time.message}</p>
                )}
              </div>
              <div className='space-y-2 sm:col-span-2'>
                <Label htmlFor={endId}>{t('maintenanceForm.endLabel')}</Label>
                <Input
                  id={endId}
                  type='datetime-local'
                  className='rounded-lg'
                  aria-invalid={!!formState.errors.end_time}
                  {...register('end_time', { required: t('maintenanceForm.endRequired') })}
                />
                {formState.errors.end_time && (
                  <p className='text-xs text-destructive'>{formState.errors.end_time.message}</p>
                )}
              </div>
            </div>

            {formState.errors.root?.message && (
              <p className='text-sm text-destructive' role='alert'>
                {formState.errors.root.message}
              </p>
            )}

            <DialogFooter className='gap-2 sm:gap-2'>
              <Button type='button' variant='outline' className='cursor-pointer' onClick={() => setOpen(false)}>
                {t('maintenanceForm.cancel')}
              </Button>
              <Button type='submit' disabled={mutation.isPending} className='cursor-pointer gap-2'>
                {mutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                    {t('maintenanceForm.saving')}
                  </>
                ) : (
                  t('maintenanceForm.save')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
