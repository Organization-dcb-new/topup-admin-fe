import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { cn } from '@/lib/utils'
import { useResendEmail, useResendVoucherCode } from '@/hooks/useEmail'
import { format, isValid } from 'date-fns'
import {
  ArrowLeft,
  Check,
  Copy,
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

function CopyInlineButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await copyTextToClipboard(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <Button
      type='button'
      variant='ghost'
      size='icon'
      className='h-6 w-6 shrink-0 text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer'
      onClick={handleCopy}
      aria-label='Copy value'
    >
      {copied ? (
        <Check className='h-3.5 w-3.5 text-emerald-500' aria-hidden />
      ) : (
        <Copy className='h-3.5 w-3.5 text-slate-400' aria-hidden />
      )}
    </Button>
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
    <div className='rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xs'>
      <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6'>Step Progress Timeline</h3>
      <div className='relative flex flex-col gap-6 pl-6 border-l-2 border-slate-100 dark:border-zinc-900 ml-3'>
        {steps.map((step) => (
          <div key={step.key} className='relative flex flex-col gap-1'>
            {/* Pulsing indicator node */}
            <span
              className={cn(
                'absolute -left-9.5 top-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
                step.active
                  ? 'bg-blue-500 text-white border-blue-500 ring-4 ring-blue-500/10'
                  : step.done
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white dark:bg-zinc-950 text-slate-300 border-slate-200 dark:border-zinc-800'
              )}
            >
              {step.done ? <Check className='h-3 w-3' /> : <span className='h-1.5 w-1.5 rounded-full bg-slate-300' />}
            </span>
            <span className={cn('text-sm font-bold', step.done ? 'text-slate-900 dark:text-white' : 'text-slate-400')}>
              {step.label}
            </span>
            {step.desc && <span className='text-xs text-slate-400 dark:text-slate-500'>{step.desc}</span>}
          </div>
        ))}
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

  const isPaid = data.status === 'PAID'
  const isProcessing = data.status === 'PROCESSING'
  const isPending = data.status === 'PENDING'
  const isFailed = data.status === 'FAILED'
  const isExpired = data.status === 'EXPIRED'

  const date = parseWIBDate(data.created_at)
  const formattedDate = date && isValid(date) ? format(date, 'MMMM dd, yyyy, HH:mm') : '—'

  const layoutContent = (
    <>
      <div className='min-w-0 -mx-4 -mt-4 flex w-full flex-col bg-slate-50/50 dark:bg-zinc-950/20 md:-mx-6 md:-mt-6 space-y-6'>
        {/* Navbar-style header bar */}
        <div className='w-full min-w-0 px-4 pt-6 sm:px-6 md:px-8 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => navigate(-1)}
              className='gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl cursor-pointer'
            >
              <ArrowLeft className='h-4 w-4' />
              {t('transactionDetailPage.backButton') || 'Back'}
            </Button>
          </div>
          <div className='flex items-center gap-2 font-mono text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-zinc-900/60 px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800/80'>
            <span>TX_ID:</span>
            <span className='font-bold text-slate-650 dark:text-slate-350'>{data.id}</span>
            <CopyInlineButton text={data.id} />
          </div>
        </div>

        <div className='w-full min-w-0 px-4 pb-16 sm:px-6 md:px-8 space-y-6'>
          {/* Top Invoice Summary & Timeline Grid */}
          <div className='grid gap-6 md:grid-cols-3'>
            {/* Invoice Summary Card */}
            <div className='md:col-span-2 relative overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xs flex flex-col justify-between min-h-[14rem] transition-all duration-300 hover:border-slate-300 dark:hover:border-zinc-700'>
              {/* Soft decorative background glow */}
              <div className='absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/5 blur-3xl' />
              
              <div className='space-y-2'>
                <p className='text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500'>Invoice Summary</p>
                <div className='space-y-1.5'>
                  <p className='text-xs font-semibold text-slate-400 dark:text-slate-500'>Total Amount</p>
                  <p className='text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight filter drop-shadow-xs'>
                    {formatIdr(data.amount)}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-zinc-900 pt-4 mt-6'>
                <div className='space-y-0.5'>
                  <span className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>Status</span>
                  <div className='flex items-center gap-1.5 mt-0.5'>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-xs',
                        isPaid && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                        isProcessing && 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                        isPending && 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                        (isFailed || isExpired) && 'bg-rose-500/10 text-rose-600 dark:text-rose-455 border-rose-500/20'
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 shrink-0 rounded-full',
                          isPaid && 'bg-emerald-500',
                          isProcessing && 'bg-blue-500 animate-pulse',
                          isPending && 'bg-amber-500 animate-pulse',
                          (isFailed || isExpired) && 'bg-rose-500'
                        )}
                      />
                      {t(`paymentStatus.${data.status}`)}
                    </span>
                  </div>
                </div>

                <div className='space-y-0.5'>
                  <span className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>Date</span>
                  <p className='text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5'>{formattedDate}</p>
                </div>

                <div className='space-y-0.5'>
                  <span className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>Payment Channel</span>
                  <p className='text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1.5 uppercase'>{data.payment_channel}</p>
                </div>
              </div>
            </div>

            {/* Stepper Timeline Card */}
            <div className='md:col-span-1'>
              <StepProgressTimeline status={data.status} createdAt={data.created_at} />
            </div>
          </div>

          {/* Bottom Split Details Grid */}
          <div className='grid gap-6 md:grid-cols-3'>
            {/* Product Information (Left Col-span-2) */}
            <div className='md:col-span-2 space-y-6'>
              <div className='rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-5 transition-all duration-300 hover:border-slate-300 dark:hover:border-zinc-700'>
                <div className='flex items-center gap-2 border-b border-slate-100 dark:border-zinc-900 pb-4'>
                  <ShoppingBag className='h-4 w-4 text-primary' />
                  <h3 className='text-sm font-extrabold text-slate-900 dark:text-white'>Product Information</h3>
                </div>

                <div className='overflow-x-auto'>
                  <table className='w-full text-left text-xs'>
                    <thead className='text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-zinc-900'>
                      <tr>
                        <th scope='col' className='pb-3 font-bold'>Item Description</th>
                        <th scope='col' className='pb-3 font-bold text-center'>Qty</th>
                        <th scope='col' className='pb-3 font-bold text-right'>Unit Price</th>
                        <th scope='col' className='pb-3 font-bold text-right'>Total</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-slate-100 dark:divide-zinc-900'>
                      <tr>
                        <td className='py-4 pr-4 align-top'>
                          <div className='space-y-1'>
                            <p className='text-sm font-bold text-slate-900 dark:text-white'>{data.order_item.product_name}</p>
                            <p className='font-mono text-[10px] text-slate-400 dark:text-slate-500'>SKU: {data.sku}</p>
                          </div>
                        </td>
                        <td className='py-4 text-center align-top font-bold text-slate-800 dark:text-slate-250 tabular-nums'>{data.order_item.quantity}</td>
                        <td className='py-4 text-right align-top font-semibold text-slate-800 dark:text-slate-250 tabular-nums'>{formatIdr(data.amount)}</td>
                        <td className='py-4 text-right align-top font-bold text-slate-900 dark:text-white tabular-nums'>{formatIdr(data.amount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Subtotals & Margin summary details */}
                <div className='border-t border-slate-100 dark:border-zinc-900 pt-4 flex flex-col gap-2.5 items-end text-xs'>
                  <div className='flex justify-between w-64 text-slate-500'>
                    <span>Order ID:</span>
                    <span className='font-mono font-bold text-slate-700 dark:text-slate-300'>{data.order.order_number}</span>
                  </div>
                  <div className='flex justify-between w-64 text-slate-500'>
                    <span>Profit Margin:</span>
                    <span className='font-bold text-emerald-600 dark:text-emerald-450 tabular-nums'>{formatIdr(data.margin)}</span>
                  </div>
                  <div className='flex justify-between w-64 border-t border-slate-100 dark:border-zinc-900 pt-2.5 text-sm font-black text-slate-900 dark:text-white'>
                    <span>Grand Total:</span>
                    <span className='tabular-nums'>{formatIdr(data.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Game Metadata Widgets */}
              {data.meta_data && Object.keys(data.meta_data).length > 0 && (
                <div className='rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-955 p-6 shadow-xs space-y-4'>
                  <div className='flex items-center gap-2 border-b border-slate-100 dark:border-zinc-900 pb-3'>
                    <ShieldCheck className='h-4.5 w-4.5 text-primary' />
                    <h3 className='text-sm font-extrabold text-slate-900 dark:text-white'>Metadata Game</h3>
                  </div>
                  <div className='grid gap-4 sm:grid-cols-2'>
                    {Object.entries(data.meta_data).map(([key, value]) => (
                      <div key={key} className='flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/10'>
                        <div className='min-w-0 space-y-0.5'>
                          <span className='text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>{key}</span>
                          <p className='text-sm font-bold text-slate-900 dark:text-white font-mono truncate' title={String(value)}>{String(value)}</p>
                        </div>
                        <CopyInlineButton text={String(value)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Customer & Payment source panel (Right Col-span-1) */}
            <div className='md:col-span-1 space-y-6'>
              {/* Customer Information */}
              <div className='rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-4 transition-all duration-300 hover:border-slate-300 dark:hover:border-zinc-700'>
                <div className='flex items-center gap-2 border-b border-slate-100 dark:border-zinc-900 pb-3'>
                  <User className='h-4 w-4 text-primary' />
                  <h3 className='text-sm font-extrabold text-slate-900 dark:text-white'>Customer Information</h3>
                </div>

                <div className='space-y-4 text-xs'>
                  <div className='space-y-1'>
                    <span className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>Customer Email</span>
                    <div className='flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-900'>
                      <span className='font-semibold text-slate-800 dark:text-slate-250 truncate'>{data.email}</span>
                      <CopyInlineButton text={data.email} />
                    </div>
                  </div>

                  <div className='space-y-1'>
                    <span className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>IP Address</span>
                    <p className='font-mono font-bold text-slate-800 dark:text-slate-200'>{data.ip_address || '—'}</p>
                  </div>

                  {data.tid && (
                    <div className='space-y-1'>
                      <span className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>TID / Reference Code</span>
                      <div className='flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-900'>
                        <span className='font-mono font-bold text-slate-800 dark:text-slate-250 truncate'>{data.tid}</span>
                        <CopyInlineButton text={data.tid} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment details / source info card */}
              <div className='rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-955 p-6 shadow-xs space-y-4 transition-all duration-300 hover:border-slate-300 dark:hover:border-zinc-700'>
                <div className='flex items-center gap-2 border-b border-slate-100 dark:border-zinc-900 pb-3'>
                  <CreditCard className='h-4 w-4 text-primary' />
                  <h3 className='text-sm font-extrabold text-slate-900 dark:text-white'>Payment Details</h3>
                </div>

                <div className='space-y-4 text-xs'>
                  <div className='space-y-1'>
                    <span className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>Payment Number</span>
                    <div className='flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-900'>
                      <span className='font-mono font-bold text-slate-850 dark:text-slate-200 truncate'>{data.payment_number}</span>
                      <CopyInlineButton text={data.payment_number} />
                    </div>
                  </div>

                  {data.va_number && (
                    <div className='space-y-1'>
                      <span className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>VA Number</span>
                      <div className='flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-900'>
                        <span className='font-mono font-bold text-slate-850 dark:text-slate-250 truncate'>{data.va_number}</span>
                        <CopyInlineButton text={data.va_number} />
                      </div>
                    </div>
                  )}

                  <div className='space-y-1'>
                    <span className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>Provider Status</span>
                    <Badge variant={data.status_provider === 'SUCCESS' ? 'success' : 'outline'} className='font-bold uppercase text-[9px] mt-1'>
                      {data.status_provider || '—'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons Dashboard */}
              {(!isLoading || data.status === 'PENDING') && (
                <div className='rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-4'>
                  <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'>Actions</h3>
                  
                  {data.status === 'PENDING' && (
                    <Button
                      type='button'
                      size='lg'
                      className='w-full h-11 rounded-xl gap-2 font-bold cursor-pointer transition-transform duration-150 active:scale-[0.98]'
                      onClick={() => setPaymentModalOpen(true)}
                    >
                      <ExternalLink className='h-4 w-4 shrink-0' />
                      {t('transactionDetail.payInstructions') || 'Pay Instructions'}
                    </Button>
                  )}

                  {data.status === 'PAID' && (
                    <div className='flex flex-col gap-3'>
                      {data.order_item?.voucher_code && (
                        <div className='space-y-1.5'>
                          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider'>Voucher Code</p>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            className='w-full h-10 rounded-xl font-bold border-slate-200 dark:border-zinc-800 cursor-pointer'
                            onClick={() => handleResendVoucherCodeEmail(data.id)}
                            disabled={isResendingVoucher || voucherCooldown > 0}
                          >
                            {voucherCooldown > 0 ? `Wait ${formatTime(voucherCooldown)}` : 'Resend Voucher'}
                          </Button>
                        </div>
                      )}
                      <div className='space-y-1.5'>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider'>Customer Invoice Receipt</p>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          className='w-full h-10 rounded-xl font-bold border-slate-200 dark:border-zinc-800 cursor-pointer'
                          onClick={() => handleResendPaymentEmail(data.id)}
                          disabled={isResendingEmail || emailCooldown > 0}
                        >
                          {emailCooldown > 0 ? `Wait ${formatTime(emailCooldown)}` : 'Resend Receipt Email'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent
          className='max-h-[min(90vh,40rem)] gap-0 overflow-y-auto p-0 sm:max-w-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-hidden'
          showCloseButton
        >
          <DialogHeader className='border-b border-slate-100 dark:border-zinc-900 px-6 py-4 text-left'>
            <DialogTitle className='font-bold text-slate-900 dark:text-white'>
              {t('transactionDetail.dialogPaymentTitle')}
            </DialogTitle>
            <DialogDescription className='text-xs text-slate-500'>
              {t('transactionDetail.dialogPaymentDescription', {
                channel: t(`paymentChannel.${data.payment_channel}`),
              })}
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col items-center px-6 py-6'>
            {isLoading && <PaymentActionSpinner />}
            {!isLoading && PaymentAction && <PaymentAction data={data} />}
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
            className='h-52 w-52 rounded-lg border object-contain sm:h-56 sm:w-56'
          />
          <p className='text-center text-sm text-muted-foreground'>
            {t('transactionDetail.gopay.scanHint')}
          </p>
        </div>
      )}
      {data.payment_url && (
        <Button
          type='button'
          className='w-full'
          onClick={() => window.open(data.payment_url, '_blank')}
        >
          {t('transactionDetail.gopay.openButton')}
        </Button>
      )}
    </div>
  )
}

function ShopeepayPayment({ data }: { data: PaymentDetail }) {
  const { t } = useTranslation('common')
  return (
    <div className='w-full max-w-sm space-y-4 text-center'>
      <p className='text-sm text-muted-foreground'>
        {t('transactionDetail.shopeepay.redirectHint')}
      </p>
      <Button
        type='button'
        className='w-full'
        onClick={() => window.open(data.payment_url, '_blank')}
        disabled={!data.payment_url}
      >
        {t('transactionDetail.shopeepay.openButton')}
      </Button>
      <p className='text-xs text-amber-600 dark:text-amber-500'>
        {t('transactionDetail.shopeepay.footnote')}
      </p>
    </div>
  )
}

function QrisPayment({ data }: { data: PaymentDetail }) {
  const { t } = useTranslation('common')
  return (
    <div className='w-full max-w-sm space-y-4 text-center'>
      <p className='text-sm text-muted-foreground'>
        {t('transactionDetail.qris.scanHint')}
      </p>
      <img
        src={data.qr_code_url}
        alt={t('transactionDetail.qris.qrAlt')}
        className='mx-auto max-h-[min(55vh,18rem)] w-auto max-w-full rounded-xl border object-contain'
      />
      <p className='text-xs text-amber-600 dark:text-amber-500'>
        {t('transactionDetail.qris.waitingHint')}
      </p>
    </div>
  )
}

function VaPayment({ data }: { data: PaymentDetail }) {
  const { t } = useTranslation('common')
  return (
    <div className='w-full max-w-sm space-y-4 text-center'>
      <p className='text-sm text-muted-foreground'>
        {t('transactionDetail.va.instruction')}
      </p>
      <div className='rounded-lg bg-muted p-4 font-mono text-lg font-bold tabular-nums text-foreground'>
        {data.va_number || t('transactionDetail.va.notAvailable')}
      </div>
      <p className='text-xs text-muted-foreground'>
        {t('transactionDetail.va.footnote')}
      </p>
    </div>
  )
}

function PaymentActionSpinner() {
  const { t } = useTranslation('common')
  return (
    <div className='flex flex-col items-center gap-3 py-8 text-muted-foreground'>
      <Loader2 className='h-8 w-8 animate-spin text-primary' aria-hidden />
      <p className='text-sm'>{t('transactionDetail.loadingInstructions')}</p>
    </div>
  )
}
