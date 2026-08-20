import { cn } from '@/lib/utils'
import type { TFunction } from 'i18next'

/** Warna per tipe arus kas. Dipakai bersama oleh tabel dan dialog detail
 *  supaya tipe yang sama tidak tampil dengan warna berbeda antar tampilan. */
const TYPE_ACCENT: Record<string, string> = {
  PROVIDER: 'bg-[#6fe3f5]',
  PAYMENT_GATEWAY: 'bg-[#ff9d3d]',
  REVENUE: 'bg-[#c9f24d]',
}

const TYPE_LABEL_KEY: Record<string, string> = {
  PROVIDER: 'cashflowFilter.provider',
  PAYMENT_GATEWAY: 'cashflowFilter.pg',
  REVENUE: 'cashflowFilter.revenue',
}

export function CashflowTypeTag({ t, type }: { t: TFunction; type: string }) {
  return (
    <span
      className={cn(
        'nb-frame nb-frame-thin inline-flex items-center px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em]',
        TYPE_ACCENT[type] ?? 'bg-white',
      )}
    >
      {TYPE_LABEL_KEY[type] ? t(TYPE_LABEL_KEY[type]) : type}
    </span>
  )
}
