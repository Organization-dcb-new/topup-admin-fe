import { useBulkUpdateGameStatus } from '@/hooks/useGame'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function BulkUpdateGameStatus() {
  const bulkMutation = useBulkUpdateGameStatus()
  const [openActive, setOpenActive] = useState(false)
  const [openInactive, setOpenInactive] = useState(false)

  const confirmActive = () => {
    bulkMutation.mutate(true, {
      onSuccess: () => setOpenActive(false),
    })
  }

  const confirmInactive = () => {
    bulkMutation.mutate(false, {
      onSuccess: () => setOpenInactive(false),
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AlertDialog open={openActive} onOpenChange={setOpenActive}>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl font-semibold shadow-sm sm:min-w-0"
            disabled={bulkMutation.isPending}
          >
            Semua aktif
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader className="space-y-1 text-left">
            <AlertDialogTitle className="text-lg font-semibold tracking-tight">
              Set semua game aktif?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Seluruh game di basis data akan diatur menjadi aktif. Ini memengaruhi semua game, bukan
              hanya yang terlihat di halaman ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-3 sm:flex-row sm:justify-end sm:gap-4">
            <AlertDialogCancel
              type="button"
              className="h-10 min-w-[6.5rem] rounded-lg px-5"
              disabled={bulkMutation.isPending}
            >
              Batal
            </AlertDialogCancel>
            <Button
              type="button"
              className="h-10 min-w-[6.5rem] rounded-lg px-5 font-semibold sm:min-w-[11rem]"
              onClick={confirmActive}
              disabled={bulkMutation.isPending}
            >
              {bulkMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Memperbarui…
                </span>
              ) : (
                'Ya, aktifkan semua'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openInactive} onOpenChange={setOpenInactive}>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl font-semibold shadow-sm sm:min-w-0"
            disabled={bulkMutation.isPending}
          >
            Semua nonaktif
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader className="space-y-1 text-left">
            <AlertDialogTitle className="text-lg font-semibold tracking-tight">
              Set semua game nonaktif?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Seluruh game akan ditandai nonaktif. Pastikan ini yang Anda inginkan sebelum melanjutkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-3 sm:flex-row sm:justify-end sm:gap-4">
            <AlertDialogCancel
              type="button"
              className="h-10 min-w-[6.5rem] rounded-lg px-5"
              disabled={bulkMutation.isPending}
            >
              Batal
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              className="h-10 min-w-[6.5rem] rounded-lg px-5 font-semibold sm:min-w-[12rem]"
              onClick={confirmInactive}
              disabled={bulkMutation.isPending}
            >
              {bulkMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Memperbarui…
                </span>
              ) : (
                'Ya, nonaktifkan semua'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
