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
import { useState } from 'react'
import { useDeleteShow } from '@/hooks/useShow'
import { cn } from '@/lib/utils'
import type { Show } from '@/types/show'
import { useTranslation } from 'react-i18next'

/**
 * Konfirmasi hapus show.
 *
 * Dua hal yang wajib dipertahankan di sini: dialog terkontrol supaya Radix tidak
 * menutupnya sebelum mutasi selesai (`AlertDialogAction` adalah tombol Close),
 * dan nama show ditampilkan supaya admin bisa membaca ulang baris mana yang
 * akan dihapus permanen.
 *
 * Komponen bersama `ConfirmDeleteDialog` menyelesaikan hal yang sama, tetapi
 * pemicunya tidak menerima `triggerClassName` — sedangkan tombol ini duduk di
 * dalam toolbar aksi baris tabel Show yang memasok kelasnya sendiri.
 */
export function DeleteShowButton({
  show,
  triggerClassName,
}: {
  show: Show
  triggerClassName?: string
}) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const mutation = useDeleteShow()

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (mutation.isPending) return
        setOpen(next)
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className={cn(
            'cursor-pointer gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive',
            triggerClassName,
          )}
          disabled={mutation.isPending}
          aria-label={t('deleteShowModal.triggerAriaNamed', { name: show.name })}
        >
          <Trash2 className='h-4 w-4 shrink-0' aria-hidden />
          <span className='hidden sm:inline'>{t('deleteShowModal.triggerLabel')}</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-lg'>
        <div className='border-b border-border bg-muted/30 px-6 py-5'>
          <AlertDialogHeader className='gap-1.5 text-left'>
            <div className='flex items-center gap-2'>
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive'>
                <Trash2 className='h-4 w-4' aria-hidden />
              </span>
              <AlertDialogTitle className='text-xl font-semibold tracking-tight'>
                {t('deleteShowModal.title')}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className='text-left'>
              {t('deleteShowModal.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <div className='space-y-2 px-6 py-4'>
          <p className='truncate rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground'>
            {show.name}
          </p>
          {show.games?.length ? (
            <p className='text-xs text-muted-foreground'>
              {t('deleteShowModal.gamesNotice', { total: show.games.length })}
            </p>
          ) : null}
        </div>

        <AlertDialogFooter className='gap-2 border-t border-border px-6 py-5 sm:pt-5'>
          <AlertDialogCancel
            type='button'
            className='cursor-pointer sm:min-w-[5.5rem]'
            disabled={mutation.isPending}
          >
            {t('deleteShowModal.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className='cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:min-w-[5.5rem]'
            onClick={(e) => {
              // Cegah Radix menutup dialog sebelum mutasi selesai
              e.preventDefault()
              mutation.mutate(show.id, { onSuccess: () => setOpen(false) })
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2
                  className='mr-2 h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none'
                  aria-hidden
                />
                {t('deleteShowModal.deleting')}
              </>
            ) : (
              t('deleteShowModal.confirmDelete')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
