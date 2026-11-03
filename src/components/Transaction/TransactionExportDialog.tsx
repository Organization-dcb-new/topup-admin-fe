import { useId, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarClock, FileDown, Info } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { AuthSubmitButton } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PERM } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { useExportTransactions } from '@/hooks/useTransaction'
import { rangeToQuery } from './transaction-filters'
import { PAYMENT_STATUSES } from './transaction-meta'
import { PaymentMethodField } from './TransactionPickers'

const ALL = '__all__'

/** What the export starts from: the list's own date, status and payment-method filters. */
export interface TransactionExportDefaults {
  range: DateRange | undefined
  status: string
  paymentMethodId: string
}

interface TransactionExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Bumped on every opening, so the form starts again from the current list filters. */
  session: number
  defaults: TransactionExportDefaults
  /** The list also filters by search, game or amount, which the CSV endpoint can't apply. */
  hasUnsupportedFilters: boolean
}

export function TransactionExportDialog({ open, onOpenChange, session, defaults, hasUnsupportedFilters }: TransactionExportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className='gap-0 overflow-hidden rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg'>
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        <ExportForm key={session} defaults={defaults} hasUnsupportedFilters={hasUnsupportedFilters} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

interface ExportFormProps {
  defaults: TransactionExportDefaults
  hasUnsupportedFilters: boolean
  onClose: () => void
}

function ExportForm({ defaults, hasUnsupportedFilters, onClose }: ExportFormProps) {
  const { t } = useTranslation('common')
  const ids = useId()
  const { can } = usePermissions()
  const [range, setRange] = useState(defaults.range)
  const [status, setStatus] = useState(defaults.status)
  const [paymentMethodId, setPaymentMethodId] = useState(defaults.paymentMethodId)
  const exporter = useExportTransactions(onClose)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    exporter.mutate({ ...rangeToQuery(range), status: status || undefined, paymentMethodId: paymentMethodId || undefined })
  }

  return (
    <form noValidate onSubmit={submit} className='space-y-6 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <FileDown className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{t('transactionPage.export.eyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {t('transactionPage.export.title')}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>{t('transactionPage.export.description')}</DialogDescription>
        </div>
      </div>

      <div className='space-y-2'>
        <p id={`${ids}-range`} className={hudLabelClass}>
          {t('transactionPage.export.range')}
        </p>
        <div role='group' aria-labelledby={`${ids}-range`}>
          <DateRangeFilter value={range} onChange={setRange} placeholder={t('transactionPage.export.allDates')} />
        </div>
        {!range?.from && (
          <p className='flex items-start gap-2 text-xs leading-relaxed text-amber-700'>
            <CalendarClock className='mt-px size-3.5 shrink-0' aria-hidden />
            {t('transactionPage.export.allDatesHint')}
          </p>
        )}
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='space-y-2'>
          <label htmlFor={`${ids}-status`} className={hudLabelClass}>
            {t('transactionPage.filters.status')}
          </label>
          <Select value={status || ALL} onValueChange={(v) => setStatus(v === ALL ? '' : v)}>
            <SelectTrigger id={`${ids}-status`} className='h-10 w-full bg-white'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('transactionPage.filters.allStatuses')}</SelectItem>
              {PAYMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`paymentStatus.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {can(PERM.paymentMethodView) && (
          <div className='space-y-2'>
            <label htmlFor={`${ids}-method`} className={hudLabelClass}>
              {t('transactionPage.filters.paymentMethod')}
            </label>
            <PaymentMethodField id={`${ids}-method`} value={paymentMethodId} onChange={setPaymentMethodId} />
          </div>
        )}
      </div>

      {hasUnsupportedFilters && (
        <p className='flex items-start gap-2 rounded-md bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600'>
          <Info className='mt-px size-3.5 shrink-0 text-brand-purple' aria-hidden />
          {t('transactionPage.export.unsupportedFilters')}
        </p>
      )}

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onClose}
          disabled={exporter.isPending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('transactionPage.export.cancel')}
        </button>
        <div className='sm:min-w-52'>
          <AuthSubmitButton pending={exporter.isPending} pendingLabel={t('transactionPage.export.pending')} cooldown={0}>
            {t('transactionPage.export.submit')}
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  )
}
