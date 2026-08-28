import { useTranslation } from 'react-i18next'

import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog'
import { type CategoryProduct, useDeleteCategoryProduct } from '@/hooks/useCategoryProduct'

/**
 * Versi lama hanya menerima `id`, jadi konfirmasinya tidak pernah bisa
 * menyebut kategori mana yang dihapus maupun berapa produk yang akan
 * terlepas — persis informasi yang dibutuhkan sebelum tindakan merusak.
 * Sekarang seluruh baris ikut masuk, dan dialognya memakai
 * `ConfirmDeleteDialog` bersama yang sudah menahan penutupan sampai mutasi
 * selesai (AlertDialogAction bawaan Radix menutup dialog seketika, sehingga
 * indikator "menghapus…" pada versi lama tidak pernah terlihat).
 */
export function DeleteCategoryProductButton({ category }: { category: CategoryProduct }) {
  const { t } = useTranslation('common')
  const mutation = useDeleteCategoryProduct(category.id)

  const attachedProducts = category.product?.length ?? 0

  return (
    <ConfirmDeleteDialog
      name={category.name}
      title={t('categoryProductDelete.title')}
      description={t('categoryProductDelete.description', { count: attachedProducts })}
      triggerAriaLabel={t('categoryProductDelete.triggerAria', { name: category.name })}
      isPending={mutation.isPending}
      onConfirm={(done) => mutation.mutate(undefined, { onSuccess: done })}
    />
  )
}
