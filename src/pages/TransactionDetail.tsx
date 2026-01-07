import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axios'
import PaymentDetail from '@/components/Transaction/TransactionDetail'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { Loader2 } from 'lucide-react'

export default function PaymentDetailPage() {
  const { paymentId } = useParams<{ paymentId: string }>()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payment-detail', paymentId],
    queryFn: async () => {
      const res = await api.get(`/payments/${paymentId}`)
      return res.data.data
    },
    enabled: !!paymentId,
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }
  if (isError) return <div>Failed to load payment</div>

  return <PaymentDetail data={data} isLoading={isLoading} />
}
