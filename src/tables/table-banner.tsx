import { BannerActionsHeader, BannerRowActions } from '@/components/Banner/BannerRowActions'
import { BannerImage } from '@/components/Banner/BannerImage'
import { BannerLink } from '@/components/Banner/BannerLink'
import type { Banner } from '@/types/banner'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ZoomIn, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function ImageCell({ src, alt }: { src: string; alt: string }) {
  const { t } = useTranslation('common')

  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* <button>, bukan <div>: pemicu lama tidak fokusabel sehingga zoom
            gambar sama sekali tidak bisa dibuka lewat keyboard. */}
        <button
          type='button'
          aria-label={t('bannerTable.zoomImage')}
          className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm group relative block h-12 w-24 shrink-0 cursor-zoom-in overflow-hidden bg-[#f5f1e8]'
        >
          <BannerImage src={src} alt={alt} className='h-full w-full object-cover' />
          <span className='absolute inset-0 flex items-center justify-center bg-[#111]/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
            <ZoomIn className='h-4 w-4 text-white' strokeWidth={3} aria-hidden />
          </span>
        </button>
      </DialogTrigger>
      <DialogContent
        className='nb nb-frame nb-frame-thick nb-sd-lg max-w-3xl bg-white p-2'
        showCloseButton={false}
      >
        <BannerImage
          src={src}
          alt={alt}
          className='h-auto max-h-[80vh] w-full object-contain'
          fallbackClassName='min-h-[16rem]'
        />
        <DialogClose asChild>
          <button
            type='button'
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm absolute -right-3 -top-3 flex h-9 w-9 cursor-pointer items-center justify-center bg-[#ff4d3d]'
            aria-label={t('bannerTable.closePreview')}
          >
            <X className='h-4 w-4' strokeWidth={3} aria-hidden />
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

export function getBannerColumns(t: TFunction): ColumnDef<Banner>[] {
  return [
    {
      accessorKey: 'image',
      header: t('bannerTable.colImage'),
      cell: ({ row }) => <ImageCell src={row.original.image} alt={t('bannerTable.imageAlt')} />,
    },
    {
      accessorKey: 'redirect_link',
      header: t('bannerTable.colRedirectLink'),
      cell: ({ row }) => <BannerLink url={row.original.redirect_link} className='max-w-[18rem]' />,
    },
    {
      id: 'actions',
      header: () => <BannerActionsHeader />,
      cell: ({ row }) => <BannerRowActions banner={row.original} />,
    },
  ]
}
