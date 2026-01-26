import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import TableSkeleton from '@/components/Layout/loading'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useGetOrderItem } from '@/hooks/useOrderItem'
import { orderItemColumns } from '@/tables/table-order-item'

export default function OrderPages() {
  const limit = 6
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetOrderItem(page, limit)

  useEffect(() => {
    setPage(1)
  }, [])

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(`Success Load OrderItem`)
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Failed Load OrderItem')
    }
  }, [isSuccess, isError])

  return (
    <DashboardLayout>
      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load Order Item" />}
      {isSuccess && (
        <>
          <DataTable columns={orderItemColumns} data={data?.data ?? []} />{' '}
          <Pagination page={page} totalPage={data?.meta?.total_page} onChange={setPage} />
        </>
      )}
    </DashboardLayout>
  )
}
