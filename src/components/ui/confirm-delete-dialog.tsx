import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Trash2 } from 'lucide-react'

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

interface ConfirmDeleteDialogProps {
  /** Nama record yang akan dihapus — ditampilkan agar tidak salah baris */
  name: string
  title: string
  description: string
  triggerAriaLabel: string
  isPending?: boolean
  onConfirm: (done: () => void) => void
}

/**
 * Konfirmasi hapus bersama untuk seluruh modul pembayaran.
 *
 * Dua bug yang diperbaiki sekaligus di sini: `AlertDialogAction` bawaan Radix
 * merender tombol sebagai `Close`, sehingga dialog tertutup sebelum mutasi
 * selesai dan indikator "menghapus…" tidak pernah terlihat; dan dialog lama
 * tidak pernah menyebut record mana yang akan dihapus.
 */
export function ConfirmDeleteDialog({
  name,
  title,
  description,
  triggerAriaLabel,
  isPending,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return
        setOpen(next)
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
          disabled={isPending}
          aria-label={triggerAriaLabel}
        >
          <Trash2 className='h-4 w-4' aria-hidden />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className='rounded-xl sm:max-w-md'>
        <AlertDialogHeader className='items-center gap-3 text-center sm:items-start sm:text-left'>
          <span
            className='flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive'
            aria-hidden
          >
            <Trash2 className='h-5 w-5' />
          </span>
          <div className='space-y-1.5'>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <p className='truncate rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground'>
          {name}
        </p>

        <AlertDialogFooter className='gap-2 sm:gap-2'>
          <AlertDialogCancel className='rounded-lg' disabled={isPending}>
            {t('confirmDelete.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className='rounded-lg bg-destructive text-white hover:bg-destructive/90'
            disabled={isPending}
            onClick={(e) => {
              // Cegah Radix menutup dialog sebelum mutasi selesai
              e.preventDefault()
              onConfirm(() => setOpen(false))
            }}
          >
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 shrink-0 animate-spin' aria-hidden />
                {t('confirmDelete.deleting')}
              </>
            ) : (
              t('confirmDelete.confirm')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
