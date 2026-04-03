import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useResendEmail, useResendVoucherCode } from '@/hooks/useEmail'
import { format, isValid } from 'date-fns'
import { id } from 'date-fns/locale'
import { ArrowLeft, Loader2, Receipt } from 'lucide-react'
import {
  type Dispatch,
  type FC,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

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
  email: string
  margin: number
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
  voucher_code?: string
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

function formatIdr(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

const formatTime = (sec: number) => {
  const minutes = Math.floor(sec / 60)
  const seconds = sec % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const parseWIBDate = (dateString: string) => {
  if (!dateString) return null
  const base = dateString.split(' +')[0]
  const noMs = base.split('.')[0]
  return new Date(noMs.replace(' ', 'T'))
}

const paymentStatusLabel: Record<PaymentDetail['status'], string> = {
  PAID: 'Lunas',
  PENDING: 'Menunggu',
  FAILED: 'Gagal',
  EXPIRED: 'Kadaluarsa',
}

export default function PaymentDetail({ data, isLoading }: Props) {
  const navigate = useNavigate()
  const [voucherCooldown, setVoucherCooldown] = useState(0)
  const [emailCooldown, setEmailCooldown] = useState(0)

  const VOUCHER_KEY = 'voucherCooldownExpire'
  const EMAIL_KEY = 'emailCooldownExpire'

  const { mutateAsync, isPending: isResendingVoucher } = useResendVoucherCode()
  const { mutateAsync: resendEmailMutateAsync, isPending: isResendingEmail } = useResendEmail()

  const date = parseWIBDate(data.created_at)

  const handleResendVoucherCodeEmail = async (paymentId: string) => {
    await mutateAsync(paymentId)
    const expire = Date.now() + 10 * 60 * 1000
    localStorage.setItem(VOUCHER_KEY, expire.toString())
    setVoucherCooldown(Math.floor((expire - Date.now()) / 1000))
  }

  const handleResendPaymentEmail = async (paymentId: string) => {
    await resendEmailMutateAsync(paymentId)
    const expire = Date.now() + 10 * 60 * 1000
    localStorage.setItem(EMAIL_KEY, expire.toString())
    setEmailCooldown(Math.floor((expire - Date.now()) / 1000))
  }

  useEffect(() => {
    const loadCooldown = (key: string, setter: (v: number) => void) => {
      const saved = localStorage.getItem(key)
      if (!saved) return
      const diff = Math.floor((Number(saved) - Date.now()) / 1000)
      if (diff > 0) setter(diff)
      else localStorage.removeItem(key)
    }
    loadCooldown(VOUCHER_KEY, setVoucherCooldown)
    loadCooldown(EMAIL_KEY, setEmailCooldown)
  }, [])

  useEffect(() => {
    const startTimer = (
      cooldown: number,
      setCooldown: Dispatch<SetStateAction<number>>,
      key: string,
    ) => {
      if (cooldown <= 0) return
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            localStorage.removeItem(key)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }

    const v = startTimer(voucherCooldown, setVoucherCooldown, VOUCHER_KEY)
    const e = startTimer(emailCooldown, setEmailCooldown, EMAIL_KEY)
    return () => {
      v?.()
      e?.()
    }
  }, [voucherCooldown, emailCooldown])

  const PaymentAction =
    data.status === 'PENDING' ? paymentComponentMap[data.payment_channel] : null

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mt-0.5 shrink-0 rounded-full"
              aria-label="Kembali"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </Button>
            <div className="flex min-w-0 gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Receipt className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                  Detail transaksi
                </h1>
                <p className="text-sm text-muted-foreground">
                  {data.status === 'PENDING'
                    ? 'Selesaikan pembayaran sebelum kedaluwarsa.'
                    : 'Informasi pembayaran dan pesanan.'}
                </p>
                <p className="font-mono text-xs text-muted-foreground tabular-nums">{data.id}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-900/5 sm:p-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
            <div className="space-y-3 text-sm">
              <InfoRow label="Nomor bayar" value={data.payment_number} mono />
              <InfoRow label="ID pesanan" value={data.order_id} mono muted />
              <InfoRow label="Kanal" value={data.payment_channel.toUpperCase()} />
              <InfoRow
                label="Status pembayaran"
                value={<PaymentStatusBadge status={data.status} />}
              />
              <InfoRow
                label="Email"
                value={
                  <span className="max-w-[14rem] break-all text-right text-sm">{data.email}</span>
                }
              />
              <InfoRow label="Nomor pesanan" value={data.order.order_number} mono />
              <InfoRow label="Produk" value={data.order_item.product_name} />
              <InfoRow label="Jumlah" value={`${data.order_item.quantity} item`} />
              <InfoRow
                label="Status pesanan"
                value={<OrderStatusBadge status={data.order.status} />}
              />
              <InfoRow label="Margin" value={formatIdr(data.margin)} mono />

              <div className="border-t border-border/80 pt-4">
                <p className="text-xs font-medium text-muted-foreground">Total bayar</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {formatIdr(data.amount)}
                </p>
              </div>

              <div className="text-sm text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Dibuat
                </span>
                <p className="mt-0.5 tabular-nums">
                  {date && isValid(date)
                    ? format(date, 'dd MMM yyyy, HH:mm', { locale: id })
                    : '—'}{' '}
                  <span className="text-xs">(WIB)</span>
                </p>
              </div>
            </div>

            <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/15 p-4">
              {isLoading && <PaymentActionSpinner />}

              {!isLoading && PaymentAction && <PaymentAction data={data} />}

              {!isLoading && data.status === 'PAID' && !PaymentAction && (
                <div className="space-y-2 text-center">
                  <p className="text-lg font-semibold text-emerald-600">Pembayaran berhasil</p>
                  <p className="text-sm text-muted-foreground">Terima kasih, pembayaran telah diterima.</p>
                </div>
              )}

              {!isLoading && data.status === 'FAILED' && (
                <p className="text-center text-sm font-medium text-destructive">Pembayaran gagal</p>
              )}

              {!isLoading && data.status === 'EXPIRED' && (
                <p className="text-center text-sm font-medium text-muted-foreground">
                  Pembayaran kedaluwarsa
                </p>
              )}
            </div>

            <div className="flex flex-col gap-6 border-t border-border/80 pt-6 md:col-span-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-8">
              {!isLoading &&
                data.status === 'PAID' &&
                data.order_item?.voucher_code && (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-muted-foreground">Kirim ulang kode voucher</p>
                    <Button
                      type="button"
                      onClick={() => handleResendVoucherCodeEmail(data.id)}
                      disabled={isResendingVoucher || voucherCooldown > 0}
                      variant="secondary"
                    >
                      {voucherCooldown > 0
                        ? `Tunggu ${formatTime(voucherCooldown)}`
                        : 'Kirim ulang voucher'}
                    </Button>
                  </div>
                )}

              {!isLoading && data.status === 'PAID' && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-muted-foreground">Kirim ulang email pembayaran</p>
                  <Button
                    type="button"
                    onClick={() => handleResendPaymentEmail(data.id)}
                    disabled={isResendingEmail || emailCooldown > 0}
                    variant="secondary"
                  >
                    {emailCooldown > 0
                      ? `Tunggu ${formatTime(emailCooldown)}`
                      : 'Kirim ulang email'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

type PaymentChannel = PaymentDetail['payment_channel']

const paymentComponentMap: Record<PaymentChannel, FC<{ data: PaymentDetail }>> = {
  gopay: GopayPayment,
  qris: QrisPayment,
  shopeepay: ShopeepayPayment,
  va: VaPayment,
}

function GopayPayment({ data }: { data: PaymentDetail }) {
  return (
    <div className="w-full max-w-sm space-y-4">
      {data.qr_code_url && (
        <div className="flex flex-col items-center gap-2">
          <img
            src={data.qr_code_url}
            alt="QR GoPay"
            className="h-48 w-48 rounded-lg border object-contain"
          />
          <p className="text-center text-sm text-muted-foreground">Pindai QR dengan aplikasi GoPay</p>
        </div>
      )}
      {data.payment_url && (
        <Button
          type="button"
          className="w-full"
          onClick={() => window.open(data.payment_url, '_blank')}
        >
          Buka GoPay
        </Button>
      )}
    </div>
  )
}

function ShopeepayPayment({ data }: { data: PaymentDetail }) {
  return (
    <div className="w-full max-w-sm space-y-4 text-center">
      <p className="text-sm text-muted-foreground">Anda akan diarahkan ke aplikasi ShopeePay</p>
      <Button
        type="button"
        className="w-full"
        onClick={() => window.open(data.payment_url, '_blank')}
        disabled={!data.payment_url}
      >
        Buka ShopeePay
      </Button>
      <p className="text-xs text-amber-600 dark:text-amber-500">
        Selesaikan pembayaran di aplikasi Shopee
      </p>
    </div>
  )
}

function QrisPayment({ data }: { data: PaymentDetail }) {
  return (
    <div className="w-full max-w-sm space-y-4 text-center">
      <p className="text-sm text-muted-foreground">
        Pindai QR dengan mobile banking atau dompet digital
      </p>
      <img
        src={data.qr_code_url}
        alt="QRIS"
        className="mx-auto h-64 w-64 rounded-xl border object-contain"
      />
      <p className="text-xs text-amber-600 dark:text-amber-500">Menunggu konfirmasi pembayaran</p>
    </div>
  )
}

function VaPayment({ data }: { data: PaymentDetail }) {
  return (
    <div className="w-full max-w-sm space-y-3 text-center">
      <p className="text-sm text-muted-foreground">Nomor virtual account</p>
      <div className="rounded-lg border border-border/80 bg-muted/30 p-4 font-mono text-lg tabular-nums">
        {data.va_number || '—'}
      </div>
      <p className="text-xs text-amber-600 dark:text-amber-500">
        Selesaikan transfer sebelum batas waktu
      </p>
    </div>
  )
}

function InfoRow({
  label,
  value,
  mono,
  muted,
}: {
  label: string
  value: ReactNode
  mono?: boolean
  muted?: boolean
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/40 py-2 last:border-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        className={cn(
          'min-w-0 text-right font-medium',
          mono && 'font-mono text-sm tabular-nums',
          muted && 'text-muted-foreground',
        )}
      >
        {value}
      </span>
    </div>
  )
}

function PaymentStatusBadge({ status }: { status: PaymentDetail['status'] }) {
  const variant =
    status === 'PAID'
      ? 'success'
      : status === 'PENDING'
        ? 'outline'
        : 'destructive'
  return (
    <Badge
      variant={variant}
      className={cn(status === 'PAID' && 'border-transparent bg-emerald-600 hover:bg-emerald-600')}
    >
      {paymentStatusLabel[status]}
    </Badge>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="secondary" className="max-w-[12rem] truncate font-normal">
      {status}
    </Badge>
  )
}

function PaymentActionSpinner() {
  return (
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <p className="text-sm">Memuat…</p>
    </div>
  )
}
