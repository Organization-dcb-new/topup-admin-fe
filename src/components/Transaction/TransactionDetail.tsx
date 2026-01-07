import { Button } from '../ui/button'
import { DashboardLayout } from '../Layout/dashboard-layout'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { format, isValid } from 'date-fns'
import { id } from 'date-fns/locale'

export interface PaymentDetail {
  id: string
  payment_number: string
  order_id: string
  amount: number
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED'
  payment_method_id: string
  payment_channel: 'gopay' | 'va' | 'qris'
  payment_url: string
  qr_code_url: string
  va_number: string
  created_at: string
}

type Props = {
  data: PaymentDetail
}

export default function PaymentDetail({ data }: Props) {
  const navigate = useNavigate()

  const createdAt = data.created_at
  const date = createdAt ? new Date(createdAt) : null

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="text-2xl font-semibold">Payment Detail</h1>
            <p className="text-sm text-gray-500">Complete your payment before it expires</p>
          </div>
        </div>

        {/* Main Panel */}
        <div className="rounded-xl border bg-white shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT - Payment Info */}
          <div className="space-y-3 text-sm">
            <InfoRow label="Payment No" value={data.payment_number} />
            <InfoRow label="Order ID" value={data.order_id} />
            <InfoRow label="Method" value={data.payment_channel.toUpperCase()} />
            <InfoRow label="Status" value={<StatusBadge status={data.status} />} />

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold">Rp {data.amount.toLocaleString('id-ID')}</p>
            </div>

            <p className="text-gray-500">
              Created at{' '}
              {date && isValid(date) ? format(date, 'dd MMM yyyy, HH:mm', { locale: id }) : '-'}
            </p>
          </div>

          {/* RIGHT - Payment Action */}
          <div className="flex items-center justify-center">
            {data.status === 'PENDING' && (
              <>
                {data.payment_channel === 'gopay' && <GopayPayment data={data} />}
                {data.payment_channel === 'qris' && <QrisPayment data={data} />}
              </>
            )}

            {data.status === 'SUCCESS' && (
              <div className="text-center space-y-2">
                <p className="text-green-600 text-lg font-semibold">Payment Successful</p>
                <p className="text-sm text-gray-500">Thank you for your payment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function GopayPayment({ data }: { data: PaymentDetail }) {
  return (
    <div className="space-y-4">
      {data.qr_code_url && (
        <div className="flex flex-col items-center gap-2">
          <img src={data.qr_code_url} alt="GoPay QR" className="w-48 h-48" />
          <p className="text-sm text-gray-500">Scan QR using GoPay app</p>
        </div>
      )}

      {data.payment_url && (
        <Button
          className="w-full cursor-pointer"
          onClick={() => window.open(data.payment_url, '_blank')}
        >
          Open GoPay App
        </Button>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'PAID'
      ? 'bg-green-100 text-green-700'
      : status === 'PENDING'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700'

  return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{status}</span>
}
function QrisPayment({ data }: { data: PaymentDetail }) {
  return (
    <div className="text-center space-y-4">
      <p className="text-sm text-gray-600">Scan QR Code using mobile banking or e-wallet</p>

      <img src={data.qr_code_url} alt="QRIS" className="w-64 h-64 mx-auto rounded-xl border" />

      <p className="text-xs text-yellow-600">Waiting for payment confirmation</p>
    </div>
  )
}
