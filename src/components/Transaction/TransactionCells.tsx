import { CopyButton } from '@/components/ui/copy-button'
import { cn } from '@/lib/utils'
import type { Payment } from '@/types/transaction'
import type { TFunction } from 'i18next'

/** Warna latar per status pembayaran. */
const STATUS_ACCENT: Record<string, string> = {
  PAID: 'bg-[#c9f24d]',
  PROCESSING: 'bg-[#6fe3f5]',
  PENDING: 'bg-[#ffd84d]',
  FAILED: 'bg-[#ff4d3d]',
  EXPIRED: 'bg-[#ff9d3d]',
}

/** Warna latar per status provider. */
const PROVIDER_ACCENT: Record<string, string> = {
  SUCCESS: 'bg-[#c9f24d]',
  PENDING: 'bg-[#ffd84d]',
  PROCESS: 'bg-[#ffd84d]',
}

const TAG_CLASS =
  'nb-frame nb-frame-thin inline-flex items-center whitespace-nowrap px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em]'

export function PaymentStatusTag({ status, t }: { status: Payment['status']; t: TFunction }) {
  return (
    <span className={cn(TAG_CLASS, STATUS_ACCENT[status] ?? 'bg-white')}>
      {t(`paymentStatus.${status}`)}
    </span>
  )
}

export function ProviderStatusTag({ status }: { status?: string }) {
  if (!status) return <span className='font-black text-[#111]/70'>—</span>
  return <span className={cn(TAG_CLASS, PROVIDER_ACCENT[status] ?? 'bg-[#ff4d3d]')}>{status}</span>
}

/** Sel teks panjang dengan tombol salin. Tombolnya selalu terlihat: versi lama
 *  hanya muncul saat hover, jadi tidak terjangkau lewat sentuh maupun keyboard. */
export function TransactionCopyCell({ value, t }: { value: string; t: TFunction }) {
  return (
    <div className='flex min-w-0 items-center gap-1.5'>
      <span className='min-w-0 truncate font-mono text-xs font-bold' title={value}>
        {value}
      </span>
      <CopyButton
        value={value}
        label={t('transactionTable.copyIdTitle')}
        errorLabel={t('transactionTable.copyError')}
        className='h-7 w-7'
      />
    </div>
  )
}
