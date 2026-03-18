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
          <AlertDialogTitle>Delete Article?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The article will be permanently removed from the server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteMutation.mutate(blogId)}
            className="bg-red-500 hover:bg-red-600 cursor-pointer"
          >
            {deleteMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
            {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
