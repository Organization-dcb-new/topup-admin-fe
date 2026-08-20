import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { txSectionTitle } from '@/components/Transaction/styles'
import { Download, Loader2, CalendarRange } from 'lucide-react'
import TransactionDateFilter from './TransactionDateFilter'
import TransactionStatusFilter from './TransactionStatusFilter'
import TransactionPaymentMethodFilter from './TransactionPaymentMethodFilter'
import type { Payment } from '@/types/transaction'
import type { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { api } from '@/api/axios'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function TransactionExportModal() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [status, setStatus] = useState<'' | Payment['status']>('')
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const datetimePattern = 'yyyy-MM-dd HH:mm:ss'

  const { startDate, endDate } = useMemo(() => {
    const from = dateRange?.from
    const to = dateRange?.to
    const start = from ? format(from, datetimePattern) : ''
    const end = to ? format(to, datetimePattern) : ''
    return { startDate: start, endDate: end }
  }, [dateRange])

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setDateRange(undefined)
      setStatus('')
      setPaymentMethodId('')
    }
    setOpen(val)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await api.get('/transactions/export-csv', {
        params: {
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
          ...(status && { status }),
          ...(paymentMethodId && { payment_method: paymentMethodId }),
        },
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url

      let filename = 'payments_export.csv'
      const disposition = response.headers['content-disposition']
      if (disposition && disposition.includes('filename=')) {
        const filenameMatch = disposition.match(/filename="?([^"]+)"?/)
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1]
        }
      }

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success(t('transactionPage.exportSuccess'))
      setOpen(false)
    } catch (error) {
      console.error('Export error:', error)
      toast.error(t('transactionPage.exportError'))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type='button'
          className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-9 shrink-0 cursor-pointer items-center gap-2 bg-[#c9f24d] px-3 text-xs font-black uppercase tracking-[0.12em] sm:self-center'
        >
          <Download className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
          {t('transactionPage.exportCSV')}
        </button>
      </DialogTrigger>

      {/* overflow-visible supaya Popover kalender tidak terpotong di dalam modal */}
      <DialogContent
        className='nb nb-frame nb-frame-thick nb-sd-lg flex w-full max-w-lg flex-col gap-0 overflow-visible bg-white p-0'
        showCloseButton={false}
      >
        {/* ── Header ── */}
        <DialogHeader className='border-b-4 border-[#111] bg-[#6fe3f5] px-5 py-4 text-left'>
          <div className='flex min-w-0 items-center gap-3'>
            <span className='nb-frame nb-frame-thin flex h-9 w-9 shrink-0 items-center justify-center bg-white'>
              <CalendarRange className='h-4 w-4' strokeWidth={3} aria-hidden />
            </span>
            <div className='min-w-0 space-y-1'>
              <DialogTitle className='text-lg font-black uppercase leading-none tracking-tight'>
                {t('transactionPage.exportCSVTitle')}
              </DialogTitle>
              <DialogDescription className='text-xs font-bold leading-snug text-[#111]/80'>
                {t('transactionPage.exportCSVDesc')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Body ── overflow-visible agar kalender bisa render ke luar modal */}
        <div className='overflow-visible px-5 py-5'>
          <div className='flex flex-col gap-6'>
            <div className='space-y-2'>
              <p className={txSectionTitle}>{t('transactionPage.dateTimeRange')}</p>
              <div className='overflow-visible'>
                <TransactionDateFilter date={dateRange} onChange={setDateRange} />
              </div>
            </div>

            <div className='space-y-2'>
              <p className={txSectionTitle}>{t('transactionPage.status')}</p>
              <TransactionStatusFilter value={status} onChange={setStatus} />
            </div>

            <div className='space-y-2'>
              <p className={txSectionTitle}>{t('transactionPage.paymentMethod')}</p>
              <TransactionPaymentMethodFilter value={paymentMethodId} onChange={setPaymentMethodId} />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <DialogFooter className='gap-2 border-t-4 border-[#111] px-5 py-4'>
          <button
            type='button'
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-11 flex-1 cursor-pointer bg-white px-5 text-xs font-black uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none'
            onClick={() => handleOpenChange(false)}
            disabled={isExporting}
          >
            {t('sidebar.cancel')}
          </button>
          <button
            type='button'
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 bg-[#c9f24d] px-5 text-xs font-black uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none'
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
            ) : (
              <Download className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
            )}
            {isExporting
              ? t('transactionPage.generating', 'Generating…')
              : t('transactionPage.generateCSV')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
