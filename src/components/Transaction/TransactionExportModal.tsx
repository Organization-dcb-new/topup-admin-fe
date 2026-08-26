import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, CalendarRange, Download, Loader2 } from 'lucide-react'
import TransactionDateFilter from './TransactionDateFilter'
import TransactionStatusFilter from './TransactionStatusFilter'
import TransactionPaymentMethodFilter from './TransactionPaymentMethodFilter'
import type { PaymentStatus } from '@/types/transaction'
import type { DateRange } from 'react-day-picker'
import { format, startOfDay, subDays } from 'date-fns'
import { api } from '@/api/axios'
import { apiErrorMessage } from '@/lib/api-error'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const DATETIME_PATTERN = 'yyyy-MM-dd HH:mm:ss'

/** Sinkron dengan BE (`maxExportRange = 31 * 24 * time.Hour`). */
const MAX_RANGE_MS = 31 * 24 * 60 * 60 * 1000

/**
 * Respons galat export datang sebagai Blob (karena `responseType: 'blob'`),
 * jadi `message` JSON-nya perlu dibaca dulu sebelum diserahkan ke
 * `apiErrorMessage` — tanpa ini pesan BE (mis. rentang > 31 hari) tidak pernah
 * sampai ke operator.
 */
async function normalizeBlobError(err: unknown): Promise<unknown> {
  const e = err as { response?: { data?: unknown } }
  const body = e?.response?.data
  if (e.response && body instanceof Blob) {
    try {
      const parsed = JSON.parse(await body.text()) as { message?: string }
      if (parsed && typeof parsed.message === 'string') {
        e.response.data = parsed
      }
    } catch {
      // Bukan JSON — biarkan apa adanya, apiErrorMessage jatuh ke fallback.
    }
  }
  return err
}

export default function TransactionExportModal() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [status, setStatus] = useState<'' | PaymentStatus>('')
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const { startDate, endDate } = useMemo(() => {
    const from = dateRange?.from
    const to = dateRange?.to
    return {
      startDate: from ? format(from, DATETIME_PATTERN) : '',
      endDate: to ? format(to, DATETIME_PATTERN) : '',
    }
  }, [dateRange])

  const hasCompleteRange = Boolean(dateRange?.from && dateRange?.to)
  const rangeTooLong = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return false
    return dateRange.to.getTime() - dateRange.from.getTime() > MAX_RANGE_MS
  }, [dateRange])

  const canExport = hasCompleteRange && !rangeTooLong && !isExporting

  const applyPreset = (days: number) => {
    const now = new Date()
    const to = new Date(now)
    to.setHours(23, 59, 59, 0)
    const from = days <= 1 ? startOfDay(now) : startOfDay(subDays(now, days - 1))
    setDateRange({ from, to })
  }

  const presets = [
    { key: 'today', label: t('transactionPage.export.presetToday'), days: 1 },
    { key: '7d', label: t('transactionPage.export.preset7d'), days: 7 },
    { key: '30d', label: t('transactionPage.export.preset30d'), days: 30 },
  ]

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setDateRange(undefined)
      setStatus('')
      setPaymentMethodId('')
    }
    setOpen(val)
  }

  const handleExport = async () => {
    if (!canExport) return
    setIsExporting(true)
    try {
      const response = await api.get('/transactions/export-csv', {
        params: {
          start_date: startDate,
          end_date: endDate,
          ...(status && { status }),
          ...(paymentMethodId && { payment_method_id: paymentMethodId }),
        },
        responseType: 'blob',
      })

      let filename = 'payments_export.csv'
      const disposition = response.headers['content-disposition']
      if (disposition && disposition.includes('filename=')) {
        const filenameMatch = disposition.match(/filename="?([^"]+)"?/)
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1]
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]))
      try {
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
      } finally {
        window.URL.revokeObjectURL(url)
      }

      toast.success(t('transactionPage.exportSuccess'))
      setOpen(false)
      setDateRange(undefined)
      setStatus('')
      setPaymentMethodId('')
    } catch (error) {
      const normalized = await normalizeBlobError(error)
      toast.error(apiErrorMessage(normalized, t('transactionPage.exportError')))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='h-9 shrink-0 gap-2 rounded-lg shadow-xs sm:self-center'>
          <Download className='h-3.5 w-3.5' aria-hidden />
          {t('transactionPage.exportCSV')}
        </Button>
      </DialogTrigger>

      {/* overflow-visible supaya Popover kalender tidak terpotong di dalam modal */}
      <DialogContent className='flex w-full max-w-lg flex-col gap-0 overflow-visible p-0'>
        <DialogHeader className='border-b border-border/80 px-6 py-5'>
          <div className='flex min-w-0 items-center gap-3'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <CalendarRange className='h-4 w-4' aria-hidden />
            </div>
            <div className='min-w-0 space-y-0.5'>
              <DialogTitle className='text-base font-semibold leading-snug'>
                {t('transactionPage.exportCSVTitle')}
              </DialogTitle>
              <DialogDescription className='text-xs leading-snug text-muted-foreground'>
                {t('transactionPage.exportCSVDesc')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* overflow-visible agar kalender bisa render ke luar modal */}
        <div className='overflow-visible px-6 py-5'>
          <div className='flex flex-col gap-6'>
            <div className='space-y-2'>
              <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                {t('transactionPage.dateTimeRange')}
              </p>

              <div className='flex flex-wrap items-center gap-1.5' role='group' aria-label={t('transactionPage.export.presetsLabel')}>
                <span className='mr-1 text-xs text-muted-foreground'>
                  {t('transactionPage.export.presetsLabel')}
                </span>
                {presets.map((preset) => (
                  <Button
                    key={preset.key}
                    type='button'
                    variant='outline'
                    size='sm'
                    className='h-8 rounded-lg px-2.5 text-xs shadow-xs'
                    onClick={() => applyPreset(preset.days)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              <div className='overflow-visible'>
                <TransactionDateFilter date={dateRange} onChange={setDateRange} />
              </div>

              {/* Rentang wajib + maksimal 31 hari; BE menolak dengan pesan yang
                  sama, validasi klien hanya memangkas satu bolak-balik. */}
              {!hasCompleteRange && (
                <p className='text-xs text-muted-foreground'>
                  {t('transactionPage.export.dateRequiredHint')}
                </p>
              )}
              {rangeTooLong && (
                <p className='flex items-center gap-1.5 text-xs font-medium text-destructive' role='alert'>
                  <AlertCircle className='h-3.5 w-3.5 shrink-0' aria-hidden />
                  {t('transactionPage.export.rangeTooLong')}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                {t('transactionPage.status')}
              </p>
              <TransactionStatusFilter value={status} onChange={setStatus} />
            </div>

            <div className='space-y-2'>
              <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                {t('transactionPage.paymentMethod')}
              </p>
              <TransactionPaymentMethodFilter value={paymentMethodId} onChange={setPaymentMethodId} />
            </div>
          </div>
        </div>

        <DialogFooter className='border-t border-border/80 px-6 py-4'>
          <Button
            type='button'
            variant='outline'
            className='flex-1 sm:flex-none'
            onClick={() => handleOpenChange(false)}
            disabled={isExporting}
          >
            {t('sidebar.cancel')}
          </Button>
          <Button
            type='button'
            className='flex-1 gap-2 sm:flex-none'
            onClick={() => void handleExport()}
            disabled={!canExport}
          >
            {isExporting ? (
              <Loader2 className='h-4 w-4 animate-spin motion-reduce:animate-none' aria-hidden />
            ) : (
              <Download className='h-4 w-4' aria-hidden />
            )}
            {isExporting ? t('transactionPage.generating') : t('transactionPage.generateCSV')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
