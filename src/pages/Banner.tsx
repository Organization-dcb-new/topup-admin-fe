import { CreateBannerModal } from '@/components/Banner/CreateBannerModal'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { DataTable } from '@/components/Layout/table-data'
import { useGetBanners } from '@/hooks/useBanner'
import { bannerColumns } from '@/tables/table-banner'

export default function BannerPage() {
  const { data } = useGetBanners()

  return (
    <DashboardLayout>
      <div className="flex justify-end mb-4">
        <CreateBannerModal />
      </div>
      <DataTable columns={bannerColumns} data={data?.data ?? []} />{' '}
    </DashboardLayout>
  )
}
