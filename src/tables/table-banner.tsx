import { BannerActionsHeader, BannerRowActions } from '@/components/Banner/BannerRowActions'
import type { Banner } from '@/types/banner'
import type { ColumnDef } from '@tanstack/react-table'

export const bannerColumns: ColumnDef<Banner>[] = [
  {
    accessorKey: 'image',
    header: 'Image',
    cell: ({ row }) => {
      const src = row.original.image || 'https://api.dicebear.com/9.x/lorelei/svg'
      return (
        <img
          src={src}
          alt="banner"
          className="h-12 w-auto border rounded"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.png'
          }}
        />
      )
    },
  },
  {
    accessorKey: 'redirect_link',
    header: 'Redirect Link',
  },
  {
    id: 'actions',
    header: () => <BannerActionsHeader />,
    cell: ({ row }) => <BannerRowActions banner={row.original} />,
  },
]
