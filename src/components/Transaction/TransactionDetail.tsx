import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { PaymentStatusTag } from '@/components/Transaction/TransactionCells'
import { CopyButton } from '@/components/ui/copy-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useResendEmail, useResendVoucherCode } from '@/hooks/useEmail'
import { format, isValid } from 'date-fns'
import {
  ArrowLeft,
  Check,
  CreditCard,
  Loader2,
  User,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import {
  type Dispatch,
  type FC,
  type SetStateAction,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export interface PaymentDetail {
  id: string;
  payment_number: string;
  order_id: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'PROCESSING' | 'EXPIRED';
  payment_method_id: string;
  payment_channel: 'gopay' | 'va' | 'qris' | 'shopeepay';
  payment_url: string;
  qr_code_url: string;
  va_number: string;
  created_at: string;
  email: string;
  sku: string;
  tid: string;
  meta_data: Record<string, unknown>;
  ip_address: string;
  margin: number;
  status_provider?: string;
  order: Order;
  order_item: OrderItem;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  voucher_code?: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  loyalty_discount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  created_at: string;
}

type Props = {
  data: PaymentDetail;
  isLoading: boolean;
  hideLayout?: boolean;
};

const CARD = 'nb-frame nb-frame-thick nb-sd bg-white'
const CARD_HEAD = 'flex items-center gap-2 border-b-4 border-[#111] px-4 py-3'
const CARD_TITLE = 'text-sm font-black uppercase tracking-tight'
const FIELD_LABEL = 'text-[10px] font-black uppercase tracking-[0.14em] text-[#111]/60'
const ACTION_BTN =
  'nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-11 w-full cursor-pointer items-center justify-center gap-2 px-4 text-xs font-black uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-55'

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

/** Tombol salin ukuran kecil dengan teks bantuan dari i18n. */
function DetailCopy({ value, className }: { value: string; className?: string }) {
  const { t } = useTranslation('common')
  return (
    <CopyButton
      value={value}
      label={t('transactionTable.copyIdTitle')}
      errorLabel={t('transactionTable.copyError')}
      className={cn('h-7 w-7', className)}
    />
  )
}

/** Kotak nilai yang bisa disalin (email, VA, TID, dsb.). */
function CopyField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className='space-y-1'>
      <span className={FIELD_LABEL}>{label}</span>
      <div className='nb-frame nb-frame-thin flex items-center justify-between gap-2 bg-[#f5f1e8] p-2'>
        <span className={cn('truncate text-xs font-bold', mono && 'font-mono')} title={value}>
          {value}
        </span>
        <DetailCopy value={value} />
      </div>
    </div>
  )
}

function StepProgressTimeline({ status, createdAt }: { status: PaymentDetail['status']; createdAt: string }) {
  const date = parseWIBDate(createdAt)
  const formattedDate = date && isValid(date) ? format(date, 'MMM dd, yyyy, HH:mm') : ''

  const steps = [
    { key: 'created', label: 'Order Created', done: true, active: false, desc: formattedDate },
    {
      key: 'processing',
      label: 'Processing Payment',
      done: status === 'PAID' || status === 'PROCESSING' || status === 'FAILED',
      active: status === 'PROCESSING' || status === 'PENDING',
      desc: status === 'PENDING' ? 'Awaiting customer payment' : 'Verifying through provider'
    },
    {
      key: 'completed',
      label: status === 'FAILED' ? 'Transaction Failed' : status === 'EXPIRED' ? 'Transaction Expired' : 'Completed',
      done: status === 'PAID' || status === 'FAILED' || status === 'EXPIRED',
      active: status === 'PAID' || status === 'FAILED' || status === 'EXPIRED',
      desc: status === 'PAID' ? 'Payment confirmed successfully' : status === 'FAILED' ? 'Payment declined' : status === 'EXPIRED' ? 'Payment window closed' : 'Waiting for completion'
    }
  ]

  return (
    <div className={cn(CARD, 'h-full')}>
      <div className={cn(CARD_HEAD, 'bg-[#ff9ed2]')}>
        <h3 className={CARD_TITLE}>Step Progress Timeline</h3>
      </div>
      <div className='p-4'>
        <div className='relative ml-3 flex flex-col gap-6 border-l-4 border-[#111] pl-6'>
          {steps.map((step) => (
            <div key={step.key} className='relative flex flex-col gap-1'>
              {/* Simpul kotak, bukan bulat — tetap dua penanda: warna + ikon centang. */}
              <span
                className={cn(
                  'nb-frame nb-frame-thin absolute -left-[2.35rem] top-0.5 flex h-5 w-5 shrink-0 items-center justify-center',
                  step.active ? 'bg-[#6fe3f5]' : step.done ? 'bg-[#c9f24d]' : 'bg-white',
                )}
              >
                {step.done ? (
                  <Check className='h-3 w-3' strokeWidth={4} aria-hidden />
                ) : (
                  <span className='h-1.5 w-1.5 bg-[#111]/40' aria-hidden />
                )}
              </span>
              <span
                className={cn(
                  'text-sm font-black uppercase tracking-tight',
                  !step.done && 'text-[#111]/45',
                )}
              >
                {step.label}
              </span>
              {step.desc && (
                <span className='text-[11px] font-bold text-[#111]/60'>{step.desc}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PaymentDetail({ data, isLoading, hideLayout }: Props) {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const [voucherCooldown, setVoucherCooldown] = useState(0)
  const [emailCooldown, setEmailCooldown] = useState(0)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  const VOUCHER_KEY = 'voucherCooldownExpire'
  const EMAIL_KEY = 'emailCooldownExpire'

  const { mutateAsync, isPending: isResendingVoucher } = useResendVoucherCode()
  const { mutateAsync: resendEmailMutateAsync, isPending: isResendingEmail } =
    useResendEmail()

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
    data.status === 'PENDING'
      ? paymentComponentMap[data.payment_channel]
      : null

  const date = parseWIBDate(data.created_at)
  const formattedDate = date && isValid(date) ? format(date, 'MMMM dd, yyyy, HH:mm') : '—'

  const layoutContent = (
    <>
      <div className='mx-auto min-w-0 max-w-7xl space-y-5'>
        {/* Baris navigasi + ID transaksi */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-10 shrink-0 cursor-pointer items-center gap-2 self-start bg-white px-3 text-xs font-black uppercase tracking-[0.12em]'
          >
            <ArrowLeft className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
            {t('transactionDetailPage.backButton') || 'Back'}
          </button>

          <div className='nb-frame nb-frame-thin nb-sd-sm flex min-w-0 items-center gap-2 bg-[#ffd84d] px-3 py-1.5'>
            <span className='shrink-0 text-[10px] font-black uppercase tracking-[0.14em]'>
              TX_ID:
            </span>
            <span className='truncate font-mono text-xs font-bold' title={data.id}>
              {data.id}
            </span>
            <DetailCopy value={data.id} />
          </div>
        </div>

        {/* Ringkasan invoice + linimasa */}
        <div className='grid gap-5 md:grid-cols-3'>
          <div className={cn(CARD, 'flex min-h-[14rem] flex-col justify-between md:col-span-2')}>
            <div className={cn(CARD_HEAD, 'bg-[#c9f24d]')}>
              <h3 className={CARD_TITLE}>Invoice Summary</h3>
            </div>

            <div className='flex flex-1 flex-col justify-between p-4'>
              <div className='space-y-1.5'>
                <p className={FIELD_LABEL}>Total Amount</p>
                <p className='text-4xl font-black leading-none tabular-nums tracking-tight'>
                  {formatIdr(data.amount)}
                </p>
              </div>

              <div className='mt-6 grid grid-cols-1 gap-4 border-t-4 border-[#111] pt-4 sm:grid-cols-3'>
                <div className='space-y-1'>
                  <span className={FIELD_LABEL}>Status</span>
                  <div className='flex'>
                    <PaymentStatusTag status={data.status} t={t} />
                  </div>
                </div>

                <div className='space-y-1'>
                  <span className={FIELD_LABEL}>Date</span>
                  <p className='text-xs font-bold tabular-nums'>{formattedDate}</p>
                </div>

                <div className='space-y-1'>
                  <span className={FIELD_LABEL}>Payment Channel</span>
                  <p className='text-xs font-black uppercase tracking-tight'>
                    {data.payment_channel}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='md:col-span-1'>
            <StepProgressTimeline status={data.status} createdAt={data.created_at} />
          </div>
        </div>

        {/* Rincian produk & pelanggan */}
        <div className='grid gap-5 md:grid-cols-3'>
          <div className='space-y-5 md:col-span-2'>
            <div className={CARD}>
              <div className={cn(CARD_HEAD, 'bg-[#6fe3f5]')}>
                <ShoppingBag className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                <h3 className={CARD_TITLE}>Product Information</h3>
              </div>

              <div className='space-y-5 p-4'>
                <div className='overflow-x-auto'>
                  <table className='w-full min-w-max text-left text-xs'>
                    <thead>
                      <tr className='border-b-4 border-[#111]'>
                        <th scope='col' className='pb-2 text-[10px] font-black uppercase tracking-[0.12em]'>
                          Item Description
                        </th>
                        <th scope='col' className='pb-2 text-center text-[10px] font-black uppercase tracking-[0.12em]'>
                          Qty
                        </th>
                        <th scope='col' className='pb-2 text-right text-[10px] font-black uppercase tracking-[0.12em]'>
                          Unit Price
                        </th>
                        <th scope='col' className='pb-2 text-right text-[10px] font-black uppercase tracking-[0.12em]'>
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className='py-4 pr-4 align-top'>
                          <div className='space-y-1'>
                            <p className='text-sm font-black uppercase tracking-tight'>
                              {data.order_item.product_name}
                            </p>
                            <p className='font-mono text-[10px] font-bold text-[#111]/60'>
                              SKU: {data.sku}
                            </p>
                          </div>
                        </td>
                        <td className='py-4 text-center align-top font-black tabular-nums'>
                          {data.order_item.quantity}
                        </td>
                        <td className='py-4 text-right align-top font-bold tabular-nums'>
                          {formatIdr(data.amount)}
                        </td>
                        <td className='py-4 text-right align-top font-black tabular-nums'>
                          {formatIdr(data.amount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Subtotal & margin */}
                <div className='flex flex-col items-end gap-2.5 border-t-4 border-[#111] pt-4 text-xs'>
                  <div className='flex w-64 justify-between font-bold'>
                    <span className='text-[#111]/60'>Order ID:</span>
                    <span className='font-mono font-black'>{data.order.order_number}</span>
                  </div>
                  <div className='flex w-64 items-center justify-between font-bold'>
                    <span className='text-[#111]/60'>Profit Margin:</span>
                    <span
                      className={cn(
                        'px-1 font-black tabular-nums',
                        data.margin < 0 ? 'bg-[#ff4d3d]' : 'bg-[#c9f24d]',
                      )}
                    >
                      {formatIdr(data.margin)}
                    </span>
                  </div>
                  <div className='flex w-64 justify-between border-t-2 border-[#111]/20 pt-2.5 text-sm font-black uppercase tracking-tight'>
                    <span>Grand Total:</span>
                    <span className='tabular-nums'>{formatIdr(data.amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata game */}
            {data.meta_data && Object.keys(data.meta_data).length > 0 && (
              <div className={CARD}>
                <div className={cn(CARD_HEAD, 'bg-[#ff9d3d]')}>
                  <ShieldCheck className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                  <h3 className={CARD_TITLE}>Metadata Game</h3>
                </div>
                <div className='grid gap-3 p-4 sm:grid-cols-2'>
                  {Object.entries(data.meta_data).map(([key, value]) => (
                    <div
                      key={key}
                      className='nb-frame nb-frame-thin flex items-center justify-between gap-2 bg-[#f5f1e8] p-3'
                    >
                      <div className='min-w-0 space-y-0.5'>
                        <span className='block text-[9px] font-black uppercase tracking-[0.14em] text-[#111]/60'>
                          {key}
                        </span>
                        <p className='truncate font-mono text-sm font-bold' title={String(value)}>
                          {String(value)}
                        </p>
                      </div>
                      <DetailCopy value={String(value)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panel pelanggan & pembayaran */}
          <div className='space-y-5 md:col-span-1'>
            <div className={CARD}>
              <div className={cn(CARD_HEAD, 'bg-[#ffd84d]')}>
                <User className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                <h3 className={CARD_TITLE}>Customer Information</h3>
              </div>

              <div className='space-y-4 p-4'>
                <CopyField label='Customer Email' value={data.email} />

                <div className='space-y-1'>
                  <span className={FIELD_LABEL}>IP Address</span>
                  <p className='font-mono text-xs font-bold'>{data.ip_address || '—'}</p>
                </div>

                {data.tid && <CopyField label='TID / Reference Code' value={data.tid} mono />}
              </div>
            </div>

            <div className={CARD}>
              <div className={cn(CARD_HEAD, 'bg-[#6fe3f5]')}>
                <CreditCard className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                <h3 className={CARD_TITLE}>Payment Details</h3>
              </div>

              <div className='space-y-4 p-4'>
                <CopyField label='Payment Number' value={data.payment_number} mono />
                {data.va_number && <CopyField label='VA Number' value={data.va_number} mono />}

                <div className='space-y-1'>
                  <span className={FIELD_LABEL}>Provider Status</span>
                  <div className='flex'>
                    <span
                      className={cn(
                        'nb-frame nb-frame-thin inline-flex items-center px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em]',
                        data.status_provider === 'SUCCESS' ? 'bg-[#c9f24d]' : 'bg-white',
                      )}
                    >
                      {data.status_provider || '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol aksi */}
            {(!isLoading || data.status === 'PENDING') && (
              <div className={CARD}>
                <div className={cn(CARD_HEAD, 'bg-[#f5f1e8]')}>
                  <h3 className={CARD_TITLE}>Actions</h3>
                </div>

                <div className='space-y-4 p-4'>
                  {data.status === 'PENDING' && (
                    <button
                      type='button'
                      className={cn(ACTION_BTN, 'bg-[#c9f24d]')}
                      onClick={() => setPaymentModalOpen(true)}
                    >
                      <ExternalLink className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                      {t('transactionDetail.payInstructions') || 'Pay Instructions'}
                    </button>
                  )}

                  {data.status === 'PAID' && (
                    <div className='flex flex-col gap-4'>
                      {data.order_item?.voucher_code && (
                        <div className='space-y-1.5'>
                          <p className={FIELD_LABEL}>Voucher Code</p>
                          <button
                            type='button'
                            className={cn(ACTION_BTN, 'h-10 bg-white')}
                            onClick={() => handleResendVoucherCodeEmail(data.id)}
                            disabled={isResendingVoucher || voucherCooldown > 0}
                          >
                            {isResendingVoucher && (
                              <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                            )}
                            {voucherCooldown > 0
                              ? `Wait ${formatTime(voucherCooldown)}`
                              : 'Resend Voucher'}
                          </button>
                        </div>
                      )}
                      <div className='space-y-1.5'>
                        <p className={FIELD_LABEL}>Customer Invoice Receipt</p>
                        <button
                          type='button'
                          className={cn(ACTION_BTN, 'h-10 bg-white')}
                          onClick={() => handleResendPaymentEmail(data.id)}
                          disabled={isResendingEmail || emailCooldown > 0}
                        >
                          {isResendingEmail && (
                            <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                          )}
                          {emailCooldown > 0
                            ? `Wait ${formatTime(emailCooldown)}`
                            : 'Resend Receipt Email'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent
          className='nb nb-frame nb-frame-thick nb-sd-lg max-h-[min(90vh,40rem)] gap-0 overflow-y-auto bg-white p-0 focus:outline-hidden sm:max-w-lg'
          showCloseButton={false}
        >
          <DialogHeader className='border-b-4 border-[#111] bg-[#6fe3f5] px-5 py-4 text-left'>
            <DialogTitle className='text-lg font-black uppercase leading-none tracking-tight'>
              {t('transactionDetail.dialogPaymentTitle')}
            </DialogTitle>
            <DialogDescription className='text-xs font-bold text-[#111]/80'>
              {t('transactionDetail.dialogPaymentDescription', {
                channel: t(`paymentChannel.${data.payment_channel}`),
              })}
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col items-center px-5 py-6'>
            {isLoading && <PaymentActionSpinner />}
            {!isLoading && PaymentAction && <PaymentAction data={data} />}
          </div>
          <div className='flex justify-end border-t-4 border-[#111] px-5 py-4'>
            <button
              type='button'
              onClick={() => setPaymentModalOpen(false)}
              className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-11 cursor-pointer bg-white px-5 text-xs font-black uppercase tracking-[0.14em] sm:min-w-[5.5rem]'
            >
              {t('cashflowDetailDialog.btnClose')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )

  if (hideLayout) {
    return layoutContent
  }

  return <DashboardLayout>{layoutContent}</DashboardLayout>
}

type PaymentChannel = PaymentDetail['payment_channel'];

const PAY_BTN =
  'nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-11 w-full cursor-pointer items-center justify-center gap-2 bg-[#c9f24d] px-4 text-xs font-black uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-55'

const paymentComponentMap: Record<
  PaymentChannel,
  FC<{ data: PaymentDetail }>
> = {
  gopay: GopayPayment,
  qris: QrisPayment,
  shopeepay: ShopeepayPayment,
  va: VaPayment,
}

function GopayPayment({ data }: { data: PaymentDetail }) {
  const { t } = useTranslation('common')
  return (
    <div className='w-full max-w-sm space-y-4'>
      {data.qr_code_url && (
        <div className='flex flex-col items-center gap-2'>
          <img
            src={data.qr_code_url}
            alt={t('transactionDetail.gopay.qrAlt')}
            className='nb-frame nb-frame-thin h-52 w-52 bg-white object-contain sm:h-56 sm:w-56'
          />
          <p className='text-center text-xs font-bold text-[#111]/70'>
            {t('transactionDetail.gopay.scanHint')}
          </p>
        </div>
      )}
      {data.payment_url && (
        <button
          type='button'
          className={PAY_BTN}
          onClick={() => window.open(data.payment_url, '_blank')}
        >
          {t('transactionDetail.gopay.openButton')}
        </button>
      )}
    </div>
  )
}

function ShopeepayPayment({ data }: { data: PaymentDetail }) {
  const { t } = useTranslation('common')
  return (
    <div className='w-full max-w-sm space-y-4 text-center'>
      <p className='text-xs font-bold text-[#111]/70'>
        {t('transactionDetail.shopeepay.redirectHint')}
      </p>
      <button
        type='button'
        className={PAY_BTN}
        onClick={() => window.open(data.payment_url, '_blank')}
        disabled={!data.payment_url}
      >
        {t('transactionDetail.shopeepay.openButton')}
      </button>
      <p className='inline-block bg-[#ffd84d] px-1.5 py-0.5 text-[11px] font-bold'>
        {t('transactionDetail.shopeepay.footnote')}
      </p>
    </div>
  )
}

function QrisPayment({ data }: { data: PaymentDetail }) {
  const { t } = useTranslation('common')
  return (
    <div className='w-full max-w-sm space-y-4 text-center'>
      <p className='text-xs font-bold text-[#111]/70'>{t('transactionDetail.qris.scanHint')}</p>
      <img
        src={data.qr_code_url}
        alt={t('transactionDetail.qris.qrAlt')}
        className='nb-frame nb-frame-thin mx-auto max-h-[min(55vh,18rem)] w-auto max-w-full bg-white object-contain'
      />
      <p className='inline-block bg-[#ffd84d] px-1.5 py-0.5 text-[11px] font-bold'>
        {t('transactionDetail.qris.waitingHint')}
      </p>
    </div>
  )
}

function VaPayment({ data }: { data: PaymentDetail }) {
  const { t } = useTranslation('common')
  return (
    <div className='w-full max-w-sm space-y-4 text-center'>
      <p className='text-xs font-bold text-[#111]/70'>{t('transactionDetail.va.instruction')}</p>
      <div className='nb-frame nb-frame-thin nb-sd-sm bg-[#f5f1e8] p-4 font-mono text-lg font-black tabular-nums'>
        {data.va_number || t('transactionDetail.va.notAvailable')}
      </div>
      <p className='text-[11px] font-bold text-[#111]/60'>{t('transactionDetail.va.footnote')}</p>
    </div>
  )
}

function PaymentActionSpinner() {
  const { t } = useTranslation('common')
  return (
    <div className='flex flex-col items-center gap-3 py-8'>
      <span className='nb-frame nb-frame-thin nb-sd-sm flex h-12 w-12 items-center justify-center bg-[#6fe3f5]'>
        <Loader2 className='h-6 w-6 animate-spin' strokeWidth={3} aria-hidden />
      </span>
      <p className='text-xs font-black uppercase tracking-tight'>
        {t('transactionDetail.loadingInstructions')}
      </p>
    </div>
  )
}
