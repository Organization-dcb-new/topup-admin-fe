import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ListChecks, Loader2, Search } from 'lucide-react'

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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  type CategoryProduct,
  useAddProductToCategoryProduct,
} from '@/hooks/useCategoryProduct'
import { useGetProductNames } from '@/hooks/useProduct'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Baris pilihan: gabungan produk tersedia dan produk yang sudah menempel. */
type PickerItem = {
  id: string
  name: string
  price: number
  /** Kosong bila baris hanya diketahui dari isi kategori, bukan dari endpoint. */
  providerStatus: string
  attached: boolean
}

/**
 * Pengelola isi kategori.
 *
 * Tiga cacat lama yang diperbaiki di sini:
 * 1. `useGetProductNames` dipanggil tanpa gerbang di setiap baris tabel,
 *    sehingga daftar produk ditembak sebelum operator mengklik apa pun.
 *    Sekarang `open` diteruskan sebagai `enabled`.
 * 2. `AlertDialogAction` adalah `DialogPrimitive.Close`, jadi dialog lenyap
 *    sebelum mutasi selesai: indikator "menyimpan…" tidak pernah terlihat dan
 *    seluruh pilihan hilang bila penyimpanan gagal. Sekarang dialog dikendalikan
 *    state sendiri dan hanya ditutup di `onSuccess`.
 * 3. Endpoint ini MENGGANTI seluruh isi kategori meski namanya "add-product",
 *    jadi salinan yang dikirim harus utuh — dan teksnya harus mengatakan itu.
 */
export function AddProductToCategoryProductButton({
  category,
}: {
  category: CategoryProduct
}) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  /** null = belum disentuh operator, ikut isi kategori dari server */
  const [draft, setDraft] = useState<string[] | null>(null)

  const {
    data: available,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetProductNames(category.game_id, open)
  const mutation = useAddProductToCategoryProduct(category.id)

  const attachedProducts = useMemo(() => category.product ?? [], [category.product])
  const baseline = useMemo(() => attachedProducts.map((p) => p.id), [attachedProducts])
  const baselineSet = useMemo(() => new Set(baseline), [baseline])

  /**
   * Endpoint hanya mengembalikan produk yang "available", sedangkan produk yang
   * sudah menempel bisa saja tidak ikut di sana. Tanpa penggabungan ini,
   * anggota kategori yang sudah ada akan hilang dari daftar dan ikut terlepas
   * begitu operator menekan simpan.
   */
  const items = useMemo<PickerItem[]>(() => {
    const seen = new Set<string>()
    const list: PickerItem[] = []

    for (const product of available ?? []) {
      seen.add(product.id)
      list.push({
        id: product.id,
        name: product.name,
        price: product.price,
        providerStatus: product.provider_status,
        attached: baselineSet.has(product.id),
      })
    }

    for (const product of attachedProducts) {
      if (seen.has(product.id)) continue
      list.push({
        id: product.id,
        name: product.name,
        price: product.selling_price,
        providerStatus: '',
        attached: true,
      })
    }

    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [available, attachedProducts, baselineSet])

  const selected = draft ?? baseline
  const selectedSet = useMemo(() => new Set(selected), [selected])

  const visibleItems = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return items
    return items.filter((item) => item.name.toLowerCase().includes(term))
  }, [items, query])

  const toggle = (productId: string) => {
    setDraft((prev) => {
      const base = prev ?? baseline
      return base.includes(productId)
        ? base.filter((x) => x !== productId)
        : [...base, productId]
    })
  }

  const tickAllShown = () => {
    setDraft((prev) => {
      const base = prev ?? baseline
      const merged = new Set(base)
      for (const item of visibleItems) merged.add(item.id)
      return [...merged]
    })
  }

  const untickAllShown = () => {
    setDraft((prev) => {
      const base = prev ?? baseline
      const shown = new Set(visibleItems.map((item) => item.id))
      return base.filter((id) => !shown.has(id))
    })
  }

  const toAdd = selected.filter((id) => !baselineSet.has(id))
  const toRemove = baseline.filter((id) => !selectedSet.has(id))
  const hasChanges = toAdd.length > 0 || toRemove.length > 0
  const emptiesCategory = selected.length === 0 && baseline.length > 0

  const close = () => {
    setOpen(false)
    setDraft(null)
    setQuery('')
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        // Penyimpanan mengganti seluruh isi kategori; jangan biarkan Esc atau
        // klik overlay membatalkannya di tengah jalan.
        if (mutation.isPending) return
        if (next) setOpen(true)
        else close()
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground'
          aria-label={t('categoryProductAddProducts.triggerAria', {
            name: category.name,
          })}
          title={t('categoryProductAddProducts.triggerShort')}
        >
          <ListChecks className='h-4 w-4' aria-hidden />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className='rounded-xl sm:max-w-lg'>
        <AlertDialogHeader className='space-y-1 text-left'>
          <AlertDialogTitle className='text-lg font-semibold tracking-tight'>
            {t('categoryProductAddProducts.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('categoryProductAddProducts.description', { name: category.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Semantik ganti-seluruhnya harus disebut, bukan disiratkan nama endpoint */}
        <div className='flex gap-2.5 rounded-lg border border-warning/35 bg-warning/10 p-3'>
          <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-warning' aria-hidden />
          <p className='min-w-0 text-sm text-foreground'>
            {t('categoryProductAddProducts.replaceWarning')}
          </p>
        </div>

        <div className='space-y-2'>
          <label
            htmlFor={`cat-prod-search-${category.id}`}
            className='text-sm font-medium text-foreground'
          >
            {t('categoryProductAddProducts.searchLabel')}
          </label>
          <div className='relative'>
            <Search
              className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground'
              aria-hidden
            />
            <Input
              id={`cat-prod-search-${category.id}`}
              type='search'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('categoryProductAddProducts.searchPlaceholder')}
              className='h-9 pl-9'
              disabled={isLoading || mutation.isPending}
            />
          </div>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-2'>
          <p
            role='status'
            aria-live='polite'
            className='text-xs font-medium text-muted-foreground'
          >
            {t('categoryProductAddProducts.resultCount', { count: visibleItems.length })}
            {' · '}
            {t('categoryProductAddProducts.selectedCount', {
              selected: selected.length,
              total: items.length,
            })}
          </p>
          <div className='flex items-center gap-1'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-8 px-2 text-xs'
              onClick={tickAllShown}
              disabled={mutation.isPending || visibleItems.length === 0}
            >
              {t('categoryProductAddProducts.selectAll')}
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-8 px-2 text-xs'
              onClick={untickAllShown}
              disabled={mutation.isPending || visibleItems.length === 0}
            >
              {t('categoryProductAddProducts.deselectAll')}
            </Button>
          </div>
        </div>

        <div className='max-h-64 space-y-0.5 overflow-y-auto rounded-lg border border-border bg-muted/20 p-2'>
          {isLoading ? (
            <div
              className='flex flex-col items-center justify-center gap-3 py-10 text-center'
              role='status'
              aria-busy='true'
            >
              <Loader2 className='h-8 w-8 animate-spin text-primary' aria-hidden />
              <p className='text-sm text-muted-foreground'>
                {t('categoryProductAddProducts.loading')}
              </p>
            </div>
          ) : isError ? (
            <div className='flex flex-col items-center gap-3 py-10 text-center' role='alert'>
              <AlertTriangle className='h-8 w-8 text-destructive' aria-hidden />
              <p className='px-4 text-sm text-destructive'>
                {t('categoryProductAddProducts.loadError')}
              </p>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-8 text-xs'
                onClick={() => void refetch()}
                disabled={isFetching}
              >
                {isFetching && (
                  <Loader2 className='mr-1.5 h-3 w-3 shrink-0 animate-spin' aria-hidden />
                )}
                {t('categoryProductAddProducts.retry')}
              </Button>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className='flex flex-col items-center gap-3 py-10 text-center'>
              <Search className='h-8 w-8 text-muted-foreground/60' aria-hidden />
              <p className='px-4 text-sm text-muted-foreground'>
                {query.trim()
                  ? t('categoryProductAddProducts.noMatch')
                  : t('categoryProductAddProducts.empty')}
              </p>
            </div>
          ) : (
            visibleItems.map((item) => {
              const checkboxId = `cat-prod-${category.id}-${item.id}`
              const isChecked = selectedSet.has(item.id)
              const isEmptyStock = item.providerStatus === 'empty'

              return (
                <label
                  key={item.id}
                  htmlFor={checkboxId}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors duration-200 hover:bg-muted',
                    isChecked && 'bg-muted/60',
                  )}
                >
                  <Checkbox
                    id={checkboxId}
                    checked={isChecked}
                    onCheckedChange={() => toggle(item.id)}
                    disabled={mutation.isPending}
                  />
                  <span className='min-w-0 flex-1 truncate text-sm font-medium text-foreground'>
                    {item.name}
                  </span>
                  <span className='shrink-0 text-xs tabular-nums text-muted-foreground'>
                    {formatCurrency(item.price)}
                  </span>
                  {item.attached && (
                    <Badge
                      variant='outline'
                      className='shrink-0 border-primary/40 text-[10px] font-semibold text-primary'
                    >
                      {t('categoryProductAddProducts.attachedBadge')}
                    </Badge>
                  )}
                  {isEmptyStock && (
                    <Badge variant='destructive' className='shrink-0 text-[10px] font-semibold'>
                      {t('categoryProductAddProducts.statusEmpty')}
                    </Badge>
                  )}
                </label>
              )
            })
          )}
        </div>

        {/* Ringkasan dampak: operator berhak tahu apa yang akan berubah */}
        {(hasChanges || emptiesCategory) && (
          <ul className='space-y-1 rounded-lg border border-border bg-muted/30 p-2.5 text-xs'>
            {toAdd.length > 0 && (
              <li className='text-success'>
                {t('categoryProductAddProducts.summaryAdd', { count: toAdd.length })}
              </li>
            )}
            {toRemove.length > 0 && (
              <li className='font-medium text-destructive'>
                {t('categoryProductAddProducts.summaryRemove', { count: toRemove.length })}
              </li>
            )}
            {emptiesCategory && (
              <li className='font-medium text-destructive'>
                {t('categoryProductAddProducts.summaryEmpty')}
              </li>
            )}
          </ul>
        )}

        <AlertDialogFooter className='gap-2 sm:gap-2'>
          <AlertDialogCancel
            type='button'
            className='rounded-lg'
            disabled={mutation.isPending}
          >
            {t('categoryProductAddProducts.cancel')}
          </AlertDialogCancel>
          <Button
            type='button'
            className={cn(
              'rounded-lg font-semibold',
              toRemove.length > 0 && 'bg-destructive text-white hover:bg-destructive/90',
            )}
            // Dialog hanya ditutup setelah server menerima daftar barunya,
            // supaya pilihan tidak hilang saat penyimpanan gagal.
            onClick={() => mutation.mutate(selected, { onSuccess: close })}
            disabled={mutation.isPending || isLoading || isError || !hasChanges}
          >
            {mutation.isPending && (
              <Loader2 className='mr-2 h-4 w-4 shrink-0 animate-spin' aria-hidden />
            )}
            {mutation.isPending
              ? t('categoryProductAddProducts.saving')
              : t('categoryProductAddProducts.save')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
