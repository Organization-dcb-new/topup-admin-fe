import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { Check, Copy, Edit, Loader2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Link } from 'react-router-dom'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { cn } from '@/lib/utils'
import type { ReferralCode } from '@/types/referral'

interface ReferralColumnOptions {
  t: TFunction
  canUpdate: boolean
  canDelete: boolean
  onEdit: (referral: ReferralCode) => void
  onDelete: (referral: ReferralCode) => void
  onToggle: (referral: ReferralCode) => void
  onCopy: (code: string) => void
  /** Kode yang statusnya sedang dikirim, agar sakelarnya dikunci selama itu. */
  togglingId: string | null
  /** Kode yang baru saja disalin, untuk umpan balik sesaat pada tombol salin. */
  copiedCode: string | null
}

export const getReferralColumns = ({
  t,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
  onToggle,
  onCopy,
  togglingId,
  copiedCode,
}: ReferralColumnOptions): ColumnDef<ReferralCode>[] => {
  const columns: ColumnDef<ReferralCode>[] = [
    {
      accessorKey: 'code',
      header: t('referralPage.table.code'),
      cell: ({ row }) => {
        const { code, percent } = row.original
        const isCopied = copiedCode === code
        return (
          <div className='flex items-start gap-2'>
            <div className='min-w-0 space-y-1.5'>
              {/* Kode adalah identitas yang dicari orang di layar ini, jadi
                  dialah yang diberi bobot visual paling besar. */}
              <code className='block w-fit rounded-md border border-border bg-muted px-2 py-1 font-mono text-sm font-bold uppercase tracking-[0.12em] text-foreground'>
                {code}
              </code>
              <span className='inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary'>
                {percent}%
              </span>
            </div>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='mt-0.5 h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground'
              aria-label={t('referralPage.copyCode', { code })}
              onClick={() => onCopy(code)}
            >
              {isCopied ? (
                <Check className='h-3.5 w-3.5 text-emerald-600' aria-hidden />
              ) : (
                <Copy className='h-3.5 w-3.5' aria-hidden />
              )}
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: 'name',
      header: t('referralPage.table.name'),
      cell: ({ row }) => (
        <div className='min-w-0 space-y-1'>
          <Link
            to={`/referral-codes/${row.original.id}`}
            className='block truncate font-semibold text-primary hover:underline'
          >
            {row.original.name}
          </Link>
          <div className='text-xs tabular-nums text-muted-foreground'>
            {t('referralPage.createdOn', {
              date: formatBackendDateTime(row.original.created_at, 'dd MMM yyyy'),
            })}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'is_active',
      header: t('referralPage.table.status'),
      cell: ({ row }) => {
        const { id, code, is_active: isActive } = row.original
        const label = isActive ? t('referralPage.statusActive') : t('referralPage.statusInactive')
        const badge = (
          <Badge
            variant='outline'
            className={cn(
              'gap-1.5 font-semibold',
              isActive
                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700'
                : 'border-border bg-muted text-muted-foreground',
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 shrink-0 rounded-full',
                isActive ? 'bg-emerald-500' : 'bg-muted-foreground/60',
              )}
              aria-hidden
            />
            {label}
          </Badge>
        )

        // Tanpa hak ubah, status tetap dilaporkan — hanya tidak berupa kontrol
        // yang mengundang klik lalu ditolak backend.
        if (!canUpdate) return badge

        const isToggling = togglingId === id
        return (
          <div className='flex items-center gap-2.5'>
            <Switch
              checked={isActive}
              disabled={isToggling}
              onCheckedChange={() => onToggle(row.original)}
              aria-label={t('referralPage.toggleStatusAria', { code })}
            />
            {isToggling ? (
              <span className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
                <Loader2 className='h-3 w-3 animate-spin' aria-hidden />
                {label}
              </span>
            ) : (
              badge
            )}
          </div>
        )
      },
    },
  ]

  if (canUpdate || canDelete) {
    columns.push({
      id: 'actions',
      header: t('referralPage.table.actions'),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          {canUpdate && (
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='h-8 w-8'
              onClick={() => onEdit(row.original)}
              aria-label={t('referralPage.editAria', { code: row.original.code })}
              title={t('referralPage.editBtn')}
            >
              <Edit className='h-4 w-4' aria-hidden />
            </Button>
          )}
          {canDelete && (
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive'
              onClick={() => onDelete(row.original)}
              aria-label={t('referralPage.deleteAria', { code: row.original.code })}
              title={t('referralPage.deleteBtn')}
            >
              <Trash2 className='h-4 w-4' aria-hidden />
            </Button>
          )}
        </div>
      ),
    })
  }

  return columns
}
