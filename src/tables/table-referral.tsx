import { DeleteReferralModal } from '@/components/ReferralCode/DeleteReferralModal'
import { ReferralFormModal } from '@/components/ReferralCode/ReferralFormModal'
import { Switch } from '@/components/ui/switch'
import { nbCode, nbLink, nbSwitch } from '@/lib/nb'
import type { ReferralCode } from '@/types/referral'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { Link } from 'react-router-dom'

export const getReferralColumns = (
  t: TFunction,
  onToggleStatus: (referral: ReferralCode) => void,
): ColumnDef<ReferralCode>[] => [
  {
    accessorKey: 'name',
    header: t('referralPage.table.name'),
    cell: ({ row }) => (
      <Link to={`/referral-codes/${row.original.id}`} className={nbLink}>
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'code',
    header: t('referralPage.table.code'),
    cell: ({ row }) => <code className={nbCode}>{row.original.code}</code>,
  },
  {
    accessorKey: 'percent',
    header: t('referralPage.table.percent'),
    cell: ({ row }) => (
      <span className='nb-frame nb-frame-thin inline-block bg-[#ff9ed2] px-1.5 py-0.5 text-xs font-black tabular-nums'>
        {row.original.percent}%
      </span>
    ),
  },
  {
    accessorKey: 'is_active',
    header: t('referralPage.table.status'),
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <Switch
          className={nbSwitch}
          checked={row.original.is_active}
          onCheckedChange={() => onToggleStatus(row.original)}
          aria-label={t('referralPage.form.statusLabel')}
        />
        <span className='text-[11px] font-black uppercase tracking-[0.12em] text-[#111]/70'>
          {row.original.is_active
            ? t('referralPage.statusActive')
            : t('referralPage.statusInactive')}
        </span>
      </div>
    ),
  },
  {
    id: 'actions',
    header: t('referralPage.table.actions'),
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <ReferralFormModal referral={row.original} />
        <DeleteReferralModal id={row.original.id} />
      </div>
    ),
  },
]
