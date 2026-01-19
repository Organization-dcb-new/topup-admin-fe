import { Button } from '../ui/button'
import { DashboardLayout } from '../Layout/dashboard-layout'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format, isValid } from 'date-fns'
import { id } from 'date-fns/locale'
import React from 'react'

/* =======================
   TYPES
======================= */

export interface PaymentDetail {
  id: string
  payment_number: string
  order_id: string
  amount: number
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED'
  payment_method_id: string
  payment_channel: 'gopay' | 'va' | 'qris' | 'shopeepay'
  payment_url: string
  qr_code_url: string
  va_number: string
  created_at: string
  order: Order
  order_item: OrderItem
}

export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Order {
  id: string
  order_number: string
  status: string
  subtotal: number
  discount_amount: number
  loyalty_discount: number
  tax_amount: number
  total_amount: number
  payment_method: string
  created_at: string
}

type Props = {
  data: PaymentDetail
  isLoading: boolean
}

/* =======================
   MAIN COMPONENT
======================= */

export default function PaymentDetail({ data, isLoading }: Props) {
  const navigate = useNavigate()

  const date = data?.created_at ? new Date(data.created_at) : null

  const PaymentAction = data.status === 'PENDING' ? paymentComponentMap[data.payment_channel] : null

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
          {/* LEFT */}
          <div className="space-y-3 text-sm">
            <InfoRow label="Payment No" value={data.payment_number} />
            <InfoRow label="Order ID" value={data.order_id} />
            <InfoRow label="Method" value={data.payment_channel.toUpperCase()} />
            <InfoRow label="Status" value={<StatusBadge status={data.status} />} />
            <InfoRow label="Order No" value={data.order.order_number} />
            <InfoRow label="Product" value={data.order_item.product_name} />
            <InfoRow label="Quantity" value={`${data.order_item.quantity} item`} />
            <InfoRow label="Order Status" value={<StatusBadge status={data.order.status} />} />

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold">Rp {data.amount.toLocaleString('id-ID')}</p>
            </div>

            <p className="text-gray-500">
              Created at{' '}
              {date && isValid(date) ? format(date, 'dd MMM yyyy, HH:mm', { locale: id }) : '-'}
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex items-center justify-center">
            {isLoading && <PaymentActionSpinner />}

            {!isLoading && PaymentAction && <PaymentAction data={data} />}

            {!isLoading && data.status === 'PAID' && (
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

/* =======================
   PAYMENT COMPONENT MAP
======================= */

type PaymentChannel = PaymentDetail['payment_channel']

const paymentComponentMap: Record<PaymentChannel, React.FC<{ data: PaymentDetail }>> = {
  gopay: GopayPayment,
  qris: QrisPayment,
  shopeepay: ShopeepayPayment,
  va: VaPayment,
}

/* =======================
   PAYMENT UI
======================= */

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

function ShopeepayPayment({ data }: { data: PaymentDetail }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-sm text-gray-600">You will be redirected to ShopeePay app</p>

      <Button
        className="w-full cursor-pointer"
        onClick={() => window.open(data.payment_url, '_blank')}
        disabled={!data.payment_url}
      >
        Open ShopeePay App
      </Button>

      <p className="text-xs text-yellow-600">Please complete the payment in Shopee app</p>
    </div>
  )
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

function VaPayment({ data }: { data: PaymentDetail }) {
  return (
    <div className="space-y-3 text-center">
      <p className="text-sm text-gray-600">Virtual Account Number</p>

      <div className="p-4 border rounded-lg text-lg font-mono">{data.va_number || '-'}</div>

      <p className="text-xs text-yellow-600">Complete payment before expiration</p>
    </div>
  )
}

/* =======================
   SHARED UI
======================= */

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}

const statusStyleMap: Record<string, string> = {
  PAID: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  FAILED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-gray-100 text-gray-600',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        statusStyleMap[status] ?? 'bg-gray-100 text-gray-600'
      }`}
    >
      {status}
    </span>
  )
}

function PaymentActionSpinner() {
  return (
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}
