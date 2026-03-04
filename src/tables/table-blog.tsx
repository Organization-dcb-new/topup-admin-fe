import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Edit3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DeleteBlogDialog } from '@/components/Blog/Delete/Delete'

export type Blog = {
  id: string
  title: string
  slug: string
  category: string
  thumbnail: string
  status: 'draft' | 'published'
  created_at: string
}

export const blogColumns = (onEdit: (blog: Blog) => void): ColumnDef<Blog>[] => [
  {
    accessorKey: 'thumbnail',
    header: 'Thumbnail',
    cell: ({ row }) => (
      <img
        src={row.original.thumbnail}
        alt={row.original.title}
        className="h-10 w-16 object-cover rounded-md border bg-gray-50"
      />
    ),
  },
  {
    accessorKey: 'title',
    header: 'Article Info',
    cell: ({ row }) => (
      <div className="flex flex-col max-w-62.5">
        <span className="font-bold text-sm truncate">{row.original.title}</span>
        <span className="text-[10px] text-gray-400 font-medium">
          {format(new Date(row.original.created_at), 'dd MMM yyyy')}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px] uppercase font-bold px-2 py-0">
        {row.original.category || 'N/A'}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const isPublished = row.original.status === 'published'
      return (
        <div
          className={`flex items-center gap-1.5 font-bold text-[10px] uppercase ${isPublished ? 'text-green-500' : 'text-orange-400'}`}
        >
          <div
            className={`h-1.5 w-1.5 rounded-full ${isPublished ? 'bg-green-500' : 'bg-orange-400'}`}
          />
          {row.original.status}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <button
          onClick={() => onEdit(row.original)}
          className="p-2 hover:bg-gray-100 text-gray-600 rounded-md transition-colors"
        >
          <Edit3 size={16} />
        </button>

        <DeleteBlogDialog blogId={row.original.id} />
      </div>
    ),
  },
]
