import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { useDeleteBlog } from '../hooks/useBlog'

export function DeleteBlogDialog({ blogId }: { blogId: string }) {
  const deleteMutation = useDeleteBlog()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer">
          <Trash2 size={18} />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Artikel?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak bisa dibatalkan. Artikel akan dihapus permanen dari server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteMutation.mutate(blogId)}
            className="bg-red-500 hover:bg-red-600 cursor-pointer"
          >
            {deleteMutation.isPending ? <Loader2 className="animate-spin" /> : 'Ya, Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
