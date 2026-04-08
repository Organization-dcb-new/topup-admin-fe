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
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import { useDeleteCategoryProduct } from '@/hooks/useCategoryProduct'

export function DeleteCategoryProductButton({ id }: { id: string }) {
  const mutation = useDeleteCategoryProduct(id)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="cursor-pointer text-destructive hover:bg-destructive/10"
          disabled={mutation.isPending}
          aria-label="Hapus kategori produk"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus kategori produk?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Kategori produk akan dihapus dari daftar. Pastikan tidak ada
            ketergantungan yang masih diperlukan sebelum melanjutkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer rounded-xl">Batal</AlertDialogCancel>
          <AlertDialogAction
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-destructive hover:bg-destructive/90"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                Menghapus…
              </>
            ) : (
              'Hapus'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
