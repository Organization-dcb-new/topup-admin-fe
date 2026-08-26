import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { Badge } from '@/components/ui/badge'
import { BlogActionsHeader, BlogRowActions } from '@/components/Blog/BlogRowActions'
import { BlogStatusBadge } from '@/components/Blog/BlogStatusBadge'
import { CopySlugButton } from '@/components/Blog/CopySlugButton'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import type { Blog } from '@/components/Blog/types/blog'

/**
 * Tipe kanoniknya tinggal di `@/components/Blog/types/blog`; re-ekspor ini
 * menjaga `import type { Blog } from '@/tables/table-blog'` yang sudah tersebar
 * di modul lain tetap berfungsi.
 */
export type { Blog }

/** Tag yang dirender per baris dibatasi supaya tinggi baris tabel terprediksi. */
const MAX_VISIBLE_TAGS = 3

function TitleCell({
  title,
  slug,
  createdAt,
}: {
  title: string
  slug: string
  createdAt: string
}) {
  return (
    <div className='flex max-w-[16rem] flex-col gap-1'>
      <span className='truncate text-sm font-bold text-slate-800 dark:text-slate-200'>{title}</span>
      <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
        <time dateTime={createdAt}>{formatBackendDateTime(createdAt, 'd MMM yyyy')}</time>
        <span aria-hidden>•</span>
        <div className='group/slug flex max-w-[10rem] items-center gap-1'>
          <span className='truncate font-medium italic'>/{slug}</span>
          <CopySlugButton slug={slug} />
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
          width={80}
          height={44}
          loading='lazy'
          decoding='async'
          className='h-11 w-20 rounded-lg border border-border bg-muted/40 object-cover'
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
        />
      ),
    },
    {
      accessorKey: 'category',
      header: t('blogTable.colCategory'),
      cell: ({ row }) => (
        <Badge
          variant='secondary'
          className='border border-border bg-muted text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground'
        >
          {row.original.category?.trim() ? row.original.category : '—'}
        </Badge>
      ),
    },
    {
      accessorKey: 'tags',
      header: t('blogTable.colTags'),
      cell: ({ row }) => {
        const tags = row.original.tags
        if (tags.length === 0) {
          return <span className='text-xs italic text-muted-foreground'>{t('blogTable.noTags')}</span>
        }

        const visible = tags.slice(0, MAX_VISIBLE_TAGS)
        const hiddenCount = tags.length - visible.length

        return (
          <div className='flex max-w-[10rem] flex-wrap gap-1'>
            {visible.map((tag, index) => (
              <Badge
                key={`${tag}-${index}`}
                variant='outline'
                className='border-primary/25 bg-primary/10 px-1.5 py-0 text-[10px] font-semibold text-primary'
              >
                #{tag}
              </Badge>
            ))}
            {hiddenCount > 0 && (
              <Badge
                variant='outline'
                className='border-border bg-muted px-1.5 py-0 text-[10px] font-semibold text-muted-foreground'
                title={tags.slice(MAX_VISIBLE_TAGS).join(', ')}
                aria-label={t('blogTable.moreTags', { count: hiddenCount })}
              >
                +{hiddenCount}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: t('blogTable.colStatus'),
      cell: ({ row }) => <BlogStatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: () => <BlogActionsHeader />,
      cell: ({ row }) => <BlogRowActions blog={row.original} onEdit={onEdit} />,
    },
  ]
}
