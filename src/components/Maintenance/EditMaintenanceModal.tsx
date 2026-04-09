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
  isoToDatetimeLocal,
  isMaintenanceWindowOrderInvalid,
} from '@/helpers/maintenance-datetime'
import { useUpdateMaintenance } from '@/hooks/useMaintenance'
import type { Maintenance, UpdateMaintenancePayload } from '@/types/maintenance'
import { cn } from '@/lib/utils'
import { Loader2, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type FormValues = {
  name: string
  is_maintenance: boolean
  start_time: string
  end_time: string
}

function maintenanceToForm(m: Maintenance): FormValues {
  return {
    name: m.name,
    is_maintenance: m.is_maintenance,
    start_time: isoToDatetimeLocal(m.start_time),
    end_time: isoToDatetimeLocal(m.end_time),
  }
}

function toUpdatePayload(v: FormValues): UpdateMaintenancePayload {
  return {
    name: v.name.trim(),
    is_maintenance: v.is_maintenance,
    start_time: v.start_time.trim()
      ? (datetimeLocalToIso(v.start_time) ?? null)
      : null,
    end_time: v.end_time.trim() ? (datetimeLocalToIso(v.end_time) ?? null) : null,
  }
}

export function EditMaintenanceModal({
  maintenance,
  triggerClassName,
}: {
  maintenance: Maintenance
  triggerClassName?: string
}) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const mutation = useUpdateMaintenance(maintenance.id, () => setOpen(false))
  const nameId = useId()
  const startId = useId()
  const endId = useId()

  const { register, handleSubmit, reset, watch, setValue, setError, clearErrors, formState } =
    useForm<FormValues>()

  const startTime = watch('start_time')
  const endTime = watch('end_time')

  useEffect(() => {
    clearErrors('root')
  }, [startTime, endTime, clearErrors])

  const openDialog = () => {
    reset(maintenanceToForm(maintenance))
    setOpen(true)
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('cursor-pointer', triggerClassName)}
        aria-label={t('maintenanceEditModal.triggerAria', { name: maintenance.name })}
        onClick={openDialog}
      >
        <Pencil className="h-4 w-4" aria-hidden />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-xl sm:max-w-lg">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {t('maintenanceEditModal.title')}
            </DialogTitle>
            <DialogDescription>{t('maintenanceEditModal.description')}</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit((v) => {
              if (isMaintenanceWindowOrderInvalid(v.start_time, v.end_time)) {
                setError('root', { message: t('maintenanceForm.orderInvalid') })
                return
              }
              mutation.mutate(toUpdatePayload(v))
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor={nameId}>{t('maintenanceForm.nameLabel')}</Label>
              <Input
                id={nameId}
                autoComplete="off"
                className="rounded-lg"
                aria-invalid={!!formState.errors.name}
                {...register('name', { required: t('maintenanceForm.nameRequired') })}
              />
              {formState.errors.name && (
                <p className="text-xs text-destructive">{formState.errors.name.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/80 bg-muted/20 px-3 py-2.5">
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium">{t('maintenanceForm.modeLabel')}</p>
                <p className="text-xs text-muted-foreground">{t('maintenanceForm.modeHint')}</p>
              </div>
              <Switch
                checked={watch('is_maintenance')}
                onCheckedChange={(c) => setValue('is_maintenance', c)}
                aria-label={t('maintenanceForm.modeAria')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={startId}>{t('maintenanceForm.startLabel')}</Label>
                <Input id={startId} type="datetime-local" className="rounded-lg" {...register('start_time')} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={endId}>{t('maintenanceForm.endLabel')}</Label>
                <Input id={endId} type="datetime-local" className="rounded-lg" {...register('end_time')} />
              </div>
            </div>

            {formState.errors.root?.message && (
              <p className="text-sm text-destructive" role="alert">
                {formState.errors.root.message}
              </p>
            )}

            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" className="cursor-pointer" onClick={() => setOpen(false)}>
                {t('maintenanceForm.cancel')}
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="cursor-pointer gap-2">
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
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
