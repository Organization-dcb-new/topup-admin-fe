import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import type { AdminUser } from '@/types/admin'
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react'
import { UpdateAdminRole } from '@/components/Admin/Update'
import { DeleteAdminButton } from '@/components/Admin/Delete'
import { nbAccent, nbBadge } from '@/lib/nb'
import { cn } from '@/lib/utils'

/** Ikon + warna per peran. Warnanya sengaja beda tajam supaya peran `dev`
 *  langsung kelihatan saat menyisir daftar panjang. */
const ROLE_STYLE: Record<string, { icon: typeof Shield; accent: string }> = {
  dev: { icon: ShieldAlert, accent: nbAccent.pink },
  admin: { icon: ShieldCheck, accent: nbAccent.cyan },
  noc: { icon: Shield, accent: nbAccent.cream },
}

export const getAdminColumns = (t: TFunction): ColumnDef<AdminUser>[] => [
  {
    accessorKey: 'username',
    header: t('adminTable.colUsername'),
    cell: ({ row }) => <div className='font-black'>{row.original.username}</div>,
  },
  {
    accessorKey: 'email',
    header: t('adminTable.colEmail'),
    cell: ({ row }) => (
      <div className='max-w-[14rem] truncate font-bold sm:max-w-xs' title={row.original.email}>
        {row.original.email}
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: t('adminTable.colRole'),
    cell: ({ row }) => {
      const role = row.original.role
      const style = ROLE_STYLE[role] ?? { icon: Shield, accent: nbAccent.white }
      const Icon = style.icon
      return (
        <span className={cn(nbBadge, style.accent)}>
          <Icon className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
          {role}
        </span>
      )
    },
  },
  {
    accessorKey: 'two_factor_enabled',
    header: t('adminTable.colTwoFactor'),
    cell: ({ row }) => (
      <span className={cn(nbBadge, row.original.two_factor_enabled ? nbAccent.lime : nbAccent.cream)}>
        {row.original.two_factor_enabled ? t('adminTable.enabled') : t('adminTable.disabled')}
      </span>
    ),
  },
  {
    id: 'actions',
    header: t('adminTable.colActions'),
    cell: ({ row }) => (
      <div className='flex flex-wrap items-center gap-2'>
        <UpdateAdminRole id={row.original.id} currentRole={row.original.role} />
        <DeleteAdminButton id={row.original.id} email={row.original.email} />
      </div>
    ),
  },
]
