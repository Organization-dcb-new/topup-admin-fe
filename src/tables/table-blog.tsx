import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import type { TFunction } from 'i18next'
import i18n from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { BlogActionsHeader, BlogRowActions } from '@/components/Blog/BlogRowActions'
import { cn } from '@/lib/utils'

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

export function getBlogColumns(t: TFunction, onEdit: (blog: Blog) => void): ColumnDef<Blog>[] {
  return [
    {
      accessorKey: 'thumbnail',
      header: t('blogTable.colThumbnail'),
      cell: ({ row }) => (
        <img
          src={row.original.thumbnail}
          alt={row.original.title}
          className='h-11 w-[4.5rem] rounded-md border border-border object-cover bg-muted'
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
        <div className='flex max-w-[14rem] flex-col gap-0.5'>
          <span className='truncate text-sm font-semibold text-foreground'>{row.original.title}</span>
          <time
            className='text-xs text-muted-foreground'
            dateTime={row.original.created_at}
          >
            {format(new Date(row.original.created_at), 'd MMM yyyy', { locale: dateLocale() })}
          </time>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: t('blogTable.colCategory'),
      cell: ({ row }) => (
        <Badge variant='secondary' className='text-[10px] font-semibold uppercase tracking-wide'>
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
                  className='border-primary/20 bg-primary/5 px-1.5 py-0 text-[9px] font-semibold uppercase text-primary'
                >
                  #{tag}
                </Badge>
              ))
            ) : (
              <span className='text-xs italic text-muted-foreground'>{t('blogTable.noTags')}</span>
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
              'flex items-center gap-2 text-xs font-semibold',
              isPublished ? 'text-emerald-600' : 'text-amber-600',
            )}
          >
            <span
              className={cn(
                'h-2 w-2 shrink-0 rounded-full',
                isPublished ? 'bg-emerald-500' : 'bg-amber-500',
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
