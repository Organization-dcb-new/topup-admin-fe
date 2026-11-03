import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Pencil, Plus, RefreshCw, Ticket, Trash2 } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { DangerDialog } from '@/components/Auth/DangerDialog'
import { hudEyebrowClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { ReferralFormDialog } from '@/components/Referral/ReferralFormDialog'
import { CopyCodeButton, ReferralStatusToggle, ReferralTicket } from '@/components/Referral/ReferralParts'
import { PERM } from '@/constants/permissions'
import { useDeleteReferralCode, useGetReferralCodes } from '@/hooks/useReferral'
import { parseBackendDate } from '@/lib/backend-datetime'
import type { ReferralCode } from '@/types/referral'
import { useRetained } from '@/hooks/useRetained'

const PAGE_SIZE = 12

const iconButtonClass =
  'grid size-8 place-items-center text-slate-400 hud-clip-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'

export default function ReferralPage() {
  const { t } = useTranslation('common')
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching, refetch } = useGetReferralCodes({ page, limit: PAGE_SIZE })
  const deleteReferral = useDeleteReferralCode()
  // 'new' opens the form empty; a code opens it for editing.
  const [formTarget, setFormTarget] = useState<ReferralCode | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<ReferralCode | null>(null)
  // The confirm dialog keeps naming its target while it animates closed.
  const deleting = useRetained(toDelete)

  const rows = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta?.total_page ?? 1

  const openCreate = () => setFormTarget('new')

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('referralPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>
              {t('referralPage.title')}
            </h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('referralPage.subtitle')}</p>
          </div>
          <div className='flex items-center gap-3'>
            {meta && (
              <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
                {t('referralPage.totalCodes', { count: meta.total_data })}
              </span>
            )}
            <Can permission={PERM.referralCreate}>
              <button type='button' onClick={openCreate} className={hudPrimaryButtonClass}>
                <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
                <Plus className='size-4' aria-hidden />
                {t('referralPage.addBtn')}
              </button>
            </Can>
          </div>
        </header>

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('referralPage.toastError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('referralPage.retry')}
            </button>
          </div>
        )}

        {!isError && !isLoading && rows.length === 0 ? (
          <EmptyState onCreate={openCreate} />
        ) : (
          <ul className='grid gap-5 md:grid-cols-2 xl:grid-cols-3' aria-busy={isFetching}>
            {isLoading &&
              Array.from({ length: 6 }, (_, i) => (
                <li key={i} className='h-60 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />
              ))}
            {rows.map((referral, index) => (
              <ReferralCard
                key={referral.id}
                referral={referral}
                order={index}
                onEdit={() => setFormTarget(referral)}
                onDelete={() => setToDelete(referral)}
              />
            ))}
          </ul>
        )}

        <HudPagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <ReferralFormDialog
        open={formTarget !== null}
        onOpenChange={(open) => !open && setFormTarget(null)}
        referral={formTarget === 'new' ? undefined : (formTarget ?? undefined)}
      />

      <DangerDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        eyebrow={t('referralPage.deleteConfirm.eyebrow')}
        title={t('referralPage.deleteConfirm.title', { code: deleting?.code ?? '' })}
        description={t('referralPage.deleteConfirm.description')}
        confirmLabel={t('referralPage.deleteConfirm.confirm')}
        cancelLabel={t('referralPage.deleteConfirm.cancel')}
        pending={deleteReferral.isPending}
        onConfirm={() => {
          if (!toDelete) return
          deleteReferral.mutate(toDelete.id, {
            onSuccess: () => {
              setToDelete(null)
              // Don't strand the admin on a page that no longer has rows.
              if (rows.length === 1 && page > 1) setPage((p) => p - 1)
            },
          })
        }}
      />
    </DashboardLayout>
  )
}

interface ReferralCardProps {
  referral: ReferralCode
  order: number
  onEdit: () => void
  onDelete: () => void
}

function ReferralCard({ referral, order, onEdit, onDelete }: ReferralCardProps) {
  const { t, i18n } = useTranslation('common')
  const created = parseBackendDate(referral.created_at)

  return (
    <li
      className='animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'
      style={{ animationDelay: `${order * 50}ms` }}
    >
      <div className='h-full bg-slate-200/80 p-px transition-colors duration-300 hud-clip hover:bg-brand-purple/40'>
        <div className='flex h-full flex-col bg-white hud-clip'>
          <div
            className={
              referral.is_active
                ? 'h-1 bg-linear-to-r from-brand-purple to-brand-cyan'
                : 'h-1 bg-slate-200'
            }
            aria-hidden
          />
          <div className='flex flex-1 flex-col gap-4 p-5'>
            <div className='flex items-start justify-between gap-3'>
              <Link
                to={`/referral-codes/${referral.id}`}
                className='min-w-0 truncate font-display text-lg font-bold text-slate-900 transition-colors hover:text-brand-purple'
              >
                {referral.name}
              </Link>
              <ReferralStatusToggle referral={referral} />
            </div>

            <ReferralTicket code={referral.code} percent={referral.percent} active={referral.is_active} />

            <div className='mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-4'>
              <span className='truncate text-xs text-slate-500'>
                {created &&
                  t('referralPage.createdOn', {
                    date: created.toLocaleDateString(i18n.resolvedLanguage, { dateStyle: 'medium' }),
                  })}
              </span>
              <div className='flex shrink-0 items-center gap-0.5'>
                <CopyCodeButton code={referral.code} />
                <Can permission={PERM.referralUpdate}>
                  <button
                    type='button'
                    onClick={onEdit}
                    aria-label={t('referralPage.editBtn')}
                    title={t('referralPage.editBtn')}
                    className={`${iconButtonClass} hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:ring-brand-purple/40`}
                  >
                    <Pencil className='size-4' aria-hidden />
                  </button>
                </Can>
                <Can permission={PERM.referralDelete}>
                  <button
                    type='button'
                    onClick={onDelete}
                    aria-label={t('referralPage.deleteBtn')}
                    title={t('referralPage.deleteBtn')}
                    className={`${iconButtonClass} hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-rose-500/30`}
                  >
                    <Trash2 className='size-4' aria-hidden />
                  </button>
                </Can>
                <Link
                  to={`/referral-codes/${referral.id}`}
                  className='group/link ml-1 inline-flex h-8 items-center gap-1.5 px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-purple hud-clip-sm transition-colors hover:bg-brand-purple/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40'
                >
                  {t('referralPage.view')}
                  <ArrowRight
                    className='size-3.5 transition-transform duration-300 ease-hud group-hover/link:translate-x-0.5'
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  const { t } = useTranslation('common')
  return (
    <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center animate-in fade-in duration-500'>
      <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
        <Ticket className='size-6' aria-hidden />
      </span>
      <h2 className='font-display text-xl font-bold text-slate-900'>{t('referralPage.emptyTitle')}</h2>
      <p className='mt-1 max-w-sm text-sm text-slate-500'>{t('referralPage.emptyBody')}</p>
      <Can permission={PERM.referralCreate}>
        <button type='button' onClick={onCreate} className={`${hudPrimaryButtonClass} mt-6`}>
          <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
          <Plus className='size-4' aria-hidden />
          {t('referralPage.addBtn')}
        </button>
      </Can>
    </div>
  )
}
