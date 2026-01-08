import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { OrderStatusPieCard } from '@/components/Dashboard/ChartOrder'
import { RevenueChartCard } from '@/components/Dashboard/ChartRevenue'
// import BackgroundMusic from '@/components/BackgroundMusic'

type OrderStatusData = {
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  total: number
}

export default function DashboardPage() {
  const data: OrderStatusData[] = [
    { status: 'PENDING', total: 12 },
    { status: 'SUCCESS', total: 45 },
    { status: 'FAILED', total: 3 },
  ]
  const revenueData = [
    { date: 'Mon', total: 2500000 },
    { date: 'Tue', total: 3000000 },
    { date: 'Wed', total: 2000000 },
    { date: 'Thu', total: 3500000 },
    { date: 'Fri', total: 1500000 },
  ]

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <OrderStatusPieCard data={data} />
        <RevenueChartCard data={revenueData} />
      </div>
    </DashboardLayout>
  )
}
