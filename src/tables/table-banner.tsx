import { BannerActionsHeader, BannerRowActions } from '@/components/Banner/BannerRowActions'
import type { Banner } from '@/types/banner'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ZoomIn, Copy, Check, ExternalLink, Link2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

function ImageCell({ src, alt }: { src: string; alt: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className='relative group cursor-zoom-in h-12 w-24 overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-800 bg-muted/30 shrink-0 transition-transform duration-200 hover:scale-[1.02]'>
          <img
            src={src}
            alt={alt}
            className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
            onError={(e) => {
              e.currentTarget.src = '/placeholder.png'
            }}
          />
          <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200'>
            <ZoomIn className='h-4 w-4 text-white' />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className='max-w-3xl p-1 bg-transparent border-none shadow-none focus:outline-hidden'>
        <div className='relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2'>
          <img
            src={src}
            alt={alt}
            className='w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl'
            onError={(e) => {
              e.currentTarget.src = '/placeholder.png'
            }}
          />
        </div>
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

  if (!url) return <span className='text-xs text-slate-400 italic'>—</span>

  return (
    <div className='flex items-center gap-2 max-w-[18rem] group'>
      <a
        href={url}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-200 shrink-0 max-w-[15rem] truncate',
          isExternal
            ? 'bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40 hover:bg-blue-50 dark:hover:bg-blue-950/40'
            : 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
        )}
        title={url}
      >
        {isExternal ? <ExternalLink className='h-3.5 w-3.5 shrink-0' /> : <Link2 className='h-3.5 w-3.5 shrink-0' />}
        <span className='truncate'>{url}</span>
      </a>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
        onClick={handleCopy}
        title='Copy Link'
      >
        {copied ? <Check className='h-3.5 w-3.5 text-emerald-500' /> : <Copy className='h-3.5 w-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200' />}
      </Button>
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
