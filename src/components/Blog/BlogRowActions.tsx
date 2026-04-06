import { DeleteBlogDialog } from '@/components/Blog/Delete/Delete'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Blog } from '@/tables/table-blog'
import { Pencil } from 'lucide-react'

export function BlogActionsHeader() {
  return (
    <span className="flex w-full min-w-[10rem] justify-end pr-1 text-right">Aksi</span>
  )
}

export function BlogRowActions({
  blog,
  onEdit,
}: {
  blog: Blog
  onEdit: (blog: Blog) => void
}) {
  const toolbarBtn =
    'border-0 bg-transparent shadow-none hover:bg-muted/70'

  return (
    <div className="flex w-full min-w-[10rem] justify-end pr-0.5">
      <div
        className="inline-flex items-center gap-1 rounded-lg border border-input bg-muted/25 p-1 shadow-xs dark:bg-muted/35"
        role="group"
        aria-label="Aksi untuk artikel ini"
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onEdit(blog)}
          className={cn('cursor-pointer gap-1.5', toolbarBtn)}
          aria-label="Ubah artikel"
        >
          <Pencil className="h-4 w-4 shrink-0" aria-hidden />
          <span className="hidden sm:inline">Ubah</span>
        </Button>
        <DeleteBlogDialog blogId={blog.id} triggerClassName={toolbarBtn} />
      </div>
    </div>
  )
}
