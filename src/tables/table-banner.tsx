import { BannerActionsHeader, BannerRowActions } from '@/components/Banner/BannerRowActions'
import type { Banner } from '@/types/banner'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ZoomIn, Copy, Check, ExternalLink, Link2, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

function ImageCell({ src, alt }: { src: string; alt: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm group relative h-12 w-24 shrink-0 cursor-zoom-in overflow-hidden bg-[#f5f1e8]'>
          <img
            src={src}
            alt={alt}
            className='h-full w-full object-cover'
            onError={(e) => {
              e.currentTarget.src = '/placeholder.png'
            }}
          />
          <div className='absolute inset-0 flex items-center justify-center bg-[#111]/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
            <ZoomIn className='h-4 w-4 text-white' strokeWidth={3} />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent
        className='nb nb-frame nb-frame-thick nb-sd-lg max-w-3xl bg-white p-2'
        showCloseButton={false}
      >
        <img
          src={src}
          alt={alt}
          className='h-auto max-h-[80vh] w-full object-contain'
          onError={(e) => {
            e.currentTarget.src = '/placeholder.png'
          }}
        />
        <DialogClose asChild>
          <button
            type='button'
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm absolute -right-3 -top-3 flex h-9 w-9 cursor-pointer items-center justify-center bg-[#ff4d3d]'
            aria-label='Close'
          >
            <X className='h-4 w-4' strokeWidth={3} aria-hidden />
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

function LinkCell({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  const isExternal = url.startsWith('http://') || url.startsWith('https://')

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!url)
    return (
      <span className='text-xs font-black uppercase tracking-wide text-[#111]/40'>—</span>
    )

  return (
    <div className='group flex max-w-[18rem] items-center gap-2'>
      <a
        href={url}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={cn(
          'nb-frame nb-frame-thin nb-press-sm inline-flex min-w-0 max-w-[15rem] shrink items-center gap-1.5 px-2 py-1 text-[10px] font-black uppercase tracking-wide',
          isExternal ? 'bg-[#6fe3f5]' : 'bg-[#ff9ed2]'
        )}
        title={url}
      >
        {isExternal ? (
          <ExternalLink className='h-3.5 w-3.5 shrink-0' strokeWidth={3} />
        ) : (
          <Link2 className='h-3.5 w-3.5 shrink-0' strokeWidth={3} />
        )}
        <span className='truncate'>{url}</span>
      </a>
      <button
        type='button'
        className={cn(
          'nb-frame nb-frame-thin nb-press-sm flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center',
          copied ? 'bg-[#c9f24d]' : 'bg-white'
        )}
        onClick={handleCopy}
        title='Copy Link'
        aria-label='Copy Link'
      >
        {copied ? (
          <Check className='h-3.5 w-3.5' strokeWidth={3} />
        ) : (
          <Copy className='h-3.5 w-3.5' strokeWidth={3} />
        )}
      </button>
    </div>
  )
}

export function getBannerColumns(t: TFunction): ColumnDef<Banner>[] {
  return [
    {
      accessorKey: 'image',
      header: t('bannerTable.colImage'),
      cell: ({ row }) => {
        const src = row.original.image || 'https://api.dicebear.com/9.x/lorelei/svg'
        return <ImageCell src={src} alt={t('bannerTable.imageAlt')} />
      },
    },
    {
      accessorKey: 'redirect_link',
      header: t('bannerTable.colRedirectLink'),
      cell: ({ row }) => <LinkCell url={row.original.redirect_link} />,
    },
    {
      id: 'actions',
      header: () => <BannerActionsHeader />,
      cell: ({ row }) => <BannerRowActions banner={row.original} />,
    },
  ]
}
