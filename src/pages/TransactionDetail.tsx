import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axios'
import PaymentDetail from '@/components/Transaction/TransactionDetail'

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

  if (isLoading) return <div>Loading payment...</div>
  if (isError) return <div>Failed to load payment</div>

  return <PaymentDetail data={data} />
}
