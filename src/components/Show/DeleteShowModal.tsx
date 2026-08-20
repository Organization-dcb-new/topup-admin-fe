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
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useDeleteShow } from '@/hooks/useShow'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export function DeleteShowButton({
  id,
  triggerClassName,
}: {
  id: string
  triggerClassName?: string
}) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  /** Dialog dikendalikan sendiri supaya baru tertutup setelah hapus benar-benar
   *  berhasil. Sebelumnya ia menutup seketika saat diklik, jadi kegagalan hapus
   *  terjadi di balik layar yang sudah hilang. */
  const mutation = useDeleteShow(id, () => setOpen(false))

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type='button'
          className={cn(
            'nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-8 cursor-pointer items-center gap-1.5 px-2 text-[10px] font-black uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-60',
            triggerClassName,
          )}
          disabled={mutation.isPending}
          aria-label={t('deleteShowModal.triggerAria')}
        >
          <Trash2 className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
          <span className='hidden sm:inline'>{t('deleteShowModal.triggerLabel')}</span>
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className='nb nb-frame nb-frame-thick nb-sd-lg gap-0 overflow-hidden bg-white p-0 sm:max-w-lg'>
        <div className='border-b-4 border-[#111] bg-[#ff4d3d] px-5 py-4'>
          <AlertDialogHeader className='gap-2 text-left'>
            <div className='flex items-center gap-2.5'>
              <span className='nb-frame nb-frame-thin flex h-9 w-9 shrink-0 items-center justify-center bg-white'>
                <Trash2 className='h-4 w-4' strokeWidth={3} aria-hidden />
              </span>
              <AlertDialogTitle className='text-xl font-black uppercase leading-none tracking-tight'>
                {t('deleteShowModal.title')}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className='text-left text-xs font-bold text-[#111]/80'>
              {t('deleteShowModal.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className='gap-2 px-5 py-5'>
          <AlertDialogCancel
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-11 cursor-pointer bg-white px-5 text-xs font-black uppercase tracking-[0.14em] sm:min-w-[5.5rem]'
            disabled={mutation.isPending}
          >
            {t('addGamesModal.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-11 cursor-pointer bg-[#ff4d3d] px-5 text-xs font-black uppercase tracking-[0.14em] text-[#111] disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[5.5rem]'
            onClick={(e) => {
              e.preventDefault()
              mutation.mutate()
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? t('deleteShowModal.deleting')
              : t('deleteShowModal.confirmDelete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
