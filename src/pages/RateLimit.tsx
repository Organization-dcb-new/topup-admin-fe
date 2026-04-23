import React from 'react'
import { Loader2 } from 'lucide-react'
import { rateLimitColumns } from '@/tables/table-rate-limit' // Pastikan ini export const
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { DataTable } from '@/components/Layout/table-data'
import ModalRateLimit from '@/components/RateLimit/RateLimit'
import { useRateLimitData } from '@/hooks/useRateLimiter'
import Pagination from '@/components/Layout/Pagination'

export default function RateLimitPage() {
  const [page, setPage] = React.useState(1)
  const limit = 10

  const { data, isLoading } = useRateLimitData(page, limit)

  const columns = React.useMemo(() => rateLimitColumns, [])

  const items = data?.items ?? []
  const meta = data?.meta

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border shadow-sm'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>
              Rate Limit Settings
            </h1>
            <p className='text-sm text-gray-500 mt-1'>
              Manage request thresholds for PakarGaming API services.
            </p>
          </div>
          <div className='shrink-0'>
            <ModalRateLimit />
          </div>
        </div>

        {/* Table Section */}
        {isLoading ? (
          <div className='flex flex-col items-center justify-center h-64 gap-3'>
            <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
            <p className='text-sm text-gray-500 font-medium'>
              Synchronizing with server...
            </p>
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={items || []} />
            <Pagination
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
