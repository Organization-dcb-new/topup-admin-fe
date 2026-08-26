import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  ImageOff,
  Loader2,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  User,
} from 'lucide-react'

import { api } from '@/api/axios'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TransactionStatusBadge } from '@/components/Transaction/TransactionStatusBadge'
import { apiErrorMessage } from '@/lib/api-error'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useResendEmail, useResendVoucherCode } from '@/hooks/useEmail'
import type { PaymentStatus } from '@/types/transaction'

export interface TransactionDetailDrawerProps {
  paymentId: string | null
  onClose: () => void
}

/**
 * Bentuk respons `GET /transactions/detail/:id` (admin), mengikuti
 * `dto.DetailTransactionAdminResponse` di backend. Didefinisikan di sini —
 * bukan di `@/types/transaction` — karena berkas tipe itu khusus daftar dan
 * hanya drawer ini yang memakai bentuk detail.
 */
interface TransactionDetailOrderItem {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  subtotal: number
  voucher_code: string
}

interface TransactionDetailOrder {
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
  customer_email: string
  ip_address: string
  /** `datatypes.JSON` di BE — objek bebas, bisa `null`. */
  meta_data: Record<string, unknown> | null
  tid: string
}

interface TransactionDetailData {
  id: string
  payment_number: string
  order_id: string
  amount: number
  status: PaymentStatus
  payment_method_id: string
  payment_channel: string
  order_item: TransactionDetailOrderItem
  order: TransactionDetailOrder
  email: string
  sku: string
  payment_url: string
  qr_code_url: string
  qr_string: string
  va_number: string
  voucher_code: string
  created_at: string
}

const KNOWN_CHANNELS = ['gopay', 'va', 'qris', 'shopeepay'] as const

function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

function httpStatusOf(err: unknown): number | undefined {
  return (err as { response?: { status?: number } } | null)?.response?.status
}

/** Tombol salin kecil dengan umpan balik centang; timer dibersihkan saat unmount. */
function CopyIconButton({ value }: { value: string }) {
  const { t } = useTranslation('common')
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const handleCopy = async () => {
    try {
      await copyTextToClipboard(value)
      setCopied(true)
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('transactionDetail.copy.failed'))
    }
  }

  return (
    <Button
      type='button'
      variant='ghost'
      size='icon'
      className='h-6 w-6 shrink-0 cursor-pointer rounded-md text-muted-foreground transition-colors duration-200 hover:text-foreground motion-reduce:transition-none'
      onClick={handleCopy}
      aria-label={
        copied
          ? t('transactionDetail.copy.ariaCopied')
          : t('transactionDetail.copy.ariaCopy')
      }
    >
      {copied ? (
        <Check className='h-3.5 w-3.5 text-success' aria-hidden />
      ) : (
        <Copy className='h-3.5 w-3.5' aria-hidden />
      )}
    </Button>
  )
}

/**
 * Konfirmasi ringan dua langkah: klik pertama mempersenjatai tombol,
 * klik kedua dalam 4 detik benar-benar mengirim. Timer dibersihkan
 * saat unmount maupun saat di-reset.
 */
function ConfirmActionButton({
  label,
  onConfirm,
  pending,
  icon: Icon,
}: {
  label: string
  onConfirm: () => void
  pending: boolean
  icon: typeof Mail
}) {
  const { t } = useTranslation('common')
  const [armed, setArmed] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const handleClick = () => {
    if (armed) {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      setArmed(false)
      onConfirm()
      return
    }
    setArmed(true)
    timerRef.current = window.setTimeout(() => setArmed(false), 4000)
  }

  return (
    <Button
      type='button'
      variant={armed ? 'default' : 'outline'}
      size='sm'
      className='w-full cursor-pointer gap-2 transition-colors duration-200 motion-reduce:transition-none'
      onClick={handleClick}
      disabled={pending}
      aria-live='polite'
    >
      {pending ? (
        <Loader2
          className='h-4 w-4 animate-spin motion-reduce:animate-none'
          aria-hidden
        />
      ) : (
        <Icon className='h-4 w-4' aria-hidden />
      )}
      {armed ? t('transactionDetail.confirmResend') : label}
    </Button>
  )
}

function DetailRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='min-w-0 space-y-0.5'>
      <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
        {label}
      </p>
      <div className='flex min-w-0 items-center gap-1 text-sm text-foreground'>
        {children}
      </div>
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User
  title: string
  children: React.ReactNode
}) {
  return (
    <section className='space-y-4 rounded-xl border border-border bg-muted/30 p-4'>
      <h3 className='flex items-center gap-2 text-sm font-semibold text-foreground'>
        <Icon className='h-4 w-4 text-primary' aria-hidden />
        {title}
      </h3>
      {children}
    </section>
  )
}

function DrawerSkeleton() {
  return (
    <div className='space-y-6' role='status' aria-busy='true'>
      <Skeleton className='h-20 w-full rounded-xl' />
      <Skeleton className='h-40 w-full rounded-xl' />
      <Skeleton className='h-28 w-full rounded-xl' />
      <Skeleton className='h-44 w-full rounded-xl' />
      <Skeleton className='h-24 w-full rounded-xl' />
    </div>
  )
}

/**
 * Pratinjau QR dengan fallback saat gambar gagal dimuat. Pemanggil memberi
 * `key={url}` supaya komponen di-remount (status gagal ikut ter-reset) ketika
 * drawer dipakai ulang untuk transaksi lain.
 */
function QrPreview({ url, alt }: { url: string; alt: string }) {
  const { t } = useTranslation('common')
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className='flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-background/60 px-4 py-6 text-muted-foreground'>
        <ImageOff className='h-6 w-6' aria-hidden />
        <p className='text-xs'>{t('transactionDetail.qrLoadFailed')}</p>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      className='mx-auto h-44 w-44 rounded-lg border border-border bg-white object-contain'
      onError={() => setFailed(true)}
    />
  )
}

export function TransactionDetailDrawer({
  paymentId,
  onClose,
}: TransactionDetailDrawerProps) {
  const { t } = useTranslation('common')

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['payment-detail', paymentId],
    queryFn: async () => {
      if (!paymentId) throw new Error('missing payment id')
      const res = await api.get(`/transactions/detail/${paymentId}`)
      return res.data.data as TransactionDetailData
    },
    enabled: !!paymentId,
  })

  const { mutate: resendEmail, isPending: isResendingEmail } = useResendEmail()
  const { mutate: resendVoucher, isPending: isResendingVoucher } =
    useResendVoucherCode()

  const isNotFound = isError && httpStatusOf(error) === 404

  const voucherCode = data
    ? data.voucher_code || data.order_item.voucher_code
    : ''
  const metaEntries = data?.order.meta_data
    ? Object.entries(data.order.meta_data)
    : []
  const channelLabel = data
    ? (KNOWN_CHANNELS as readonly string[]).includes(data.payment_channel)
      ? t(`paymentChannel.${data.payment_channel}`)
      : data.payment_channel || '—'
    : ''
  const canOpenPaymentUrl = !!data && isHttpUrl(data.payment_url)

  return (
    <Sheet open={!!paymentId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side='right' className='w-full sm:max-w-2xl'>
        {/* Header tetap terlihat saat isi drawer di-scroll (SheetBody yang scrollable) */}
        <SheetHeader className='gap-2'>
          <div className='flex min-w-0 flex-wrap items-center gap-2'>
            <SheetTitle
              className={cn(
                'min-w-0 truncate',
                data && 'font-mono text-sm font-semibold',
              )}
            >
              {data ? data.payment_number : t('transactionDetail.pageTitle')}
            </SheetTitle>
            {data && (
              <>
                <CopyIconButton value={data.payment_number} />
                <TransactionStatusBadge status={data.status} />
              </>
            )}
          </div>
          <SheetDescription className={data ? 'sr-only' : undefined}>
            {t('transactionDetail.subtitleDefault')}
          </SheetDescription>
          {data && (
            <div className='flex flex-wrap items-end justify-between gap-x-4 gap-y-1'>
              <p className='text-3xl font-bold tabular-nums tracking-tight text-foreground'>
                {formatCurrency(data.amount)}
              </p>
              <p className='tabular-nums text-xs text-muted-foreground'>
                {formatBackendDateTime(data.created_at)}{' '}
                {t('transactionDetail.wibSuffix')}
              </p>
            </div>
          )}
        </SheetHeader>

        <SheetBody className='space-y-6'>
          {isLoading && <DrawerSkeleton />}

          {isNotFound && (
            <div className='flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center'>
              <p className='text-sm text-muted-foreground'>
                {t('transactionDetailPage.notFoundMessage')}
              </p>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='cursor-pointer'
                onClick={onClose}
              >
                {t('transactionDetail.closeDrawer')}
              </Button>
            </div>
          )}

          {isError && !isNotFound && (
            <div className='flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-10 text-center'>
              <p className='text-sm text-destructive'>
                {apiErrorMessage(error, t('transactionDetailPage.errorMessage'))}
              </p>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='cursor-pointer'
                onClick={() => refetch()}
              >
                {t('transactionDetail.retry')}
              </Button>
            </div>
          )}

          {data && (
            <>
              {/* ——— Pembayaran ——— */}
              <SectionCard
                icon={CreditCard}
                title={t('transactionDetail.sectionPayment')}
              >
                <div className='grid gap-4 sm:grid-cols-2'>
                  <DetailRow label={t('transactionDetail.labelChannel')}>
                    <span className='truncate font-medium'>{channelLabel}</span>
                  </DetailRow>
                  <DetailRow label={t('transactionDetail.labelMethodId')}>
                    <span className='truncate font-mono text-xs'>
                      {data.payment_method_id}
                    </span>
                    <CopyIconButton value={data.payment_method_id} />
                  </DetailRow>
                  {data.va_number && (
                    <DetailRow label={t('transactionDetail.va.label')}>
                      <span className='truncate font-mono tabular-nums'>
                        {data.va_number}
                      </span>
                      <CopyIconButton value={data.va_number} />
                    </DetailRow>
                  )}
                </div>

                {data.qr_code_url && (
                  <QrPreview
                    key={data.qr_code_url}
                    url={data.qr_code_url}
                    alt={t('transactionDetail.qrGenericAlt')}
                  />
                )}

                {canOpenPaymentUrl && (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='w-full cursor-pointer gap-2'
                    onClick={() =>
                      window.open(
                        data.payment_url,
                        '_blank',
                        'noopener,noreferrer',
                      )
                    }
                  >
                    <ExternalLink className='h-4 w-4' aria-hidden />
                    {t('transactionDetail.openPaymentPage')}
                  </Button>
                )}
              </SectionCard>

              {/* ——— Pembeli ——— */}
              <SectionCard
                icon={User}
                title={t('transactionDetail.sectionBuyer')}
              >
                <div className='grid gap-4 sm:grid-cols-2'>
                  <DetailRow label={t('transactionDetail.labelEmail')}>
                    <span className='truncate font-medium'>
                      {data.email || '—'}
                    </span>
                    {data.email && <CopyIconButton value={data.email} />}
                  </DetailRow>
                  <DetailRow label={t('transactionDetail.labelIpAddress')}>
                    <span className='truncate font-mono tabular-nums text-xs'>
                      {data.order.ip_address || '—'}
                    </span>
                  </DetailRow>
                  {data.order.tid && (
                    <DetailRow label={t('transactionDetail.labelTid')}>
                      <span className='truncate font-mono text-xs'>
                        {data.order.tid}
                      </span>
                      <CopyIconButton value={data.order.tid} />
                    </DetailRow>
                  )}
                </div>
              </SectionCard>

              {/* ——— Pesanan ——— */}
              <SectionCard
                icon={ShoppingBag}
                title={t('transactionDetail.sectionOrder')}
              >
                <div className='grid gap-4 sm:grid-cols-2'>
                  <DetailRow label={t('transactionDetail.labelOrderNumber')}>
                    <span className='truncate font-mono text-xs'>
                      {data.order.order_number}
                    </span>
                    <CopyIconButton value={data.order.order_number} />
                  </DetailRow>
                  <DetailRow label={t('transactionDetail.labelOrderStatus')}>
                    <TransactionStatusBadge status={data.order.status} />
                  </DetailRow>
                  <DetailRow label={t('transactionDetail.created')}>
                    <span className='tabular-nums'>
                      {formatBackendDateTime(data.order.created_at)}
                    </span>
                  </DetailRow>
                  <DetailRow label={t('transactionDetail.labelOrderTotal')}>
                    <span className='font-semibold tabular-nums'>
                      {formatCurrency(data.order.total_amount)}
                    </span>
                  </DetailRow>
                </div>

                <div className='overflow-x-auto rounded-lg border border-border bg-background/60'>
                  <table className='w-full text-left text-sm'>
                    <thead>
                      <tr className='border-b border-border text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                        <th scope='col' className='px-3 py-2 font-medium'>
                          {t('transactionDetail.labelProduct')}
                        </th>
                        <th
                          scope='col'
                          className='px-3 py-2 text-center font-medium'
                        >
                          {t('transactionDetail.labelQuantity')}
                        </th>
                        <th
                          scope='col'
                          className='px-3 py-2 text-right font-medium'
                        >
                          {t('transactionDetail.labelUnitPrice')}
                        </th>
                        <th
                          scope='col'
                          className='px-3 py-2 text-right font-medium'
                        >
                          {t('transactionDetail.labelSubtotal')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className='px-3 py-2.5 align-top'>
                          <p className='font-medium text-foreground'>
                            {data.order_item.product_name}
                          </p>
                          <p className='mt-0.5 font-mono text-xs text-muted-foreground'>
                            {t('transactionDetail.labelSku')}:{' '}
                            {data.order_item.product_sku || data.sku || '—'}
                          </p>
                        </td>
                        <td className='px-3 py-2.5 text-center align-top tabular-nums'>
                          {data.order_item.quantity}
                        </td>
                        <td className='px-3 py-2.5 text-right align-top tabular-nums'>
                          {formatCurrency(data.order_item.unit_price)}
                        </td>
                        <td className='px-3 py-2.5 text-right align-top font-semibold tabular-nums'>
                          {formatCurrency(data.order_item.subtotal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {voucherCode && (
                  <DetailRow label={t('transactionDetail.voucherCode')}>
                    <span className='truncate font-mono text-xs'>
                      {voucherCode}
                    </span>
                    <CopyIconButton value={voucherCode} />
                  </DetailRow>
                )}
              </SectionCard>

              {/* ——— Metadata game ——— */}
              {metaEntries.length > 0 && (
                <SectionCard
                  icon={ShieldCheck}
                  title={t('transactionDetail.sectionMetadata')}
                >
                  <div className='grid gap-3 sm:grid-cols-2'>
                    {metaEntries.map(([key, value]) => (
                      <div
                        key={key}
                        className='flex items-center justify-between gap-2 rounded-lg border border-border bg-background/60 px-3 py-2'
                      >
                        <div className='min-w-0 space-y-0.5'>
                          <p className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
                            {key}
                          </p>
                          <p
                            className='truncate font-mono text-xs text-foreground'
                            title={String(value)}
                          >
                            {String(value)}
                          </p>
                        </div>
                        <CopyIconButton value={String(value)} />
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* ——— Aksi ——— */}
              <SectionCard
                icon={Mail}
                title={t('transactionDetail.sectionActions')}
              >
                {data.status === 'PAID' ? (
                  <div className='grid gap-2 sm:grid-cols-2'>
                    <ConfirmActionButton
                      label={t('transactionDetail.resendEmail')}
                      icon={Mail}
                      pending={isResendingEmail}
                      onConfirm={() => resendEmail(data.id)}
                    />
                    {voucherCode && (
                      <ConfirmActionButton
                        label={t('transactionDetail.resendVoucher')}
                        icon={Ticket}
                        pending={isResendingVoucher}
                        onConfirm={() => resendVoucher(data.id)}
                      />
                    )}
                  </div>
                ) : (
                  <p className='rounded-lg border border-dashed border-border bg-background/60 px-3 py-4 text-center text-xs text-muted-foreground'>
                    {t('transactionDetail.actionsPaidOnly')}
                  </p>
                )}
              </SectionCard>

              {/* ID transaksi untuk rujukan cepat */}
              <div className='flex items-center justify-between gap-2 border-t border-border pt-4'>
                <p className='min-w-0 truncate font-mono text-xs text-muted-foreground'>
                  {data.id}
                </p>
                <CopyIconButton value={data.id} />
              </div>
            </>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}
