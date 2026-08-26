import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import type { AdminUser } from '@/types/admin'
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { UpdateAdminRole } from '@/components/Admin/Update'
import { DeleteAdminButton } from '@/components/Admin/Delete'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { cn } from '@/lib/utils'

/**
 * Role sistem punya warna sendiri; role custom memakai gaya netral.
 * Sejak RBAC, slug bisa apa saja, jadi `default` bukan lagi kasus mustahil.
 */
const roleBadgeClass = (slug: string | undefined) => {
  switch (slug) {
    case 'dev':
      return 'border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-200'
    case 'admin':
      return 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200'
    case 'noc':
      return 'border-border bg-muted/50 text-muted-foreground'
    default:
      return 'border-border bg-muted/30 text-foreground'
  }
}

const roleIconClass = (slug: string | undefined) =>
  slug === 'dev'
    ? 'text-purple-600 dark:text-purple-300'
    : slug === 'admin'
      ? 'text-blue-600 dark:text-blue-300'
      : 'text-muted-foreground'

// Nama sengaja camelCase: PascalCase membuat react-refresh
// menganggapnya komponen, padahal ini hanya pemilih ikon.
const roleIconFor = (slug: string | undefined) =>
  slug === 'dev' ? ShieldAlert : slug === 'admin' ? ShieldCheck : Shield

interface AdminColumnOptions {
  t: TFunction
  /** `null` berarti identitas aktor belum diketahui — semua baris diperlakukan sebagai milik sendiri. */
  currentAdminId: string | null
  canUpdateRole: boolean
  canDelete: boolean
  /** Nama lengkap dari `/admin/brief`; `null` bila belum termuat. */
  adminName: (id: string) => string | null
}

export const getAdminColumns = ({
  t,
  currentAdminId,
  canUpdateRole,
  canDelete,
  adminName,
}: AdminColumnOptions): ColumnDef<AdminUser>[] => {
  // Gagal-tertutup: selama identitas aktor belum diketahui, tiap baris
  // dianggap milik sendiri. Membuka aksi lebih dulu berarti menawarkan
  // tindakan yang pasti ditolak backend dengan 400/403.
  const isSelfRow = (row: AdminUser) => !currentAdminId || row.id === currentAdminId

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: 'username',
      header: t('adminTable.colUsername'),
      cell: ({ row }) => {
        const fullName = adminName(row.original.id)
        return (
          <div className='min-w-0 space-y-0.5'>
            <div className='flex items-center gap-2'>
              <span className='font-medium text-foreground'>{row.original.username}</span>
              {isSelfRow(row.original) && (
                <Badge variant='outline' className='border-border text-[11px] font-medium'>
                  {t('adminTable.you')}
                </Badge>
              )}
            </div>
            {fullName && (
              <div className='truncate text-xs text-muted-foreground'>{fullName}</div>
            )}
            {/* Email punya kolomnya sendiri dari md ke atas; di layar sempit
                kolom itu disembunyikan dan alamatnya pindah ke sini. */}
            <div className='truncate text-xs text-muted-foreground md:hidden'>
              {row.original.email}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'email',
      header: t('adminTable.colEmail'),
      meta: { headerClassName: 'hidden md:table-cell', cellClassName: 'hidden md:table-cell' },
      cell: ({ row }) => (
        <div className='max-w-[14rem] truncate font-medium text-foreground sm:max-w-xs'>
          {row.original.email}
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: t('adminTable.colRole'),
      cell: ({ row }) => {
        const slug = row.original.role
        // Untuk role custom backend mengisi `role` dengan "custom" — itu nilai
        // teknis jalur rollback, bukan untuk ditampilkan.
        const label = row.original.role_name || slug
        const Icon = roleIconFor(slug)
        return (
          <div className='flex items-center gap-2'>
            <Icon className={cn('h-4 w-4 shrink-0', roleIconClass(slug))} aria-hidden />
            <Badge
              variant='outline'
              title={label}
              className={cn('max-w-40 truncate text-xs font-medium', roleBadgeClass(slug))}
            >
              {label}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'two_factor_enabled',
      header: t('adminTable.colTwoFactor'),
      cell: ({ row }) => {
        const enabled = row.original.two_factor_enabled
        return enabled ? (
          <Badge variant='success' className='font-medium'>
            {t('adminTable.enabled')}
          </Badge>
        ) : (
          <Badge variant='outline' className='border-border font-medium text-muted-foreground'>
            {t('adminTable.disabled')}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: t('adminTable.colCreatedAt'),
      meta: { headerClassName: 'hidden md:table-cell', cellClassName: 'hidden md:table-cell' },
      cell: ({ row }) => (
        <span className='whitespace-nowrap text-sm tabular-nums text-muted-foreground'>
          {formatBackendDateTime(row.original.created_at, 'dd MMM yyyy')}
        </span>
      ),
    },
  ]

  // Tanpa satu pun hak aksi, kolom ini hanya menyisakan header di atas sel
  // kosong — lebih baik tidak dirender sama sekali.
  if (canUpdateRole || canDelete) {
    columns.push({
      id: 'actions',
      header: t('adminTable.colActions'),
      cell: ({ row }) => {
        const isSelf = isSelfRow(row.original)
        return (
          <div className='flex flex-wrap items-center gap-2'>
            {canUpdateRole && (
              <UpdateAdminRole
                id={row.original.id}
                email={row.original.email}
                currentRoleId={row.original.role_id}
                currentRoleName={row.original.role_name || row.original.role}
                roleSlug={row.original.role}
                isSelf={isSelf}
                selfHint={t('adminTable.selfRoleHint')}
              />
            )}
            {canDelete && (
              <DeleteAdminButton
                id={row.original.id}
                email={row.original.email}
                isSelf={isSelf}
                selfHint={t('adminTable.selfDeleteHint')}
              />
            )}
          </div>
        )
      },
    })
  }

  return columns
}
