import { useTranslation } from 'react-i18next'
import { CircleSlash, Percent, Tags, ToggleRight } from 'lucide-react'

import { ReferralStatCard } from '@/components/Referral/ReferralStatCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { ReferralCode } from '@/types/referral'

interface ReferralStatStripProps {
  /** Baris halaman yang sedang dimuat. */
  rows: ReferralCode[]
  /** Jumlah seluruh kode menurut server. */
  total: number
  isReady: boolean
}

/**
 * Hanya "total kode" yang benar-benar berlaku untuk seluruh data — sisanya
 * hanya bisa dihitung dari baris yang termuat, karena endpoint daftar tidak
 * menyediakan agregat. Saat satu halaman sudah memuat semuanya, cakupan itu
 * kebetulan sama dengan keseluruhan, dan keterangannya ikut menyesuaikan.
 */
export function ReferralStatStrip({ rows, total, isReady }: ReferralStatStripProps) {
  const { t, i18n } = useTranslation('common')

  if (!isReady) {
    return (
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-[5.25rem] w-full rounded-xl' />
        ))}
      </div>
    )
  }

  const locale = i18n.language.startsWith('id') ? 'id-ID' : 'en-US'
  const active = rows.filter((row) => row.is_active).length
  const inactive = rows.length - active
  const avgPercent =
    rows.length > 0 ? rows.reduce((acc, row) => acc + row.percent, 0) / rows.length : 0

  const coversEverything = rows.length >= total
  const scopeHint = coversEverything
    ? undefined
    : t('referralStats.scopedHint', { count: rows.length })

  return (
    <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
      <ReferralStatCard
        label={t('referralStats.totalCodes')}
        value={total.toLocaleString(locale)}
        icon={Tags}
      />
      <ReferralStatCard
        label={t('referralStats.active')}
        value={active.toLocaleString(locale)}
        icon={ToggleRight}
        valueClass='text-emerald-600'
        hint={scopeHint}
      />
      <ReferralStatCard
        label={t('referralStats.inactive')}
        value={inactive.toLocaleString(locale)}
        icon={CircleSlash}
        hint={scopeHint}
      />
      <ReferralStatCard
        label={t('referralStats.avgPercent')}
        value={`${avgPercent.toLocaleString(locale, { maximumFractionDigits: 1 })}%`}
        icon={Percent}
        hint={scopeHint}
      />
    </div>
  )
}
