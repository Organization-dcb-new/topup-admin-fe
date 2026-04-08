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
import { cn } from '@/lib/utils'
import i18n from '@/i18n'
import { useResendEmail, useResendVoucherCode } from '@/hooks/useEmail'
import { format, isValid } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import { ArrowLeft, Check, Copy, CreditCard, Loader2, Receipt } from 'lucide-react'
import {
  type Dispatch,
  type FC,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
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
  sku: string
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

function detailDateLocale() {
  return i18n.language.startsWith('id') ? idLocale : enUS
}

export default function PaymentDetail({ data, isLoading }: Props) {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const [voucherCooldown, setVoucherCooldown] = useState(0)
  const [emailCooldown, setEmailCooldown] = useState(0)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

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
      <div className="min-w-0 -mx-4 -mt-4 flex w-full flex-col bg-muted/30 md:-mx-6 md:-mt-6">
        <div className="w-full min-w-0 px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <div className="w-full min-w-0 overflow-hidden rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10">
            <header className="border-b border-border/70 px-4 py-5 sm:px-6 md:px-8">
              <div className="flex min-w-0 items-start gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="mt-0.5 shrink-0 rounded-full"
                  aria-label={t('transactionDetail.backAria')}
                >
                  <ArrowLeft className="h-5 w-5" aria-hidden />
                </Button>
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Receipt className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                      {t('transactionDetail.pageTitle')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {data.status === 'PENDING'
                        ? t('transactionDetail.subtitlePending')
                        : t('transactionDetail.subtitleDefault')}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground tabular-nums">{data.id}</p>
                  </div>
                </div>
              </div>
            </header>

            <div className="border-b border-border/70 bg-muted/20 px-4 py-6 sm:px-6 md:px-8 md:py-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                <div className="min-w-0 space-y-2">
                  <PaymentStatusBadge status={data.status} />
                  <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground sm:text-4xl">
                    {formatIdr(data.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t(`paymentChannel.${data.payment_channel}`)} ·{' '}
                    {data.payment_channel.toUpperCase()}
                  </p>
                </div>

                {data.status === 'PENDING' && (
                  <Button
                    type="button"
                    size="lg"
                    className="h-12 w-full shrink-0 gap-2 sm:w-auto sm:min-w-[14rem]"
                    onClick={() => setPaymentModalOpen(true)}
                  >
                    <CreditCard className="h-4 w-4 shrink-0" aria-hidden />
                    {t('transactionDetail.payInstructions')}
                  </Button>
                )}

                {data.status === 'PAID' && (
                  <p className="text-sm font-medium text-emerald-700 sm:max-w-xs sm:text-right">
                    {t('transactionDetail.paymentReceived')}
                  </p>
                )}
                {data.status === 'FAILED' && (
                  <p className="text-sm font-medium text-destructive sm:max-w-xs sm:text-right">
                    {t('transactionDetail.paymentFailed')}
                  </p>
                )}
                {data.status === 'EXPIRED' && (
                  <p className="text-sm font-medium text-muted-foreground sm:max-w-xs sm:text-right">
                    {t('transactionDetail.paymentExpired')}
                  </p>
                )}
              </div>
            </div>

            <div className="grid min-w-0 divide-y divide-border/70 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              <section className="min-w-0 px-4 py-6 sm:px-6 md:px-8 lg:py-8">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('transactionDetail.sectionPayment')}
                </h2>
                <dl className="space-y-0">
                  <InfoRow
                    label={t('transactionDetail.labelTransactionNumber')}
                    value={data.id}
                    mono
                    copyText={data.id}
                  />
                  <InfoRow
                    label={t('transactionDetail.labelPayNumber')}
                    value={data.payment_number}
                    mono
                  />
                  <InfoRow
                    label={t('transactionDetail.labelOrderId')}
                    value={data.order_id}
                    mono
                    muted
                  />
                  <InfoRow label={t('transactionDetail.labelEmail')} value={data.email} breakAll />
                </dl>
              </section>

              <section className="min-w-0 px-4 py-6 sm:px-6 md:px-8 lg:py-8">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('transactionDetail.sectionOrder')}
                </h2>
                <dl className="space-y-0">
                  <InfoRow
                    label={t('transactionDetail.labelOrderNumber')}
                    value={data.order.order_number}
                    mono
                  />
                  <InfoRow label={t('transactionDetail.labelSku')} value={data.sku} mono copyText={data.sku} />
                  <InfoRow
                    label={t('transactionDetail.labelProduct')}
                    value={data.order_item.product_name}
                  />
                  <InfoRow
                    label={t('transactionDetail.labelQuantity')}
                    value={t('transactionDetail.itemCount', { count: data.order_item.quantity })}
                  />
                  <InfoRow
                    label={t('transactionDetail.labelOrderStatus')}
                    value={<OrderStatusBadge status={data.order.status} />}
                    valueClassName="sm:flex sm:justify-end"
                  />
                  <InfoRow label={t('transactionDetail.labelMargin')} value={formatIdr(data.margin)} mono />
                </dl>
              </section>
            </div>

            <section className="border-t border-border/70 px-4 py-5 sm:px-6 md:px-8">
              <p className="text-xs font-medium text-muted-foreground">
                {t('transactionDetail.created')}
              </p>
              <p className="mt-1 tabular-nums text-sm text-foreground">
                {date && isValid(date)
                  ? format(date, 'dd MMM yyyy, HH:mm', { locale: detailDateLocale() })
                  : '—'}{' '}
                <span className="text-xs text-muted-foreground">
                  {t('transactionDetail.wibSuffix')}
                </span>
              </p>
            </section>

            {!isLoading && data.status === 'PAID' && (
              <div className="flex flex-col gap-4 border-t border-border/70 bg-muted/15 px-4 py-6 sm:flex-row sm:flex-wrap sm:px-6 md:px-8">
                {data.order_item?.voucher_code && (
                  <div className="min-w-0 flex-1 space-y-2 sm:min-w-[12rem]">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t('transactionDetail.voucherCode')}
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => handleResendVoucherCodeEmail(data.id)}
                      disabled={isResendingVoucher || voucherCooldown > 0}
                    >
                      {voucherCooldown > 0
                        ? t('transactionDetail.waitTime', {
                            time: formatTime(voucherCooldown),
                          })
                        : t('transactionDetail.resendVoucher')}
                    </Button>
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-2 sm:min-w-[12rem]">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t('transactionDetail.paymentEmail')}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => handleResendPaymentEmail(data.id)}
                    disabled={isResendingEmail || emailCooldown > 0}
                  >
                    {emailCooldown > 0
                      ? t('transactionDetail.waitTime', {
                          time: formatTime(emailCooldown),
                        })
                      : t('transactionDetail.resendEmail')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent
          className="max-h-[min(90vh,40rem)] gap-0 overflow-y-auto p-0 sm:max-w-lg"
          showCloseButton
        >
          <DialogHeader className="border-b border-border/80 px-6 py-4 text-left">
            <DialogTitle>{t('transactionDetail.dialogPaymentTitle')}</DialogTitle>
            <DialogDescription>
              {t('transactionDetail.dialogPaymentDescription', {
                channel: t(`paymentChannel.${data.payment_channel}`),
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center px-6 py-6">
            {isLoading && <PaymentActionSpinner />}
            {!isLoading && PaymentAction && <PaymentAction data={data} />}
          </div>
        </DialogContent>
      </Dialog>
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
  const { t } = useTranslation('common')
  return (
    <div className="w-full max-w-sm space-y-4">
      {data.qr_code_url && (
        <div className="flex flex-col items-center gap-2">
          <img
            src={data.qr_code_url}
            alt={t('transactionDetail.gopay.qrAlt')}
            className="h-52 w-52 rounded-lg border object-contain sm:h-56 sm:w-56"
          />
          <p className="text-center text-sm text-muted-foreground">
            {t('transactionDetail.gopay.scanHint')}
          </p>
        </div>
      )}
      {data.payment_url && (
        <Button
          type="button"
          className="w-full"
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
    <div className="w-full max-w-sm space-y-4 text-center">
      <p className="text-sm text-muted-foreground">{t('transactionDetail.shopeepay.redirectHint')}</p>
      <Button
        type="button"
        className="w-full"
        onClick={() => window.open(data.payment_url, '_blank')}
        disabled={!data.payment_url}
      >
        {t('transactionDetail.shopeepay.openButton')}
      </Button>
      <p className="text-xs text-amber-600 dark:text-amber-500">
        {t('transactionDetail.shopeepay.footnote')}
      </p>
    </div>
  )
}

function QrisPayment({ data }: { data: PaymentDetail }) {
  const { t } = useTranslation('common')
  return (
    <div className="w-full max-w-sm space-y-4 text-center">
      <p className="text-sm text-muted-foreground">{t('transactionDetail.qris.scanHint')}</p>
      <img
        src={data.qr_code_url}
        alt={t('transactionDetail.qris.qrAlt')}
        className="mx-auto max-h-[min(55vh,18rem)] w-auto max-w-full rounded-xl border object-contain"
      />
      <p className="text-xs text-amber-600 dark:text-amber-500">
        {t('transactionDetail.qris.waitingHint')}
      </p>
    </div>
  )
}

function VaPayment({ data }: { data: PaymentDetail }) {
  const { t } = useTranslation('common')
  return (
    <div className="w-full max-w-sm space-y-3 text-center">
      <p className="text-sm text-muted-foreground">{t('transactionDetail.va.label')}</p>
      <div className="rounded-lg border border-border/80 bg-muted/30 p-4 font-mono text-lg tabular-nums">
        {data.va_number || '—'}
      </div>
      <p className="text-xs text-amber-600 dark:text-amber-500">{t('transactionDetail.va.hint')}</p>
    </div>
  )
}

function CopyInlineButton({ text }: { text: string }) {
  const { t } = useTranslation('common')
  const [copied, setCopied] = useState(false)

  if (!text) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard denied or unavailable */
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
      onClick={handleCopy}
      aria-label={copied ? t('transactionDetail.copy.ariaCopied') : t('transactionDetail.copy.ariaCopy')}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-600" aria-hidden />
      ) : (
        <Copy className="h-4 w-4" aria-hidden />
      )}
    </Button>
  )
}

function InfoRow({
  label,
  value,
  mono,
  muted,
  breakAll,
  valueClassName,
  copyText,
}: {
  label: string
  value: ReactNode
  mono?: boolean
  muted?: boolean
  breakAll?: boolean
  valueClassName?: string
  copyText?: string
}) {
  const showCopy = copyText != null && copyText !== ''

  return (
    <div className="grid grid-cols-1 gap-1 border-b border-border/50 py-3 last:border-0 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-start sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'min-w-0 text-sm font-medium text-foreground sm:text-right',
          !showCopy && mono && 'font-mono tabular-nums',
          !showCopy && muted && 'text-muted-foreground',
          !showCopy && breakAll && 'break-all',
          valueClassName,
        )}
      >
        {showCopy ? (
          <div className="flex min-w-0 items-start justify-end gap-1 sm:gap-2">
            <span
              className={cn(
                'min-w-0 flex-1 text-sm font-medium text-foreground sm:text-right',
                mono && 'font-mono tabular-nums',
                muted && 'text-muted-foreground',
                breakAll && 'break-all',
              )}
            >
              {value}
            </span>
            <CopyInlineButton text={copyText} />
          </div>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function PaymentStatusBadge({ status }: { status: PaymentDetail['status'] }) {
  const { t } = useTranslation('common')
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
      {t(`paymentStatus.${status}`)}
    </Badge>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="secondary" className="max-w-full truncate font-normal sm:max-w-[14rem]">
      {status}
    </Badge>
  )
}

function PaymentActionSpinner() {
  const { t } = useTranslation('common')
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <p className="text-sm">{t('transactionDetail.loadingInstructions')}</p>
    </div>
  )
}
