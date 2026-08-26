import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, UserCog, X } from 'lucide-react'

import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { DataTable } from '@/components/Layout/table-data'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { EmptyState, TableSkeleton } from '@/components/Layout/table-states'
import { CreateAdminModal } from '@/components/Admin/Create'
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
import { Skeleton } from '@/components/ui/skeleton'
import { getAdminColumns } from '@/tables/table-admin'
import { useAdminData, useGetAdminBrief } from '@/hooks/useAdmin'
import { usePermission } from '@/hooks/usePermission'
import { useAuthUser } from '@/lib/auth'
import { PERM } from '@/constants/permissions'
import { cn } from '@/lib/utils'

const PAGE_SIZES = [10, 20, 50, 100]

export default function AdminManagementPage() {
  const { t, i18n } = useTranslation('common')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(PAGE_SIZES[0])
  const [filter, setFilter] = useState('')
  const listRef = useRef<HTMLElement>(null)

  const { data, isPending, isError, isSuccess, isPlaceholderData, refetch } = useAdminData(
    page,
    limit,
  )
  const { data: brief } = useGetAdminBrief()
  const { can } = usePermission()
  const { user } = useAuthUser()

  const canUpdateRole = can(PERM.ADMIN_UPDATE)
  const canDelete = can(PERM.ADMIN_DELETE)

  /** Daftar utama tidak mengirim nama lengkap; `/admin/brief` memetakan id → nama. */
  const adminName = useMemo(() => {
    const byId = new Map((brief ?? []).map((a) => [a.id, a.name]))
    return (id: string) => byId.get(id) ?? null
  }, [brief])

  const adminColumns = useMemo(
    () =>
      getAdminColumns({
        t,
        currentAdminId: user?.id ?? null,
        canUpdateRole,
        canDelete,
        adminName,
      }),
    [t, user?.id, canUpdateRole, canDelete, adminName],
  )

  const rows = useMemo(() => data?.data ?? [], [data])
  const totalPage = data?.meta?.total_page ?? 1
  const total = data?.meta?.total_data ?? 0
  const locale = i18n.language.startsWith('id') ? 'id-ID' : 'en-US'

  // Menghapus baris terakhir sebuah halaman membuat `page` menunjuk halaman
  // yang sudah tidak ada. Backend membalas daftar kosong dan paginasi bisa
  // ikut hilang, jadi nomor halaman dijepit begitu jumlah halaman menyusut.
  // Penyesuaian dilakukan saat render, bukan di useEffect: efek akan merender
  // sekali dengan nomor halaman yang sudah usang lebih dulu.
  const [lastTotalPage, setLastTotalPage] = useState(totalPage)
  if (isSuccess && totalPage !== lastTotalPage) {
    setLastTotalPage(totalPage)
    if (page > totalPage) setPage(totalPage)
  }

  const visibleRows = useMemo(() => {
    const query = filter.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((row) =>
      [row.username, row.email, row.role_name, row.role, adminName(row.id) ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [rows, filter, adminName])

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    listRef.current?.scrollIntoView({
      block: 'start',
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [page])

  const emptyMessage = filter.trim() ? (
    <EmptyState
      message={t('adminPage.filterNoMatch', { count: rows.length })}
      action={
        <Button variant='outline' size='sm' onClick={() => setFilter('')}>
          {t('adminPage.filterClear')}
        </Button>
      }
    />
  ) : page > 1 && !isPlaceholderData ? (
    // `isPlaceholderData` masih memegang baris halaman sebelumnya; tanpa
    // penjaga ini "halaman ini kosong" sempat berkedip untuk halaman yang
    // sebenarnya berisi, tepat setelah nomor halaman dijepit.
    <EmptyState
      message={t('adminPage.emptyPage')}
      action={
        <Button variant='outline' size='sm' onClick={() => setPage(1)}>
          {t('adminPage.backToFirstPage')}
        </Button>
      }
    />
  ) : (
    <EmptyState message={t('adminPage.emptyMessage')} />
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
              <UserCog className='h-5 w-5' />
            </span>
            <div className='min-w-0 space-y-1'>
              <h2 className='text-2xl font-semibold tracking-tight text-foreground'>
                {t('adminPage.title')}
              </h2>
              <p className='text-sm text-muted-foreground'>
                {canUpdateRole || canDelete
                  ? t('adminPage.subtitle')
                  : t('adminPage.subtitleReadOnly')}
              </p>
            </div>
          </div>
          {/* Jumlah total hanya dinyatakan kalau memang sudah diketahui —
              "Total 0 admin" saat memuat atau gagal adalah klaim yang salah. */}
          {isSuccess ? (
            <p className='text-sm font-medium tabular-nums text-muted-foreground sm:text-right'>
              {t('adminPage.total', {
                count: total,
                total: total.toLocaleString(locale),
              })}
            </p>
          ) : isError ? (
            <p className='text-sm font-medium text-muted-foreground sm:text-right' aria-hidden>
              —
            </p>
          ) : (
            <Skeleton className='h-5 w-24' />
          )}
        </header>

        <section
          ref={listRef}
          className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'
        >
          <div className='flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
            <div className='min-w-0 space-y-0.5'>
              <h3 className='text-sm font-semibold text-foreground'>
                {t('adminPage.listTitle')}
              </h3>
              <p className='text-xs text-muted-foreground'>{t('adminPage.listHint')}</p>
            </div>

            <div className='flex shrink-0 flex-wrap items-center gap-2'>
              <Label
                htmlFor='admin-page-size'
                className='whitespace-nowrap text-xs font-medium text-muted-foreground'
              >
                {t('adminPage.rowsPerPage')}
              </Label>
              <Select
                value={String(limit)}
                onValueChange={(value) => {
                  setLimit(Number(value))
                  setPage(1)
                }}
              >
                <SelectTrigger id='admin-page-size' size='sm' className='w-20'>
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
              {can(PERM.ADMIN_CREATE) && <CreateAdminModal onCreated={() => setPage(1)} />}
            </div>
          </div>

          {/* Wilayah live permanen: region yang baru dipasang bersamaan dengan
              isinya tidak diumumkan sama sekali oleh pembaca layar. */}
          <p className='sr-only' role='status' aria-live='polite'>
            {isPending
              ? t('adminPage.loadingBody')
              : isError
                ? t('adminPage.loadError')
                : t('adminPage.pageAnnounce', { page, totalPage, count: rows.length })}
          </p>

          <div className='p-3 sm:p-4'>
            {isPending && !isError && (
              <div aria-busy='true'>
                <TableSkeleton />
              </div>
            )}

            {isError && (
              <div className='flex flex-col items-center gap-3 py-6'>
                <ErrorComponent message={t('adminPage.loadError')} />
                <Button variant='outline' onClick={() => void refetch()}>
                  {t('common.refresh')}
                </Button>
              </div>
            )}

            {isSuccess && (
              <>
                {/* Endpoint hanya menerima page+limit, jadi kotak ini menyaring
                    baris yang sudah dimuat saja. Cakupannya ditulis permanen di
                    bawah input supaya tidak terbaca sebagai pencarian global. */}
                <div className='mb-3 space-y-1'>
                  <div className='relative w-full sm:max-w-xs'>
                    <Search
                      className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground'
                      aria-hidden
                    />
                    <Input
                      value={filter}
                      onChange={(event) => setFilter(event.target.value)}
                      placeholder={t('adminPage.filterPlaceholder')}
                      aria-label={t('adminPage.filterPlaceholder')}
                      className='pl-9 pr-9'
                    />
                    {filter && (
                      <button
                        type='button'
                        onClick={() => setFilter('')}
                        aria-label={t('adminPage.filterClear')}
                        className='absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground'
                      >
                        <X className='h-4 w-4' aria-hidden />
                      </button>
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {t('adminPage.filterScopeHint', { count: rows.length })}
                  </p>
                </div>

                {/* Baris halaman sebelumnya sengaja dipertahankan selama
                    halaman baru dimuat; peredupan inilah satu-satunya penanda
                    bahwa datanya belum yang terbaru. */}
                <div
                  aria-busy={isPlaceholderData}
                  inert={isPlaceholderData}
                  className={cn(
                    'transition-opacity duration-200',
                    isPlaceholderData && 'opacity-60',
                  )}
                >
                  <DataTable
                    columns={adminColumns}
                    data={visibleRows}
                    getRowId={(row) => row.id}
                    caption={t('adminPage.tableCaption', { page, totalPage })}
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
    </DashboardLayout>
  )
}
