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
import { Button } from '@/components/ui/button'
import { Download, Loader2, CalendarRange } from 'lucide-react'
import TransactionDateFilter from './TransactionDateFilter'
import type { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { api } from '@/api/axios'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function TransactionExportModal() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
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
    if (!val) setDateRange(undefined)
    setOpen(val)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await api.get('/transactions/export-csv', {
        params: {
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
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
        <Button
          variant='outline'
          size='sm'
          className='h-9 shrink-0 gap-2 shadow-xs sm:self-center'
        >
          <Download className='h-3.5 w-3.5' aria-hidden />
          {t('transactionPage.exportCSV')}
        </Button>
      </DialogTrigger>

      {/* overflow-visible supaya Popover kalender tidak terpotong di dalam modal */}
      <DialogContent className='flex w-full max-w-lg flex-col gap-0 overflow-visible p-0'>
        {/* ── Header ── */}
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

        {/* ── Body ── overflow-visible agar kalender bisa render ke luar modal */}
        <div className='overflow-visible px-6 py-5'>
          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              {t('transactionPage.dateTimeRange')}
            </p>
            <div className='overflow-visible'>
              <TransactionDateFilter date={dateRange} onChange={setDateRange} />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
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
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
            ) : (
              <Download className='h-4 w-4' aria-hidden />
            )}
            {isExporting
              ? t('transactionPage.generating', 'Generating…')
              : t('transactionPage.generateCSV')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
