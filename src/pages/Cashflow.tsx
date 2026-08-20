import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import {
  dashAccent,
  dashCard,
  dashCardBody,
  dashCardHeader,
  dashCardTitle,
  dashSelectContent,
  dashSelectItem,
  dashSelectTrigger,
} from '@/components/Dashboard/styles'
import { CopyButton } from '@/components/ui/copy-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useGetCashflows } from '@/hooks/useCashflow'
import { CashflowTypeTag } from '@/components/Cashflow/CashflowTypeTag'
import { getCashflowColumns } from '@/tables/table-cashflow'
import { cn } from '@/lib/utils'
import type { CashflowItem } from '@/types/cashflow'
import {
  AlertCircle,
  Banknote,
  CalendarIcon,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FilterX,
  Loader2,
  Scale,
  Server,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { format } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const PAGE_LIMIT = 10

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Label status di sisi kanan judul halaman. */
function StatusTag({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <p
      className={cn(
        'nb-frame nb-frame-thin nb-sd-sm inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-black uppercase tracking-[0.12em]',
        accent,
      )}
    >
      {children}
    </p>
  )
}

/** Satu angka ringkasan keuangan. `valueClass` dipakai untuk menyorot laba
 *  bersih — hijau saat untung, merah saat rugi — supaya tandanya tidak hanya
 *  bergantung pada minus kecil di depan angka. */
function StatTile({
  label,
  value,
  icon: Icon,
  accent,
  valueClass,
}: {
  label: string
  value: string
  icon: LucideIcon
  accent: string
  valueClass?: string
}) {
  return (
    <div className='nb-frame nb-frame-thin nb-sd-sm bg-white p-3'>
      <div className='flex items-center justify-between gap-2'>
        <p className='truncate text-[11px] font-black uppercase tracking-[0.12em] text-[#111]/60'>
          {label}
        </p>
        <span
          className={cn(
            'nb-frame nb-frame-thin flex h-7 w-7 shrink-0 items-center justify-center',
            accent,
          )}
        >
          <Icon className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
        </span>
      </div>
      <p className='mt-2 text-xl font-black leading-tight tabular-nums text-[#111]'>
        <span className={cn('inline-block', valueClass)}>{value}</span>
      </p>
    </div>
  )
}

export default function CashflowPage() {
  const { t } = useTranslation('common')
  const [page, setPage] = useState(1)
  const [cashflowType, setCashflowType] = useState<string>('all')
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const today = new Date()
    return { from: today, to: today }
  })

  const queryType = cashflowType === 'all' ? '' : cashflowType
  const startDateStr = date?.from ? format(date.from, 'yyyy-MM-dd') : ''
  const endDateStr = date?.to ? format(date.to, 'yyyy-MM-dd') : ''

  const { data, isLoading, isSuccess, isError } = useGetCashflows(
    page,
    PAGE_LIMIT,
    queryType,
    startDateStr,
    endDateStr,
  )

  const handleReset = () => {
    setPage(1)
    setCashflowType('all')
    const today = new Date()
    setDate({ from: today, to: today })
  }

  const [selectedCashflow, setSelectedCashflow] = useState<CashflowItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleOpenDetail = (item: CashflowItem) => {
    setSelectedCashflow(item)
    setIsDetailOpen(true)
  }

  const tableRows = data?.data ?? []
  const columns = useMemo(() => getCashflowColumns(t, handleOpenDetail), [t])

  const isToday = (d?: Date) => {
    if (!d) return false
    const today = new Date()
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    )
  }

  const isDefaultDate = date?.from && date?.to && isToday(date.from) && isToday(date.to)
  const showReset = cashflowType !== 'all' || !isDefaultDate

  return (
    <DashboardLayout>
      <div className='mx-auto min-w-0 max-w-7xl space-y-5'>
        <div className='nb-frame nb-frame-thick nb-sd flex flex-col gap-4 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5'>
          <div className='flex gap-3'>
            <span className='nb-frame nb-frame-thin nb-sd-sm flex h-12 w-12 shrink-0 items-center justify-center bg-[#c9f24d]'>
              <Banknote className='h-5 w-5' strokeWidth={2.5} aria-hidden />
            </span>
            <div className='min-w-0 space-y-1.5'>
              <h1 className='text-2xl font-black uppercase leading-none tracking-tight'>
                {t('cashflowPage.title')}
              </h1>
              <p className='inline-block bg-[#ffd84d] px-1.5 py-0.5 text-xs font-bold'>
                {t('cashflowPage.subtitle', { limit: PAGE_LIMIT })}
              </p>
            </div>
          </div>

          <div className='flex shrink-0 sm:justify-end'>
            {isLoading && (
              <StatusTag accent='bg-[#6fe3f5]'>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                {t('cashflowPage.loadingShort')}
              </StatusTag>
            )}
            {isError && (
              <StatusTag accent='bg-[#ff4d3d]'>
                <AlertCircle className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                {t('cashflowPage.loadFailedShort')}
              </StatusTag>
            )}
            {isSuccess && data && (
              <StatusTag accent='bg-[#c9f24d]'>
                <CheckCircle2 className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                <span className='tabular-nums'>
                  {t('cashflowPage.totalRows', {
                    count: (data.meta.total ?? 0).toLocaleString('id-ID'),
                  })}
                </span>
              </StatusTag>
            )}
          </div>
        </div>

        {/* Ringkasan keuangan */}
        {isSuccess && data?.stats && (
          <div className={dashCard}>
            <div className={cn(dashCardHeader, dashAccent.lime)}>
              <h2 className={dashCardTitle}>{t('cashflowPage.statsTitle')}</h2>
              <p className='mt-0.5 text-[11px] font-bold text-[#111]/70'>
                {t('cashflowPage.statsDescription')}
              </p>
            </div>
            <div className={dashCardBody}>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
                <StatTile
                  label={t('cashflowPage.totalRevenue')}
                  value={formatCurrency(data.stats.total_revenue)}
                  icon={Wallet}
                  accent='bg-[#c9f24d]'
                />
                <StatTile
                  label={t('cashflowPage.totalOutflow')}
                  value={formatCurrency(data.stats.total_outflow)}
                  icon={TrendingDown}
                  accent='bg-[#ff9d3d]'
                />
                <StatTile
                  label={t('cashflowPage.netProfit')}
                  value={formatCurrency(data.stats.net_profit)}
                  icon={TrendingUp}
                  accent='bg-[#ff9ed2]'
                  valueClass={
                    data.stats.net_profit >= 0 ? 'bg-[#c9f24d] px-1' : 'bg-[#ff4d3d] px-1'
                  }
                />
                <StatTile
                  label={t('cashflowPage.totalOutProvider')}
                  value={formatCurrency(data.stats.total_out_provider)}
                  icon={Server}
                  accent='bg-[#6fe3f5]'
                />
                <StatTile
                  label={t('cashflowPage.totalOutPG')}
                  value={formatCurrency(data.stats.total_out_pg)}
                  icon={CreditCard}
                  accent='bg-[#ffd84d]'
                />
                <StatTile
                  label={t('cashflowPage.selisihPg')}
                  value={formatCurrency(data.stats.selisih_pg)}
                  icon={Scale}
                  accent='bg-white'
                />
              </div>
            </div>
          </div>
        )}

        {/* Penyaring */}
        <div className='nb-frame nb-frame-thick nb-sd flex flex-wrap items-center gap-3 bg-white p-3 sm:p-4'>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                aria-label={t('cashflowFilter.pickDateAria')}
                className={cn(
                  'nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-9 w-full cursor-pointer justify-start bg-white text-left font-bold text-[#111] hover:bg-[#ffd84d] hover:text-[#111] sm:w-65',
                  !date && 'text-[#111]/55',
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' strokeWidth={3} aria-hidden />
                {date?.from ? (
                  date.to && format(date.from, 'yyyy-MM-dd') !== format(date.to, 'yyyy-MM-dd') ? (
                    <>
                      {format(date.from, 'LLL dd, y')} – {format(date.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(date.from, 'LLL dd, y')
                  )
                ) : (
                  <span>{t('cashflowFilter.pickDateRange')}</span>
                )}
              </Button>
            </PopoverTrigger>
            {/* Portal berada di luar pembungkus `.nb`, jadi kelasnya dipasang lagi. */}
            <PopoverContent
              className='nb nb-frame nb-frame-thick nb-sd w-auto bg-white p-0'
              align='start'
            >
              <Calendar
                initialFocus
                mode='range'
                selected={date}
                onSelect={(d) => {
                  setDate(d)
                  setPage(1)
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Select
            value={cashflowType}
            onValueChange={(val) => {
              setCashflowType(val)
              setPage(1)
            }}
          >
            <SelectTrigger className={`${dashSelectTrigger} h-9 w-full sm:w-48`}>
              <SelectValue placeholder={t('cashflowFilter.all')} />
            </SelectTrigger>
            <SelectContent className={dashSelectContent}>
              <SelectItem value='all' className={dashSelectItem}>
                {t('cashflowFilter.all')}
              </SelectItem>
              <SelectItem value='PROVIDER' className={dashSelectItem}>
                {t('cashflowFilter.provider')}
              </SelectItem>
              <SelectItem value='PAYMENT_GATEWAY' className={dashSelectItem}>
                {t('cashflowFilter.pg')}
              </SelectItem>
              <SelectItem value='REVENUE' className={dashSelectItem}>
                {t('cashflowFilter.revenue')}
              </SelectItem>
            </SelectContent>
          </Select>

          <button
            type='button'
            onClick={handleReset}
            disabled={!showReset}
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-9 cursor-pointer items-center gap-2 bg-[#ff9ed2] px-3 text-xs font-black uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:bg-white disabled:opacity-55'
          >
            <FilterX className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
            {t('cashflowFilter.reset')}
          </button>
        </div>

        {isLoading && (
          <div
            className='nb-frame nb-frame-thick nb-sd flex min-h-[16rem] flex-col items-center justify-center gap-4 bg-white py-12'
            role='status'
            aria-live='polite'
            aria-busy='true'
          >
            <span className='nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center bg-[#6fe3f5]'>
              <Loader2 className='h-7 w-7 animate-spin' strokeWidth={3} aria-hidden />
            </span>
            <div className='text-center'>
              <p className='text-sm font-black uppercase tracking-tight'>
                {t('cashflowPage.tableLoadingTitle')}
              </p>
              <p className='mt-1 text-xs font-bold text-[#111]/70'>
                {t('cashflowPage.tableLoadingHint')}
              </p>
            </div>
          </div>
        )}

        {isError && (
          <div className='nb-frame nb-frame-thick nb-sd bg-white'>
            <ErrorComponent message={t('cashflowPage.loadErrorDetail')} />
          </div>
        )}

        {isSuccess && data && (
          <>
            <DataTable
              className='nb nb-table nb-sd'
              columns={columns}
              data={tableRows}
              emptyMessage={t('cashflowPage.emptyPage')}
            />
            <Pagination
              className='nb nb-pagination'
              page={page}
              totalPage={data.meta.last_page}
              onChange={setPage}
            />
          </>
        )}

        <CashflowDetailDialog
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          item={selectedCashflow}
        />
      </div>
    </DashboardLayout>
  )
}

interface CashflowDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: CashflowItem | null
}

/** Satu baris data di dialog detail. */
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='min-w-0'>
      <p className='mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#111]/60'>
        {label}
      </p>
      {children}
    </div>
  )
}

function CashflowDetailDialog({ open, onOpenChange, item }: CashflowDetailDialogProps) {
  const { t, i18n } = useTranslation('common')
  if (!item) return null

  const dateLocale = i18n.language.startsWith('id') ? idLocale : enUS
  const formattedDate = format(new Date(item.created_at), 'dd MMM yyyy, HH:mm:ss', {
    locale: dateLocale,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='nb nb-frame nb-frame-thick nb-sd-lg max-h-[min(90vh,44rem)] gap-0 overflow-y-auto bg-white p-0 sm:max-w-lg'
        showCloseButton={false}
      >
        <div className='border-b-4 border-[#111] bg-[#6fe3f5] px-5 py-4'>
          <DialogHeader className='gap-2 text-left'>
            <div className='flex items-center gap-2.5'>
              <span className='nb-frame nb-frame-thin flex h-9 w-9 shrink-0 items-center justify-center bg-white'>
                <Banknote className='h-4 w-4' strokeWidth={3} aria-hidden />
              </span>
              <DialogTitle className='text-xl font-black uppercase leading-none tracking-tight'>
                {t('cashflowDetailDialog.title')}
              </DialogTitle>
            </div>
          </DialogHeader>
        </div>

        <div className='space-y-4 px-5 py-5'>
          <div className='nb-frame nb-frame-thin nb-sd-sm flex items-center justify-between gap-3 bg-[#f5f1e8] p-4'>
            <div className='min-w-0'>
              <p className='mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#111]/60'>
                {t('cashflowTable.colAmount')}
              </p>
              <p className='text-2xl font-black tabular-nums'>{formatCurrency(item.amount)}</p>
            </div>
            <CashflowTypeTag t={t} type={item.type} />
          </div>

          <div className='grid grid-cols-1 gap-4 border-b-2 border-[#111]/15 pb-4 sm:grid-cols-2'>
            <DetailRow label={t('cashflowTable.colDate')}>
              <p className='text-sm font-bold tabular-nums'>{formattedDate}</p>
            </DetailRow>
            <DetailRow label='ID'>
              <p className='truncate font-mono text-xs font-bold' title={item.id}>
                {item.id}
              </p>
            </DetailRow>
          </div>

          <div className='grid grid-cols-1 gap-4 border-b-2 border-[#111]/15 pb-4 sm:grid-cols-2'>
            <DetailRow label={t('cashflowTable.colOrderId')}>
              <div className='flex items-center gap-1.5'>
                <span
                  className='max-w-[10rem] truncate font-mono text-xs font-bold'
                  title={item.order_id}
                >
                  {item.order_id || '—'}
                </span>
                {item.order_id && (
                  <CopyButton
                    value={item.order_id}
                    label={t('cashflowTable.colOrderId')}
                    errorLabel={t('cashflowTable.copyError')}
                    className='h-7 w-7'
                  />
                )}
              </div>
            </DetailRow>
            <DetailRow label={t('cashflowTable.colPaymentId')}>
              {item.payment_id ? (
                <div className='flex items-center gap-1.5'>
                  <Link
                    to={`/transactions/${item.payment_id}`}
                    className='nb-focus group inline-flex min-w-0 items-center gap-0.5 font-mono text-xs font-bold underline-offset-2 hover:underline'
                    onClick={() => onOpenChange(false)}
                  >
                    <span className='max-w-[10rem] truncate' title={item.payment_id}>
                      {item.payment_id}
                    </span>
                    <ChevronRight
                      className='h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5'
                      strokeWidth={3}
                      aria-hidden
                    />
                  </Link>
                  <CopyButton
                    value={item.payment_id}
                    label={t('cashflowTable.colPaymentId')}
                    errorLabel={t('cashflowTable.copyError')}
                    className='h-7 w-7'
                  />
                </div>
              ) : (
                <span className='font-black text-[#111]/70'>—</span>
              )}
            </DetailRow>
          </div>

          <DetailRow label={t('cashflowTable.colNotes')}>
            <div className='nb-frame nb-frame-thin max-h-48 overflow-y-auto whitespace-pre-wrap break-words bg-[#f5f1e8] p-3 text-sm font-bold leading-relaxed'>
              {item.notes || '—'}
            </div>
          </DetailRow>
        </div>

        <div className='flex justify-end border-t-4 border-[#111] px-5 py-4'>
          <button
            type='button'
            onClick={() => onOpenChange(false)}
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-11 cursor-pointer bg-white px-5 text-xs font-black uppercase tracking-[0.14em] sm:min-w-[5.5rem]'
          >
            {t('cashflowDetailDialog.btnClose')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
