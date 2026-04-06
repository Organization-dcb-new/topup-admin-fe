import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
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

export const blogColumns = (onEdit: (blog: Blog) => void): ColumnDef<Blog>[] => [
  {
    accessorKey: 'thumbnail',
    header: 'Gambar',
    cell: ({ row }) => (
      <img
        src={row.original.thumbnail}
        alt={row.original.title}
        className="h-11 w-[4.5rem] rounded-md border border-border object-cover bg-muted"
        onError={(e) => {
          e.currentTarget.src = '/placeholder.png'
        }}
      />
    ),
  },
  {
    accessorKey: 'title',
    header: 'Judul',
    cell: ({ row }) => (
      <div className="flex max-w-[14rem] flex-col gap-0.5">
        <span className="truncate text-sm font-semibold text-foreground">{row.original.title}</span>
        <time
          className="text-xs text-muted-foreground"
          dateTime={row.original.created_at}
        >
          {format(new Date(row.original.created_at), 'd MMM yyyy', { locale: localeId })}
        </time>
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Kategori',
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wide">
        {row.original.category?.trim() ? row.original.category : '—'}
      </Badge>
    ),
  },
  {
    accessorKey: 'tags',
    header: 'Tag',
    cell: ({ row }) => {
      const tags = row.original.tags || []
      return (
        <div className="flex max-w-[10rem] flex-wrap gap-1">
          {tags.length > 0 ? (
            tags.map((tag, index) => (
              <Badge
                key={`${tag}-${index}`}
                variant="outline"
                className="border-primary/20 bg-primary/5 px-1.5 py-0 text-[9px] font-semibold uppercase text-primary"
              >
                #{tag}
              </Badge>
            ))
          ) : (
            <span className="text-xs italic text-muted-foreground">Tanpa tag</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const isPublished = row.original.status === 'published'
      const label = isPublished ? 'Terbit' : 'Draf'
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
