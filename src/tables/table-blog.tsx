import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import type { TFunction } from 'i18next'
import i18n from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { BlogActionsHeader, BlogRowActions } from '@/components/Blog/BlogRowActions'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export type Blog = {
  id: string
  title: string
  slug: string
  category: string
  tags: string[]
  thumbnail: string
  status: 'draft' | 'published'
  created_at: string
}

function dateLocale() {
  return i18n.language.startsWith('id') ? idLocale : enUS
}

function TitleCell({
  title,
  slug,
  createdAt,
  locale,
}: {
  title: string
  slug: string
  createdAt: string
  locale: any
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(slug)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='flex max-w-[16rem] flex-col gap-1'>
      <span className='truncate text-sm font-bold text-slate-800 dark:text-slate-200'>{title}</span>
      <div className='flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500'>
        <time dateTime={createdAt}>
          {format(new Date(createdAt), 'd MMM yyyy', { locale })}
        </time>
        <span>•</span>
        <div className='flex items-center gap-1 group/slug max-w-[10rem]'>
          <span className='truncate italic font-medium'>/{slug}</span>
          <button
            type='button'
            onClick={handleCopy}
            className='opacity-0 group-hover/slug:opacity-100 transition-opacity duration-200 cursor-pointer p-0.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded'
            title='Copy Slug'
          >
            {copied ? <Check className='h-3 w-3 text-emerald-500' /> : <Copy className='h-3 w-3 text-slate-400' />}
          </button>
        </div>
      </div>
    </div>
  )
}

export function getBlogColumns(t: TFunction, onEdit: (blog: Blog) => void): ColumnDef<Blog>[] {
  return [
    {
      accessorKey: 'thumbnail',
      header: t('blogTable.colThumbnail'),
      cell: ({ row }) => (
        <img
          src={row.original.thumbnail}
          alt={row.original.title}
          className='h-11 w-20 rounded-lg border border-slate-200 dark:border-zinc-800 object-cover bg-muted/40'
          onError={(e) => {
            e.currentTarget.src = '/placeholder.png'
          }}
        />
      ),
    },
    {
      accessorKey: 'title',
      header: t('blogTable.colTitle'),
      cell: ({ row }) => (
        <TitleCell
          title={row.original.title}
          slug={row.original.slug}
          createdAt={row.original.created_at}
          locale={dateLocale()}
        />
      ),
    },
    {
      accessorKey: 'category',
      header: t('blogTable.colCategory'),
      cell: ({ row }) => (
        <Badge
          variant='secondary'
          className='text-[9px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-zinc-700/50'
        >
          {row.original.category?.trim() ? row.original.category : '—'}
        </Badge>
      ),
    },
    {
      accessorKey: 'tags',
      header: t('blogTable.colTags'),
      cell: ({ row }) => {
        const tags = row.original.tags || []
        return (
          <div className='flex max-w-[10rem] flex-wrap gap-1'>
            {tags.length > 0 ? (
              tags.map((tag, index) => (
                <Badge
                  key={`${tag}-${index}`}
                  variant='outline'
                  className='border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 px-1.5 py-0 text-[9px] font-bold text-indigo-600 dark:text-indigo-400'
                >
                  #{tag}
                </Badge>
              ))
            ) : (
              <span className='text-xs italic text-slate-400'>{t('blogTable.noTags')}</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: t('blogTable.colStatus'),
      cell: ({ row }) => {
        const isPublished = row.original.status === 'published'
        const label = isPublished ? t('blogTable.statusPublished') : t('blogTable.statusDraft')
        return (
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors duration-200',
              isPublished
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                : 'bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 shrink-0 rounded-full',
                isPublished ? 'bg-emerald-500 shadow-sm animate-pulse' : 'bg-amber-500',
              )}
              aria-hidden
            />
            {label}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: () => <BlogActionsHeader />,
      cell: ({ row }) => <BlogRowActions blog={row.original} onEdit={onEdit} />,
    },
  ]
}
