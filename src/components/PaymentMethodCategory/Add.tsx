import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Link2, Loader2, Search } from 'lucide-react'

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
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useGetPaymentMethods } from '@/hooks/usePaymentMethod'
import { useAssignPaymentMethods } from '@/hooks/usePaymentMethodCategory'
import { useGetPaymentMethodCategory } from '@/hooks/usePaymentMethodCategory'
import type { PaymentMethod } from '@/types/payment-method'
import { cn } from '@/lib/utils'

interface Props {
  categoryId: string
  categoryName: string
}

/** Endpoint PATCH bersifat REPLACE: metode yang tidak ikut terkirim akan
 *  dilepas dari kategori. Karena itu daftar harus dimuat UTUH sebelum
 *  disimpan — kalau tidak, metode di halaman berikutnya ikut terlepas. */
const FETCH_LIMIT = 200

export function AddPaymentMethodToPaymentCategoryButton({
  categoryId,
  categoryName,
}: Props) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  /** null = belum disentuh user, ikut baseline dari server */
  const [draft, setDraft] = useState<string[] | null>(null)

  const {
    data: paymentMethods,
    isLoading,
    isSuccess,
  } = useGetPaymentMethods(1, FETCH_LIMIT)
  const { data: categoriesData } = useGetPaymentMethodCategory()
  const mutation = useAssignPaymentMethods(categoryId)

  const methods: PaymentMethod[] = useMemo(
    () => paymentMethods?.data ?? [],
    [paymentMethods],
  )
  const totalMethods = paymentMethods?.meta?.total_data ?? methods.length
  /** Daftar tidak lengkap → replace-all tidak aman dilakukan */
  const isTruncated = isSuccess && totalMethods > methods.length

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of categoriesData?.data ?? []) map.set(c.id, c.name)
    return map
  }, [categoriesData])

  // Diturunkan dari data server, bukan disalin sekali saat dialog dibuka —
  // penyebab lama daftar centang kosong ketika cache belum terisi
  const baseline = useMemo(
    () => methods.filter((m) => m.category_id === categoryId).map((m) => m.id),
    [methods, categoryId],
  )
  const selected = draft ?? baseline
  const selectedSet = useMemo(() => new Set(selected), [selected])
  const baselineSet = useMemo(() => new Set(baseline), [baseline])

  const toggle = (id: string) => {
    setDraft((prev) => {
      const base = prev ?? baseline
      return base.includes(id)
        ? base.filter((x) => x !== id)
        : [...base, id]
    })
  }

  const visibleMethods = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return methods
    return methods.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.code.toLowerCase().includes(term),
    )
  }, [methods, query])

  // Ringkasan dampak: operator berhak tahu apa yang akan berubah
  const toAdd = selected.filter((id) => !baselineSet.has(id))
  const toRemove = baseline.filter((id) => !selectedSet.has(id))
  const stolen = methods.filter(
    (m) =>
      selectedSet.has(m.id) &&
      !!m.category_id &&
      m.category_id !== categoryId,
  )
  const hasChanges = toAdd.length > 0 || toRemove.length > 0

  const close = () => {
    setOpen(false)
    setDraft(null)
    setQuery('')
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (mutation.isPending) return
        if (next) setOpen(true)
        else close()
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          type='button'
          className='h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground'
          aria-label={t('paymentCategoryAssign.trigger', { name: categoryName })}
          title={t('paymentCategoryAssign.triggerShort')}
        >
          <Link2 className='h-4 w-4' aria-hidden />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className='rounded-xl sm:max-w-lg'>
        <AlertDialogHeader className='space-y-1 text-left'>
          <AlertDialogTitle className='text-lg font-semibold tracking-tight'>
            {t('paymentCategoryAssign.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('paymentCategoryAssign.description', { name: categoryName })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isTruncated && (
          <div
            role='alert'
            className='flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3'
          >
            <AlertTriangle
              className='mt-0.5 h-4 w-4 shrink-0 text-destructive'
              aria-hidden
            />
            <p className='min-w-0 text-sm text-destructive'>
              {t('paymentCategoryAssign.truncatedWarning', {
                shown: methods.length,
                total: totalMethods,
              })}
            </p>
          </div>
        )}

        <div className='relative'>
          <Search
            className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground'
            aria-hidden
          />
          <Input
            type='search'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('paymentCategoryAssign.searchPlaceholder')}
            aria-label={t('paymentCategoryAssign.searchPlaceholder')}
            className='h-9 pl-9'
            disabled={isLoading || mutation.isPending}
          />
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
                {t('paymentCategoryAssign.loading')}
              </p>
            </div>
          ) : visibleMethods.length === 0 ? (
            <p className='py-8 text-center text-sm text-muted-foreground'>
              {query.trim()
                ? t('paymentCategoryAssign.noMatch')
                : t('paymentCategoryAssign.empty')}
            </p>
          ) : (
            visibleMethods.map((method) => {
              const otherCategory =
                method.category_id && method.category_id !== categoryId
                  ? categoryNameById.get(method.category_id)
                  : null
              return (
                <label
                  key={method.id}
                  htmlFor={`pm-assign-${categoryId}-${method.id}`}
                  className='flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors duration-200 hover:bg-muted'
                >
                  <Checkbox
                    id={`pm-assign-${categoryId}-${method.id}`}
                    checked={selectedSet.has(method.id)}
                    onCheckedChange={() => toggle(method.id)}
                    disabled={mutation.isPending}
                  />
                  <span className='min-w-0 flex-1 truncate text-sm font-medium text-foreground'>
                    {method.name}
                  </span>
                  {otherCategory && (
                    <span className='shrink-0 rounded-full border border-warning/35 bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold text-warning'>
                      {otherCategory}
                    </span>
                  )}
                </label>
              )
            })
          )}
        </div>

        {/* Konfirmasi eksplisit: simpan bersifat mengganti seluruh isi kategori */}
        {(hasChanges || stolen.length > 0) && (
          <ul className='space-y-1 rounded-lg border border-border bg-muted/30 p-2.5 text-xs'>
            {toAdd.length > 0 && (
              <li className='text-success'>
                {t('paymentCategoryAssign.summaryAdd', { total: toAdd.length })}
              </li>
            )}
            {toRemove.length > 0 && (
              <li className='font-medium text-destructive'>
                {t('paymentCategoryAssign.summaryRemove', {
                  total: toRemove.length,
                })}
              </li>
            )}
            {stolen.length > 0 && (
              <li className='text-warning'>
                {t('paymentCategoryAssign.summaryMove', {
                  total: stolen.length,
                })}
              </li>
            )}
          </ul>
        )}

        <AlertDialogFooter className='gap-2 sm:gap-2'>
          <AlertDialogCancel
            className='rounded-lg'
            type='button'
            disabled={mutation.isPending}
          >
            {t('paymentCategoryAssign.cancel')}
          </AlertDialogCancel>
          <Button
            type='button'
            className={cn('rounded-lg font-semibold', toRemove.length > 0 && 'bg-destructive text-white hover:bg-destructive/90')}
            onClick={() => mutation.mutate(selected, { onSuccess: close })}
            // Tidak bisa disimpan sebelum daftar lengkap termuat
            disabled={
              mutation.isPending || !isSuccess || isTruncated || !hasChanges
            }
          >
            {mutation.isPending ? (
              <span className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                {t('paymentCategoryAssign.saving')}
              </span>
            ) : (
              t('paymentCategoryAssign.save')
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
