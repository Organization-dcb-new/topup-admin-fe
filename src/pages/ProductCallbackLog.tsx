import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { useGetProductCallbackLogs } from '@/hooks/useProductCallbackLog'
import { getProductCallbackLogColumns } from '@/tables/table-product-callback-log'
import i18n from '@/i18n'
import {
  AlertCircle,
  History,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Settings2,
  Search,
  Calendar,
  Filter,
  Coins,
  SortAsc,
  Check,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import TransactionDateFilter from '@/components/Transaction/TransactionDateFilter'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ProductCallbackLogPage() {
  const { t } = useTranslation('common')
  const [page, setPage] = useState(1)

  // Applied states (used for fetching)
  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: undefined as DateRange | undefined,
    search: '',
    status: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  })

  // Local UI states (unapplied)
  const [localFilters, setLocalFilters] = useState({ ...appliedFilters })

  const limit = 30
  const datetimePattern = 'yyyy-MM-dd HH:mm:ss'

  const { startDate, endDate } = useMemo(() => {
    const from = appliedFilters.dateRange?.from ? format(appliedFilters.dateRange.from, datetimePattern) : undefined
    const to = appliedFilters.dateRange?.to ? format(appliedFilters.dateRange.to, datetimePattern) : undefined
    return { startDate: from, endDate: to }
  }, [appliedFilters.dateRange])

  const handleApply = () => {
    setPage(1)
    setAppliedFilters({ ...localFilters })
  }

  const handleReset = () => {
    const defaultFilters = {
      dateRange: undefined,
      search: '',
      status: 'all',
      minPrice: '',
      maxPrice: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    }
    setPage(1)
    setLocalFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
  }

  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetProductCallbackLogs(
    page,
    limit,
    startDate,
    endDate,
    appliedFilters.search,
    appliedFilters.status === 'all' ? undefined : appliedFilters.status,
    appliedFilters.minPrice,
    appliedFilters.maxPrice,
    appliedFilters.sortBy,
    appliedFilters.sortOrder
  )

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(t('productCallbackLogPage.toastSuccess'))
    }
    if (isError && isFetchedAfterMount) {
      toast.error(t('productCallbackLogPage.toastError'))
    }
  }, [isSuccess, isError, isFetchedAfterMount, t])

  const rows = data?.data ?? []
  const columns = useMemo(() => getProductCallbackLogColumns(t), [t])

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex gap-3'>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <History className='h-5 w-5' aria-hidden />
            </div>
            <div className='min-w-0 space-y-1'>
              <h1 className='text-2xl font-semibold tracking-tight text-gray-900'>
                {t('productCallbackLogPage.title')}
              </h1>
              <p className='text-sm text-muted-foreground'>
                {t('productCallbackLogPage.subtitle')}
              </p>
            </div>
          </div>
          <div className='flex flex-col items-end gap-1 sm:text-right'>
            {isLoading && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin text-primary' aria-hidden />
                {t('transactionPage.loadingShort')}
              </p>
            )}
            {isError && (
              <p className='flex items-center gap-2 text-sm font-medium text-destructive'>
                <AlertCircle className='h-4 w-4 shrink-0' aria-hidden />
                {t('transactionPage.loadFailedShort')}
              </p>
            )}
            {isSuccess && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <CheckCircle2 className='h-4 w-4 shrink-0 text-emerald-600' aria-hidden />
                <span className='tabular-nums text-foreground'>
                  {t('productCallbackLogPage.totalLogs', {
                    count: (data?.meta?.total_data ?? 0).toLocaleString(
                      i18n.language.startsWith('id') ? 'id-ID' : 'en-US',
                    ),
                  })}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className='rounded-2xl border border-border bg-card shadow-sm'>
          <div className='flex items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-5 py-3'>
            <Settings2 className='h-4 w-4 text-primary' />
            <span className='text-sm font-bold text-gray-900'>{t('productCallbackLogPage.filterPanelTitle')}</span>
          </div>
          <div className='p-5'>
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
              {/* Group 1: Search & Date */}
              <div className='space-y-4 lg:col-span-2'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div className='flex flex-col gap-1.5'>
                    <Label className='flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
                      <Search className='h-3 w-3' />
                      {t('productCallbackLogPage.searchLabel')}
                    </Label>
                    <Input
                      placeholder={t('productCallbackLogPage.searchPlaceholder')}
                      value={localFilters.search}
                      className='h-9'
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>
                  <div className='flex flex-col gap-1.5'>
                    <Label className='flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
                      <Calendar className='h-3 w-3' />
                      {t('transactionPage.dateTimeRange')}
                    </Label>
                    <TransactionDateFilter
                      date={localFilters.dateRange}
                      onChange={(range) => setLocalFilters(prev => ({ ...prev, dateRange: range }))}
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Status & Sort */}
              <div className='flex flex-col gap-1.5'>
                <Label className='flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
                  <Filter className='h-3 w-3' />
                  {t('transactionFilters.status.filterAria')}
                </Label>
                <Select
                  value={localFilters.status}
                  onValueChange={(val) => setLocalFilters(prev => ({ ...prev, status: val }))}
                >
                  <SelectTrigger className='h-9'>
                    <SelectValue placeholder={t('transactionFilters.status.placeholderAll')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>{t('transactionFilters.status.optionAll')}</SelectItem>
                    <SelectItem value='available'>{t('productFilters.providerAvailable')}</SelectItem>
                    <SelectItem value='empty'>{t('productFilters.providerEmpty')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='flex flex-col gap-1.5'>
                <Label className='flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
                  <SortAsc className='h-3 w-3' />
                  {t('productCallbackLogPage.sortLabel')}
                </Label>
                <div className='flex gap-2'>
                  <Select
                    value={localFilters.sortBy}
                    onValueChange={(val) => setLocalFilters(prev => ({ ...prev, sortBy: val }))}
                  >
                    <SelectTrigger className='h-9 flex-1'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='created_at'>{t('productCallbackLogPage.sortOptionCreatedAt')}</SelectItem>
                      <SelectItem value='price'>{t('productCallbackLogPage.sortOptionPrice')}</SelectItem>
                      <SelectItem value='product_code'>{t('productCallbackLogPage.sortOptionProductCode')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={localFilters.sortOrder}
                    onValueChange={(val) => setLocalFilters(prev => ({ ...prev, sortOrder: val }))}
                  >
                    <SelectTrigger className='h-9 w-[100px]'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='desc'>DESC</SelectItem>
                      <SelectItem value='asc'>ASC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Group 3: Price Range & Action Buttons */}
              <div className='lg:col-span-4'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  <div className='flex flex-col gap-1.5'>
                    <Label className='flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
                      <Coins className='h-3 w-3' />
                      {t('productCallbackLogPage.minPriceLabel')}
                    </Label>
                    <div className='relative'>
                      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground'>Rp</span>
                      <Input
                        type='number'
                        placeholder='0'
                        value={localFilters.minPrice}
                        className='h-9 pl-8'
                        onChange={(e) => setLocalFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className='flex flex-col gap-1.5'>
                    <Label className='flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
                      <Coins className='h-3 w-3' />
                      {t('productCallbackLogPage.maxPriceLabel')}
                    </Label>
                    <div className='relative'>
                      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground'>Rp</span>
                      <Input
                        type='number'
                        placeholder='0'
                        value={localFilters.maxPrice}
                        className='h-9 pl-8'
                        onChange={(e) => setLocalFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className='flex items-end gap-2 sm:col-span-2'>
                    <Button
                      variant='ghost'
                      className='h-9 flex-1 gap-2 font-bold text-muted-foreground hover:bg-destructive/5 hover:text-destructive'
                      onClick={handleReset}
                    >
                      <RotateCcw className='h-3.5 w-3.5' />
                      {t('transactionPage.resetFilters')}
                    </Button>
                    <Button
                      className='h-9 flex-1 gap-2 font-bold'
                      onClick={handleApply}
                    >
                      <Check className='h-3.5 w-3.5' />
                      {t('productCallbackLogPage.applyFilters')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='rounded-xl border border-border bg-card p-4 shadow-sm'>
          {isLoading && (
            <div
              className='flex min-h-[16rem] flex-col items-center justify-center gap-4 py-12'
              role='status'
              aria-live='polite'
              aria-busy='true'
            >
              <Loader2 className='h-11 w-11 animate-spin text-primary' aria-hidden />
              <div className='text-center'>
                <p className='text-sm font-medium text-foreground'>{t('transactionPage.tableLoadingTitle')}</p>
                <p className='mt-1 text-xs text-muted-foreground'>{t('transactionPage.tableLoadingHint')}</p>
              </div>
            </div>
          )}

          {isError && (
            <ErrorComponent message={t('transactionPage.loadErrorDetail')} />
          )}

          {isSuccess && (
            <>
              <div className='max-h-[min(70vh,40rem)] overflow-y-auto overflow-x-auto overscroll-contain'>
                <DataTable
                  columns={columns}
                  data={rows}
                  emptyMessage={t('productCallbackLogPage.emptyPage')}
                />
              </div>
              <div className='mt-4'>
                <Pagination
                  page={page}
                  totalPage={data?.meta?.total_page ?? 1}
                  onChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
