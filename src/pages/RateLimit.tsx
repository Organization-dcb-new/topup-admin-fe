import React from 'react'
import { Gauge, Loader2 } from 'lucide-react'
import { rateLimitColumns } from '@/tables/table-rate-limit'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { DataTable } from '@/components/Layout/table-data'
import ModalRateLimit from '@/components/RateLimit/RateLimit'
import { useRateLimitData } from '@/hooks/useRateLimiter'
import Pagination from '@/components/Layout/Pagination'
import {
  nbAccent,
  nbPageIcon,
  nbPageSubtitle,
  nbPageTitle,
  nbPagination,
  nbPanel,
  nbSectionTitle,
  nbTable,
} from '@/lib/nb'
import { cn } from '@/lib/utils'

export default function RateLimitPage() {
  const [page, setPage] = React.useState(1)
  const limit = 10

  const { data, isLoading } = useRateLimitData(page, limit)

  const columns = React.useMemo(() => rateLimitColumns, [])

  const items = data?.items ?? []
  const meta = data?.meta

  return (
    <DashboardLayout>
      <div className='mx-auto min-w-0 max-w-7xl space-y-5'>
        <div
          className={cn(
            nbPanel,
            'flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5',
          )}
        >
          <div className='flex gap-3'>
            <span className={cn(nbPageIcon, nbAccent.orange)}>
              <Gauge className='h-5 w-5' strokeWidth={2.5} aria-hidden />
            </span>
            <div className='min-w-0 space-y-1.5'>
              <h1 className={nbPageTitle}>Rate Limit Settings</h1>
              <p className={nbPageSubtitle}>
                Manage request thresholds for PakarGaming API services.
              </p>
            </div>
          </div>
          <div className='flex shrink-0 sm:justify-end'>
            <ModalRateLimit />
          </div>
        </div>

        {isLoading ? (
          <div
            className={cn(
              nbPanel,
              'flex min-h-[16rem] flex-col items-center justify-center gap-4 py-12',
            )}
            role='status'
            aria-live='polite'
            aria-busy='true'
          >
            <span
              className={cn(
                'nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center',
                nbAccent.cyan,
              )}
            >
              <Loader2 className='h-7 w-7 animate-spin' strokeWidth={3} aria-hidden />
            </span>
            <p className={nbSectionTitle}>Synchronizing with server…</p>
          </div>
        ) : (
          <>
            <DataTable
              className={nbTable}
              getRowId={(row) => row.key}
              columns={columns}
              data={items}
              emptyMessage='No rate limit configured yet'
            />
            <Pagination
              className={nbPagination}
              onChange={setPage}
              page={meta?.page ?? 1}
              totalPage={meta?.total_page ?? 1}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
