import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Percent, Plus, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'

import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { EmptyState, TableSkeleton } from '@/components/Layout/table-states'
import { DeleteReferralDialog } from '@/components/Referral/DeleteReferralDialog'
import { ReferralStatStrip } from '@/components/Referral/ReferralStatStrip'
import { ReferralFormDialog } from '@/components/Referral/ReferralForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PERM } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { useGetReferralCodes, useUpdateReferralCode } from '@/hooks/useReferral'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { cn } from '@/lib/utils'
import { getReferralColumns } from '@/tables/table-referral'
import type { ReferralCode } from '@/types/referral'

const PAGE_SIZES = [10, 20, 50, 100]

export default function ReferralPage() {
  const { t } = useTranslation('common')
  const { can } = usePermission()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(PAGE_SIZES[0])
  const [filter, setFilter] = useState('')
  const [formTarget, setFormTarget] = useState<ReferralCode | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ReferralCode | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const listRef = useRef<HTMLElement>(null)

  const { data, isPending, isError, isSuccess, isPlaceholderData, refetch } = useGetReferralCodes({
    page,
    limit,
  })

  const canCreate = can(PERM.REFERRAL_CREATE)
  const canUpdate = can(PERM.REFERRAL_UPDATE)
  const canDelete = can(PERM.REFERRAL_DELETE)

  const { mutate: updateMutate } = useUpdateReferralCode()

  const handleToggle = useCallback(
    (referral: ReferralCode) => {
      setTogglingId(referral.id)
      updateMutate(
        { id: referral.id, payload: { is_active: !referral.is_active } },
        { onSettled: () => setTogglingId(null) },
      )
    },
    [updateMutate],
  )

  const handleCopy = useCallback(
    (code: string) => {
      void copyTextToClipboard(code)
        .then(() => {
          setCopiedCode(code)
          toast.success(t('referralPage.copied'))
        })
        .catch(() => toast.error(t('referralPage.copyFailed')))
    },
    [t],
  )

  // Tanda "tersalin" hanya sesaat; tanpa pembersih ini centangnya menetap.
  useEffect(() => {
    if (!copiedCode) return
    const timer = setTimeout(() => setCopiedCode(null), 1500)
    return () => clearTimeout(timer)
  }, [copiedCode])

  const openCreate = useCallback(() => {
    setFormTarget(null)
    setIsFormOpen(true)
  }, [])

  const openEdit = useCallback((referral: ReferralCode) => {
    setFormTarget(referral)
    setIsFormOpen(true)
  }, [])

  const columns = useMemo(
    () =>
      getReferralColumns({
        t,
        canUpdate,
        canDelete,
        onEdit: openEdit,
        onDelete: setDeleteTarget,
        onToggle: handleToggle,
        onCopy: handleCopy,
        togglingId,
        copiedCode,
      }),
    [t, canUpdate, canDelete, openEdit, handleToggle, handleCopy, togglingId, copiedCode],
  )

  const rows = useMemo(() => data?.data ?? [], [data])
  const totalPage = data?.meta?.total_page ?? 1
  const total = data?.meta?.total_data ?? 0

  // Menghapus baris terakhir sebuah halaman membuat `page` menunjuk halaman
  // yang sudah tidak ada. Dijepit saat render, bukan lewat useEffect: efek
  // akan sempat menggambar satu kali dengan nomor halaman yang sudah usang.
  const [lastTotalPage, setLastTotalPage] = useState(totalPage)
  if (isSuccess && totalPage !== lastTotalPage) {
    setLastTotalPage(totalPage)
    if (page > totalPage) setPage(totalPage)
  }

  const visibleRows = useMemo(() => {
    const query = filter.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((row) =>
      [row.name, row.code].join(' ').toLowerCase().includes(query),
    )
  }, [rows, filter])

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    listRef.current?.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [page])

  const emptyMessage = filter.trim() ? (
    <EmptyState
      message={t('referralPage.filterNoMatch', { count: rows.length })}
      action={
        <Button variant='outline' size='sm' onClick={() => setFilter('')}>
          {t('referralPage.filterClear')}
        </Button>
      }
    />
  ) : page > 1 && !isPlaceholderData ? (
    <EmptyState
      message={t('referralPage.emptyPageMessage')}
      action={
        <Button variant='outline' size='sm' onClick={() => setPage(1)}>
          {t('referralPage.backToFirstPage')}
        </Button>
      }
    />
  ) : (
    <EmptyState message={t('referralPage.emptyPage')} />
  )

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        {/* h2, bukan h1: navbar sudah merender h1 judul halaman */}
        <header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex gap-3'>
            <span
              className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'
              aria-hidden
            >
              <Percent className='h-5 w-5' />
            </span>
            <div className='min-w-0 space-y-1'>
              <h2 className='text-2xl font-semibold tracking-tight text-foreground'>
                {t('referralPage.title')}
              </h2>
              <p className='text-sm text-muted-foreground'>
                {canCreate || canUpdate || canDelete
                  ? t('referralPage.subtitle')
                  : t('referralPage.subtitleReadOnly')}
              </p>
            </div>
          </div>

        </header>

        {/* Angka ringkas dinaikkan ke atas: sebelumnya satu-satunya angka di
            layar ini adalah total di sudut header, dan sisanya harus dihitung
            sendiri dari tabel. */}
        {!isError && <ReferralStatStrip rows={rows} total={total} isReady={isSuccess} />}

        <section
          ref={listRef}
          className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'
        >
          <div className='flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
            <div className='min-w-0 space-y-0.5'>
              <h3 className='text-sm font-semibold text-foreground'>
                {t('referralPage.listTitle')}
              </h3>
              <p className='text-xs text-muted-foreground'>{t('referralPage.listHint')}</p>
            </div>

            <div className='flex shrink-0 flex-wrap items-center gap-2'>
              <Label
                htmlFor='referral-page-size'
                className='whitespace-nowrap text-xs font-medium text-muted-foreground'
              >
                {t('referralPage.rowsPerPage')}
              </Label>
              <Select
                value={String(limit)}
                onValueChange={(value) => {
                  setLimit(Number(value))
                  setPage(1)
                }}
              >
                <SelectTrigger id='referral-page-size' size='sm' className='w-20'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {canCreate && (
                <Button type='button' onClick={openCreate} className='gap-1.5 rounded-lg font-semibold'>
                  <Plus className='h-4 w-4' aria-hidden />
                  {t('referralPage.addBtn')}
                </Button>
              )}
            </div>
          </div>

          {/* Wilayah live permanen: region yang dipasang bersamaan dengan isinya
              tidak diumumkan sama sekali oleh pembaca layar. */}
          <p className='sr-only' role='status' aria-live='polite'>
            {isPending
              ? t('referralPage.loadingBody')
              : isError
                ? t('referralPage.loadError')
                : t('referralPage.pageAnnounce', { page, totalPage, count: rows.length })}
          </p>

          <div className='p-3 sm:p-4'>
            {isPending && !isError && (
              <div aria-busy='true'>
                <TableSkeleton />
              </div>
            )}

            {isError && (
              <div className='flex flex-col items-center gap-3 py-6'>
                <ErrorComponent message={t('referralPage.loadError')} />
                <Button variant='outline' onClick={() => void refetch()}>
                  {t('common.refresh')}
                </Button>
              </div>
            )}

            {isSuccess && (
              <>
                {/* Endpoint hanya menerima page+limit, jadi kotak ini menyaring
                    baris yang sudah dimuat saja — cakupannya ditulis permanen
                    di bawahnya supaya tidak terbaca sebagai pencarian global. */}
                <div className='mb-3 space-y-1'>
                  <div className='relative w-full sm:max-w-xs'>
                    <Search
                      className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground'
                      aria-hidden
                    />
                    <Input
                      value={filter}
                      onChange={(event) => setFilter(event.target.value)}
                      placeholder={t('referralPage.filterPlaceholder')}
                      aria-label={t('referralPage.filterPlaceholder')}
                      className='pl-9 pr-9'
                    />
                    {filter && (
                      <button
                        type='button'
                        onClick={() => setFilter('')}
                        aria-label={t('referralPage.filterClear')}
                        className='absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground'
                      >
                        <X className='h-4 w-4' aria-hidden />
                      </button>
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {t('referralPage.filterScopeHint', { count: rows.length })}
                  </p>
                </div>

                <div
                  aria-busy={isPlaceholderData}
                  inert={isPlaceholderData}
                  className={cn(
                    'transition-opacity duration-200',
                    isPlaceholderData && 'opacity-60',
                  )}
                >
                  <DataTable
                    columns={columns}
                    data={visibleRows}
                    getRowId={(row) => row.id}
                    caption={t('referralPage.tableCaption', { page, totalPage })}
                    emptyMessage={emptyMessage}
                  />
                </div>

                <div className='mt-4'>
                  <Pagination page={page} totalPage={totalPage} onChange={setPage} />
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <ReferralFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        referral={formTarget}
      />

      <DeleteReferralDialog
        referral={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      />
    </DashboardLayout>
  )
}
