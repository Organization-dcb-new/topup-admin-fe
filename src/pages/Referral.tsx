import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import { DataTable } from '@/components/Layout/table-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  useCreateReferralCode,
  useDeleteReferralCode,
  useGetReferralCodes,
  useUpdateReferralCode,
} from '@/hooks/useReferral'
import { referralCodeSchema, type ReferralCodeFormValues } from '@/schemas/referral'
import type { ReferralCode } from '@/types/referral'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertCircle, CheckCircle2, Loader2, Percent, Plus, Trash2, Edit } from 'lucide-react'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function ReferralPage() {
  const { t } = useTranslation('common')
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetReferralCodes({
    page,
    limit,
  })

  // Mutations
  const { mutate: deleteMutate } = useDeleteReferralCode()
  const { mutate: updateMutate } = useUpdateReferralCode()

  // Modal open states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingReferral, setEditingReferral] = useState<ReferralCode | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(t('referralPage.toastSuccess') || 'Data loaded successfully')
    }
    if (isError && isFetchedAfterMount) {
      toast.error(t('referralPage.toastError') || 'Failed to load data')
    }
  }, [isSuccess, isError, isFetchedAfterMount, t])

  const handleToggleStatus = useCallback((referral: ReferralCode) => {
    updateMutate({
      id: referral.id,
      payload: { is_active: !referral.is_active },
    })
  }, [updateMutate])

  const handleDelete = (id: string) => {
    deleteMutate(id, {
      onSuccess: () => {
        setDeletingId(null)
      },
    })
  }

  // React Table Columns
  const columns = useMemo<ColumnDef<ReferralCode>[]>(() => {
    return [
      {
        accessorKey: 'name',
        header: t('referralPage.table.name'),
        cell: ({ row }) => (
          <Link
            to={`/referral-codes/${row.original.id}`}
            className='font-semibold text-primary hover:underline transition-all duration-200'
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: 'code',
        header: t('referralPage.table.code'),
        cell: ({ row }) => (
          <code className='rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border border-slate-200'>
            {row.original.code}
          </code>
        ),
      },
      {
        accessorKey: 'percent',
        header: t('referralPage.table.percent'),
        cell: ({ row }) => <span className='font-semibold text-slate-700'>{row.original.percent}%</span>,
      },
      {
        accessorKey: 'is_active',
        header: t('referralPage.table.status'),
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Switch
              checked={row.original.is_active}
              onCheckedChange={() => handleToggleStatus(row.original)}
              aria-label={t('referralPage.form.statusLabel')}
            />
            <span className='text-xs font-medium text-slate-500'>
              {row.original.is_active ? t('referralPage.statusActive') : t('referralPage.statusInactive')}
            </span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: t('referralPage.table.actions'),
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 w-8 p-0 border-slate-200 hover:bg-slate-50'
              onClick={() => setEditingReferral(row.original)}
              title={t('referralPage.editBtn')}
            >
              <Edit className='h-4 w-4 text-slate-600' />
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 w-8 p-0 border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-rose-600'
              onClick={() => setDeletingId(row.original.id)}
              title={t('referralPage.deleteBtn')}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        ),
      },
    ]
  }, [t, handleToggleStatus])

  const rows = data?.data ?? []
  const meta = data?.meta

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        {/* Page Header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex gap-3'>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <Percent className='h-5 w-5' aria-hidden />
            </div>
            <div className='min-w-0 space-y-1'>
              <h1 className='text-2xl font-semibold tracking-tight text-gray-900'>{t('referralPage.title')}</h1>
              <p className='text-sm text-muted-foreground'>{t('referralPage.subtitle')}</p>
            </div>
          </div>

          <div className='flex flex-col items-end gap-1 sm:text-right'>
            {isLoading && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin text-primary' aria-hidden />
                {t('providerPage.loadingShort') || 'Loading…'}
              </p>
            )}
            {isError && (
              <p className='flex items-center gap-2 text-sm font-medium text-destructive'>
                <AlertCircle className='h-4 w-4 shrink-0' aria-hidden />
                {t('providerPage.loadFailedShort') || 'Failed to load'}
              </p>
            )}
            {isSuccess && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <CheckCircle2 className='h-4 w-4 shrink-0 text-emerald-600' aria-hidden />
                <span className='tabular-nums text-foreground'>
                  {t('referralPage.table.totalData') || 'Total'}: {meta?.total_data ?? rows.length}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Content Box */}
        <div className='overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5'>
          <div className='flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
            <div className='min-w-0 space-y-0.5'>
              <h2 className='text-sm font-semibold text-gray-900'>{t('referralPage.title')}</h2>
              <p className='text-xs text-muted-foreground'>
                {t('referralPage.subtitle')}
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <Button
                type='button'
                onClick={() => setIsCreateOpen(true)}
                className='flex items-center gap-1.5 rounded-lg text-sm font-semibold'
              >
                <Plus className='h-4 w-4' />
                {t('referralPage.addBtn')}
              </Button>
            </div>
          </div>

          <div className='p-3 sm:p-4'>
            {isLoading && (
              <div className='flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/80 bg-muted/20 py-12'>
                <Loader2 className='h-11 w-11 animate-spin text-primary' aria-hidden />
              </div>
            )}

            {isError && (
              <ErrorComponent message={t('referralPage.toastError') || 'Failed to load referral codes'} />
            )}

            {isSuccess && (
              <div className='space-y-4'>
                <div className='max-h-[min(70vh,40rem)] overflow-y-auto overflow-x-auto overscroll-contain'>
                  <DataTable
                    columns={columns}
                    data={rows}
                    emptyMessage={t('referralPage.emptyPage') || 'No referral codes registered'}
                  />
                </div>

                {/* Pagination Footer */}
                {meta && meta.total_page > 1 && (
                  <div className='flex items-center justify-between border-t border-slate-100 pt-4 px-1'>
                    <span className='text-xs text-slate-500'>
                      {t('transactionPage.paginationInfo', {
                        page: meta.page,
                        totalPage: meta.total_page,
                      }) || `Page ${meta.page} of ${meta.total_page}`}
                    </span>
                    <div className='flex items-center gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        disabled={meta.page <= 1}
                        onClick={() => setPage((prev) => prev - 1)}
                      >
                        {t('transactionPage.prev') || 'Prev'}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        disabled={meta.page >= meta.total_page}
                        onClick={() => setPage((prev) => prev + 1)}
                      >
                        {t('transactionPage.next') || 'Next'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <CreateReferralDialog open={isCreateOpen} setOpen={setIsCreateOpen} />

      {/* Edit Dialog */}
      {editingReferral && (
        <EditReferralDialog
          referral={editingReferral}
          open={!!editingReferral}
          setOpen={(open) => !open && setEditingReferral(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className='rounded-2xl sm:max-w-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'>
          <DialogHeader>
            <DialogTitle className='font-extrabold text-slate-900 dark:text-white'>
              {t('referralPage.deleteConfirm.title')}
            </DialogTitle>
            <DialogDescription className='text-slate-500 dark:text-slate-400'>
              {t('referralPage.deleteConfirm.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:gap-0 pt-2'>
            <Button
              type='button'
              variant='outline'
              className='rounded-xl border-slate-200 dark:border-zinc-800'
              onClick={() => setDeletingId(null)}
            >
              {t('referralPage.deleteConfirm.cancel')}
            </Button>
            <Button
              type='button'
              variant='destructive'
              className='rounded-xl bg-red-600 hover:bg-red-700 text-white'
              onClick={() => deletingId && handleDelete(deletingId)}
            >
              {t('referralPage.deleteConfirm.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

// Sub-Component: Create Referral Dialog
function CreateReferralDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const { t } = useTranslation('common')
  const { mutate: createMutate, isPending } = useCreateReferralCode(() => setOpen(false))

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReferralCodeFormValues>({
    resolver: zodResolver(referralCodeSchema) as unknown as Resolver<ReferralCodeFormValues>,
    defaultValues: {
      name: '',
      code: '',
      percent: 0,
      is_active: true,
    },
  })

  // Watch status toggle value
  const isActive = watch('is_active')

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const onSubmit = (values: ReferralCodeFormValues) => {
    createMutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='rounded-2xl sm:max-w-md border border-slate-200 bg-white'>
        <DialogHeader>
          <DialogTitle className='font-extrabold text-slate-900'>{t('referralPage.form.addTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-2'>
          <div className='space-y-1.5'>
            <Label htmlFor='create-name'>{t('referralPage.form.nameLabel')}</Label>
            <Input
              id='create-name'
              placeholder={t('referralPage.form.namePlaceholder')}
              {...register('name')}
            />
            {errors.name?.message && <p className='text-xs text-rose-500 font-medium'>{t(errors.name.message)}</p>}
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='create-code'>{t('referralPage.form.codeLabel')}</Label>
            <Input
              id='create-code'
              placeholder={t('referralPage.form.codePlaceholder')}
              {...register('code')}
            />
            {errors.code?.message && <p className='text-xs text-rose-500 font-medium'>{t(errors.code.message)}</p>}
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='create-percent'>{t('referralPage.form.percentLabel')}</Label>
            <Input
              id='create-percent'
              type='number'
              step='any'
              placeholder={t('referralPage.form.percentPlaceholder')}
              {...register('percent', { valueAsNumber: true })}
            />
            {errors.percent?.message && <p className='text-xs text-rose-500 font-medium'>{t(errors.percent.message)}</p>}
          </div>

          <div className='flex items-center justify-between py-1.5'>
            <Label htmlFor='create-status' className='cursor-pointer'>
              {t('referralPage.form.statusLabel')}
            </Label>
            <Switch
              id='create-status'
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
          </div>

          <DialogFooter className='gap-2 sm:gap-0 pt-4'>
            <Button
              type='button'
              variant='outline'
              className='rounded-xl border-slate-200'
              onClick={() => setOpen(false)}
            >
              {t('referralPage.form.cancel')}
            </Button>
            <Button
              type='submit'
              className='rounded-xl'
              disabled={isPending}
            >
              {isPending && <Loader2 className='mr-1.5 h-4 w-4 animate-spin' />}
              {t('referralPage.form.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Sub-Component: Edit Referral Dialog
function EditReferralDialog({
  referral,
  open,
  setOpen,
}: {
  referral: ReferralCode
  open: boolean;
  setOpen: (open: boolean) => void
}) {
  const { t } = useTranslation('common')
  const { mutate: updateMutate, isPending } = useUpdateReferralCode(() => setOpen(false))

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReferralCodeFormValues>({
    resolver: zodResolver(referralCodeSchema) as unknown as Resolver<ReferralCodeFormValues>,
    defaultValues: {
      name: referral.name,
      code: referral.code,
      percent: referral.percent,
      is_active: referral.is_active,
    },
  })

  // Watch status toggle value
  const isActive = watch('is_active')

  useEffect(() => {
    reset({
      name: referral.name,
      code: referral.code,
      percent: referral.percent,
      is_active: referral.is_active,
    })
  }, [referral, open, reset])

  const onSubmit = (values: ReferralCodeFormValues) => {
    updateMutate({
      id: referral.id,
      payload: values,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='rounded-2xl sm:max-w-md border border-slate-200 bg-white'>
        <DialogHeader>
          <DialogTitle className='font-extrabold text-slate-900'>{t('referralPage.form.editTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-2'>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-name'>{t('referralPage.form.nameLabel')}</Label>
            <Input
              id='edit-name'
              placeholder={t('referralPage.form.namePlaceholder')}
              {...register('name')}
            />
            {errors.name?.message && <p className='text-xs text-rose-500 font-medium'>{t(errors.name.message)}</p>}
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='edit-code'>{t('referralPage.form.codeLabel')}</Label>
            <Input
              id='edit-code'
              placeholder={t('referralPage.form.codePlaceholder')}
              {...register('code')}
            />
            {errors.code?.message && <p className='text-xs text-rose-500 font-medium'>{t(errors.code.message)}</p>}
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='edit-percent'>{t('referralPage.form.percentLabel')}</Label>
            <Input
              id='edit-percent'
              type='number'
              step='any'
              placeholder={t('referralPage.form.percentPlaceholder')}
              {...register('percent', { valueAsNumber: true })}
            />
            {errors.percent?.message && <p className='text-xs text-rose-500 font-medium'>{t(errors.percent.message)}</p>}
          </div>

          <div className='flex items-center justify-between py-1.5'>
            <Label htmlFor='edit-status' className='cursor-pointer'>
              {t('referralPage.form.statusLabel')}
            </Label>
            <Switch
              id='edit-status'
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
          </div>

          <DialogFooter className='gap-2 sm:gap-0 pt-4'>
            <Button
              type='button'
              variant='outline'
              className='rounded-xl border-slate-200'
              onClick={() => setOpen(false)}
            >
              {t('referralPage.form.cancel')}
            </Button>
            <Button
              type='submit'
              className='rounded-xl'
              disabled={isPending}
            >
              {isPending && <Loader2 className='mr-1.5 h-4 w-4 animate-spin' />}
              {t('referralPage.form.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
