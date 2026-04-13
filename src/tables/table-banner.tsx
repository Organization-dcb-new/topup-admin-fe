import { BannerActionsHeader, BannerRowActions } from '@/components/Banner/BannerRowActions'
import type { Banner } from '@/types/banner'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'

export function getBannerColumns(t: TFunction): ColumnDef<Banner>[] {
  return [
    {
      accessorKey: 'image',
      header: t('bannerTable.colImage'),
      cell: ({ row }) => {
        const src = row.original.image || 'https://api.dicebear.com/9.x/lorelei/svg'
        return (
          <img
            src={src}
            alt={t('bannerTable.imageAlt')}
            className="h-12 w-auto rounded border"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.png'
            }}
          />
        )
      },
    },
    {
      accessorKey: 'redirect_link',
      header: t('bannerTable.colRedirectLink'),
    },
    {
      id: 'actions',
      header: () => <BannerActionsHeader />,
      cell: ({ row }) => <BannerRowActions banner={row.original} />,
    },
  ]
}
