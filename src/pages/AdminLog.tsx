import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ClipboardList, Inbox } from 'lucide-react'

import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { AdminLogDrawer } from '@/components/AdminLog/AdminLogDrawer'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useGetAdminLogs } from '@/hooks/useAdminLog'
import { useGetAdminBrief } from '@/hooks/useAdmin'
import { getAdminLogColumns } from '@/tables/table-admin-log'

const PAGE_SIZES = [20, 50, 100]

function TableSkeleton() {
  return (
    <div className='space-y-2 p-1'>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className='h-12 w-full rounded-lg' />
      ))}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className='flex flex-col items-center gap-3 px-4 py-14 text-center'>
      <span
        className='flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground'
        aria-hidden
      >
        <Inbox className='h-6 w-6' />
      </span>
      <p className='text-sm text-muted-foreground'>{message}</p>
    </div>
  )
}

export default function AdminLogPage() {
  const { t, i18n } = useTranslation('common')
  const navigate = useNavigate()
  // Detail dibuka sebagai drawer, tapi tetap punya URL sendiri agar bisa
  // dibagikan — kebutuhan wajar untuk alat audit
  const { id: openLogId } = useParams<{ id: string }>()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(PAGE_SIZES[0])

  const { data, isLoading, isError, isSuccess } = useGetAdminLogs(page, limit)
  const { data: admins } = useGetAdminBrief()

  /** Backend hanya mengirim AdminID; nama diambil dari daftar ringkas admin. */
  const adminName = useMemo(() => {
    const byId = new Map((admins ?? []).map((a) => [a.id, a.name]))
    return (adminId: string) =>
      byId.get(adminId) ?? `${adminId.slice(0, 8)}…`
  }, [admins])

  const columns = useMemo(
    () =>
      getAdminLogColumns({
        t,
        adminName,
        onOpenDetail: (log) => navigate(`/admin-logs/${log.ID}`),
      }),
    [t, adminName, navigate],
  )

  const total = data?.meta?.total_data ?? 0
  const locale = i18n.language.startsWith('id') ? 'id-ID' : 'en-US'

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='flex gap-3'>
            <span
              className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'
              aria-hidden
            >
              <ClipboardList className='h-5 w-5' />
            </span>
            <div className='min-w-0 space-y-1'>
              {/* h2, bukan h1: navbar sudah merender h1 judul halaman */}
              <h2 className='text-2xl font-semibold tracking-tight text-foreground'>
                {t('adminLogPage.title')}
              </h2>
              <p className='text-sm text-muted-foreground'>
                {t('adminLogPage.subtitle')}
              </p>
            </div>
          </div>

          <div className='flex shrink-0 items-center gap-3'>
            <p className='text-sm font-medium tabular-nums text-muted-foreground'>
              {t('adminLogPage.total', { total: total.toLocaleString(locale) })}
            </p>
          </div>
        </header>

        <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          <div className='flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
            <div className='min-w-0 space-y-0.5'>
              <h3 className='text-sm font-semibold text-foreground'>
                {t('adminLogPage.listTitle')}
              </h3>
              <p className='text-xs text-muted-foreground'>
                {t('adminLogPage.listHint')}
              </p>
            </div>

            <div className='flex shrink-0 items-center gap-2'>
              <Label
                htmlFor='admin-log-page-size'
                className='whitespace-nowrap text-xs font-medium text-muted-foreground'
              >
                {t('adminLogPage.rowsPerPage')}
              </Label>
              <Select
                value={String(limit)}
                onValueChange={(value) => {
                  setLimit(Number(value))
                  setPage(1)
                }}
              >
                <SelectTrigger
                  id='admin-log-page-size'
                  size='sm'
                  className='w-20'
                >
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
            </div>
          </div>

          <div className='p-3 sm:p-4'>
            {isLoading && (
              <div role='status' aria-busy='true' aria-live='polite'>
                <span className='sr-only'>{t('adminLogPage.loadingBody')}</span>
                <TableSkeleton />
              </div>
            )}

            {isError && <ErrorComponent message={t('adminLogPage.loadError')} />}

            {isSuccess && (
              <>
                <div className='max-h-[min(70vh,40rem)] w-full min-w-0 overflow-auto overscroll-contain'>
                  <DataTable
                    columns={columns}
                    data={data?.data ?? []}
                    stickyHeader
                    emptyMessage={
                      <EmptyState message={t('adminLogPage.emptyMessage')} />
                    }
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
        </section>
      </div>

      <AdminLogDrawer
        logId={openLogId ?? null}
        adminName={adminName}
        onClose={() => navigate('/admin-logs')}
      />
    </DashboardLayout>
  )
}
