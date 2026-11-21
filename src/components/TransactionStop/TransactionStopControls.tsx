import { useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Ban, Clock, Loader2, Lock, Play, Save } from 'lucide-react'

import { FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { formatDuration } from '@/components/Maintenance/maintenance-status'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  addMinutesToDatetimeLocal,
  datetimeLocalToIso,
  isoToDatetimeLocal,
  nowAsDatetimeLocal,
} from '@/helpers/maintenance-datetime'
import { useNow } from '@/hooks/useNow'
import { cn } from '@/lib/utils'
import { charCount } from '@/schemas/announcement'
import {
  TRANSACTION_STOP_DEFAULT_MESSAGE,
  TRANSACTION_STOP_MESSAGE_MAX,
  transactionStopSchema,
  type TransactionStopFormValues,
} from '@/schemas/transaction-stop'
import type { TransactionStop, UpdateTransactionStopPayload } from '@/types/transaction-stop'

/** Quick picks for the reopen time, in minutes from now. */
const RESUME_PRESETS = [30, 60, 120, 240]

const actionButtonClass =
  'relative inline-flex h-11 items-center justify-center gap-2 px-5 font-display text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap text-white hud-clip-sm transition-[background-color,transform,opacity] duration-300 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/90 disabled:opacity-60'

interface TransactionStopControlsProps {
  state: TransactionStop
  /** A mutation is running; every button waits. */
  pending: boolean
  /** Running: the form is valid, ask before stopping with these values. */
  onStop: (payload: UpdateTransactionStopPayload) => void
  /** Stopped: save the message / reopen time without switching anything. */
  onSave: (payload: UpdateTransactionStopPayload) => void
  /** Stopped: ask before reopening. */
  onResume: () => void
}

function defaultValues(state: TransactionStop): TransactionStopFormValues {
  return {
    // Kept by the server after a stop ends, so the next stop can start from it.
    message: state.message,
    // A reopen time only means something while stopped; once passed it would fail validation.
    resume_at: state.is_stopped ? isoToDatetimeLocal(state.resume_at) : '',
  }
}

/**
 * Message and reopen time, plus the one switch. The parent keys this on the server state, so a save,
 * a stop or a change from elsewhere starts the form again from what the server holds.
 */
export function TransactionStopControls({ state, pending, onStop, onSave, onResume }: TransactionStopControlsProps) {
  const { t } = useTranslation()
  const ids = useId()
  const now = useNow()
  const stopped = state.is_stopped

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitted, isDirty },
  } = useForm<TransactionStopFormValues>({
    resolver: zodResolver(transactionStopSchema),
    defaultValues: defaultValues(state),
  })
  const [message, resumeAt] = useWatch({ control, name: ['message', 'resume_at'] })

  // Presets and "clear" bypass the input, so re-check once the admin has tried to submit.
  const setResume = (value: string) => setValue('resume_at', value, { shouldDirty: true, shouldValidate: isSubmitted })

  const onSubmit = (values: TransactionStopFormValues) => {
    const payload: UpdateTransactionStopPayload = {
      is_stopped: true,
      message: values.message,
      // Replaced on every call: null takes a reopen time away.
      resume_at: datetimeLocalToIso(values.resume_at) ?? null,
    }
    if (stopped) onSave(payload)
    else onStop(payload)
  }

  return (
    <section className='min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both [animation-delay:60ms]'>
      <div className='h-full bg-slate-200/80 p-px hud-clip'>
        <div className='flex h-full flex-col bg-white hud-clip'>
          <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
          <form noValidate onSubmit={handleSubmit(onSubmit)} className='flex flex-1 flex-col gap-6 p-5 sm:p-6'>
            <div className='space-y-1'>
              <p className={hudEyebrowClass}>{t('transactionStopPage.form.eyebrow')}</p>
              <h2 className='font-display text-xl font-bold tracking-tight text-slate-900'>
                {stopped ? t('transactionStopPage.form.titleStopped') : t('transactionStopPage.form.titleRunning')}
              </h2>
              <p className='text-sm leading-relaxed text-slate-500'>
                {stopped ? t('transactionStopPage.form.descriptionStopped') : t('transactionStopPage.form.descriptionRunning')}
              </p>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between gap-3'>
                <Label htmlFor={`${ids}-message`} className={hudLabelClass}>
                  {t('transactionStopPage.form.messageLabel')}
                </Label>
                <Counter value={message} max={TRANSACTION_STOP_MESSAGE_MAX} />
              </div>
              <Textarea
                id={`${ids}-message`}
                rows={3}
                placeholder={TRANSACTION_STOP_DEFAULT_MESSAGE}
                aria-invalid={!!errors.message}
                aria-describedby={`${ids}-message-hint`}
                className='max-h-48 resize-none rounded-md border-slate-200 bg-slate-50 text-sm focus-visible:bg-white'
                {...register('message')}
              />
              {errors.message?.message ? (
                <FieldMessage tone='error'>{t(errors.message.message)}</FieldMessage>
              ) : (
                <p id={`${ids}-message-hint`} className='text-xs text-slate-500'>
                  {t('transactionStopPage.form.messageHint')}
                </p>
              )}
            </div>

            <fieldset className='space-y-3'>
              <div className='flex h-5 items-center justify-between gap-3'>
                <legend className={hudLabelClass}>{t('transactionStopPage.form.resumeLabel')}</legend>
                <span className='flex items-center gap-2'>
                  {resumeAt && (
                    <button
                      type='button'
                      onClick={() => setResume('')}
                      className='rounded px-1 text-[11px] font-medium text-slate-400 transition-colors hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'
                    >
                      {t('transactionStopPage.form.clear')}
                    </button>
                  )}
                  <span className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>
                    {t('transactionStopPage.wib')}
                  </span>
                </span>
              </div>
              <Input
                id={`${ids}-resume`}
                type='datetime-local'
                min={isoToDatetimeLocal(new Date(now).toISOString())}
                aria-label={t('transactionStopPage.form.resumeLabel')}
                aria-invalid={!!errors.resume_at}
                aria-describedby={`${ids}-resume-hint`}
                className={cn(hudInputClass, 'tabular-nums')}
                {...register('resume_at')}
              />
              <div className='flex flex-wrap items-center gap-2'>
                <span className='inline-flex items-center gap-1 text-xs text-slate-500'>
                  <Clock className='size-3.5' aria-hidden />
                  {t('transactionStopPage.form.resumeIn')}
                </span>
                {RESUME_PRESETS.map((minutes) => (
                  <button
                    key={minutes}
                    type='button'
                    onClick={() => setResume(addMinutesToDatetimeLocal(nowAsDatetimeLocal(), minutes))}
                    className='h-7 bg-slate-100 px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600 hud-clip-sm transition-colors hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40'
                  >
                    {formatDuration(minutes, t)}
                  </button>
                ))}
              </div>
              {errors.resume_at?.message ? (
                <FieldMessage tone='error'>{t(errors.resume_at.message)}</FieldMessage>
              ) : (
                <p id={`${ids}-resume-hint`} className='text-xs text-slate-500'>
                  {t('transactionStopPage.form.resumeHint')}
                </p>
              )}
            </fieldset>

            <div className='mt-auto flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end'>
              {stopped ? (
                <>
                  <button
                    type='submit'
                    disabled={pending || !isDirty}
                    className='inline-flex h-11 items-center justify-center gap-2 bg-slate-100 px-5 text-sm font-medium whitespace-nowrap text-slate-700 hud-clip-sm transition-colors duration-200 hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/50 disabled:opacity-50'
                  >
                    {pending ? <Loader2 className='size-4 animate-spin' aria-hidden /> : <Save className='size-4' aria-hidden />}
                    {t('transactionStopPage.form.saveBtn')}
                  </button>
                  <button
                    type='button'
                    onClick={onResume}
                    disabled={pending}
                    className={cn(actionButtonClass, 'bg-emerald-600 hover:bg-emerald-700')}
                  >
                    <Play className='size-4' aria-hidden />
                    {t('transactionStopPage.form.resumeBtn')}
                  </button>
                </>
              ) : (
                <button type='submit' disabled={pending} className={cn(actionButtonClass, 'bg-rose-600 hover:bg-rose-700')}>
                  <Ban className='size-4' aria-hidden />
                  {t('transactionStopPage.form.stopBtn')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
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

/** In place of the controls for admins who may only look. */
export function TransactionStopReadOnly() {
  const { t } = useTranslation()
  return (
    <section className='min-w-0 animate-in fade-in duration-500'>
      <div className='flex h-full items-start gap-4 rounded-xl border border-dashed border-slate-300 bg-white p-5 sm:p-6'>
        <span className='grid size-10 shrink-0 place-items-center bg-slate-100 text-slate-500 hud-clip-sm'>
          <Lock className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <h2 className='font-display text-lg font-bold text-slate-900'>{t('transactionStopPage.readOnly.title')}</h2>
          <p className='text-sm leading-relaxed text-slate-500'>{t('transactionStopPage.readOnly.body')}</p>
        </div>
      </div>
    </section>
  )
}
