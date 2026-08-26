import { useTranslation } from 'react-i18next'

import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog'
import { useDeleteBlog } from '../hooks/useBlog'
import type { Blog } from '../types/blog'

/**
 * Pembungkus tipis di atas konfirmasi hapus bersama. Dialog bespoke sebelumnya
 * menutup sebelum mutasinya selesai (bawaan `AlertDialogAction` yang merender
 * tombol sebagai `Close`) dan deskripsinya tidak pernah menyebut artikel mana —
 * dua bug yang sudah diperbaiki di `ConfirmDeleteDialog`.
 */
export function DeleteBlogDialog({
  blog,
  triggerLabel,
}: {
  blog: Blog
  triggerLabel?: string
}) {
  const { t } = useTranslation('common')
  const deleteMutation = useDeleteBlog()

  return (
    <ConfirmDeleteDialog
      name={blog.title}
      title={t('deleteBlogModal.title')}
      description={t('deleteBlogModal.description')}
      triggerAriaLabel={t('deleteBlogModal.triggerAria')}
      triggerLabel={triggerLabel}
      isPending={deleteMutation.isPending}
      onConfirm={(done) => deleteMutation.mutate(blog.id, { onSettled: done })}
    />
  )
}
