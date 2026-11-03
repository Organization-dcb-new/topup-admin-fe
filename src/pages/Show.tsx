import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Clapperboard, EyeOff, Gamepad2, ListPlus, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { DangerDialog } from '@/components/Auth/DangerDialog'
import { hudEyebrowClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { ShowFormDialog } from '@/components/Show/ShowFormDialog'
import { ShowGamesDialog } from '@/components/Show/ShowGamesDialog'
import { SHOW_BADGES, type ShowBadgeKey } from '@/components/Show/show-flags'
import { Switch } from '@/components/ui/switch'
import { PERM } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { toUpdatePayload, useDeleteShow, useGetShows, useUpdateShow } from '@/hooks/useShow'
import { cn } from '@/lib/utils'
import type { Show } from '@/types/show'

const iconButtonClass =
  'grid size-8 shrink-0 place-items-center text-slate-400 hud-clip-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'

export default function ShowPage() {
  const { t } = useTranslation('common')
  const { data, isLoading, isError, isFetching, refetch } = useGetShows()
  const deleteShow = useDeleteShow()
  const shows = data?.data ?? []
  const [formTarget, setFormTarget] = useState<Show | 'new' | null>(null)
  const [gamesTarget, setGamesTarget] = useState<Show | null>(null)
  const [toDelete, setToDelete] = useState<Show | null>(null)
  const visibleCount = shows.filter((s) => s.is_show).length

  const openCreate = () => setFormTarget('new')

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('showPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('showPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('showPage.subtitle')}</p>
          </div>
          <div className='flex shrink-0 items-center gap-3'>
            {data && (
              <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
                {t('showPage.total', { visible: visibleCount, count: shows.length })}
              </span>
            )}
            <Can permission={PERM.showCreate}>
              <button type='button' onClick={openCreate} className={hudPrimaryButtonClass}>
                <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
                <Plus className='size-4' aria-hidden />
                {t('showPage.addBtn')}
              </button>
            </Can>
          </div>
        </header>

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('showPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('showPage.retry')}
            </button>
          </div>
        )}

        {!isError && !isLoading && shows.length === 0 ? (
          <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center animate-in fade-in duration-500'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              <Clapperboard className='size-6' aria-hidden />
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>{t('showPage.emptyTitle')}</h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>{t('showPage.emptyBody')}</p>
            <Can permission={PERM.showCreate}>
              <button type='button' onClick={openCreate} className={`${hudPrimaryButtonClass} mt-6`}>
                <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
                <Plus className='size-4' aria-hidden />
                {t('showPage.addBtn')}
              </button>
            </Can>
          </div>
        ) : (
          <ul className='grid gap-5 lg:grid-cols-2' aria-busy={isFetching}>
            {isLoading &&
              Array.from({ length: 4 }, (_, i) => (
                <li key={i} className='h-60 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />
              ))}
            {shows.map((show, index) => (
              <ShowCard
                key={show.id}
                show={show}
                order={index}
                onEdit={() => setFormTarget(show)}
                onGames={() => setGamesTarget(show)}
                onDelete={() => setToDelete(show)}
              />
            ))}
          </ul>
        )}
      </div>

      <ShowFormDialog
        open={formTarget !== null}
        onOpenChange={(open) => !open && setFormTarget(null)}
        show={formTarget === 'new' ? undefined : (formTarget ?? undefined)}
      />
      <ShowGamesDialog show={gamesTarget} shows={shows} onOpenChange={(open) => !open && setGamesTarget(null)} />
      <DangerDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        eyebrow={t('showPage.deleteConfirm.eyebrow')}
        title={t('showPage.deleteConfirm.title', { name: toDelete?.name ?? '' })}
        description={t('showPage.deleteConfirm.description', { count: toDelete?.games?.length ?? 0 })}
        confirmLabel={t('showPage.deleteConfirm.confirm')}
        cancelLabel={t('showPage.deleteConfirm.cancel')}
        pending={deleteShow.isPending}
        onConfirm={() => {
          if (!toDelete) return
          deleteShow.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })
        }}
      />
    </DashboardLayout>
  )
}

interface ShowCardProps {
  show: Show
  order: number
  onEdit: () => void
  onGames: () => void
  onDelete: () => void
}

function ShowCard({ show, order, onEdit, onGames, onDelete }: ShowCardProps) {
  const { t } = useTranslation('common')
  const { can } = usePermissions()
  const canUpdate = can(PERM.showUpdate)
  const update = useUpdateShow(undefined, 'showPage.toasts.flagsSaved')
  const games = show.games ?? []
  const [imageFailed, setImageFailed] = useState(false)

  const setFlag = (key: ShowBadgeKey | 'is_show', value: boolean) =>
    update.mutate({ id: show.id, payload: { ...toUpdatePayload(show), [key]: value } })

  return (
    <li
      className='min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'
      style={{ animationDelay: `${order * 50}ms` }}
    >
      <div className='h-full bg-slate-200/80 p-px transition-colors duration-300 hud-clip hover:bg-brand-purple/40'>
        <article className='flex h-full flex-col bg-white hud-clip'>
          <div
            className={cn('h-1 transition-colors duration-300', show.is_show ? 'bg-linear-to-r from-brand-purple to-brand-cyan' : 'bg-slate-200')}
            aria-hidden
          />
          <div className='flex flex-1 flex-col gap-4 p-5'>
            <div className='flex items-start gap-4'>
              <span className='grid size-16 shrink-0 place-items-center overflow-hidden bg-slate-50 ring-1 ring-inset ring-slate-200 hud-clip-sm'>
                {show.image && !imageFailed ? (
                  <img src={show.image} alt='' className='size-full object-contain p-1.5' onError={() => setImageFailed(true)} />
                ) : (
                  <Clapperboard className='size-6 text-slate-300' aria-hidden />
                )}
              </span>
              <div className='min-w-0 flex-1 space-y-1'>
                <h2 className={cn('truncate font-display text-lg font-bold', show.is_show ? 'text-slate-900' : 'text-slate-500')}>
                  {show.name}
                </h2>
                <p className='truncate font-mono text-xs text-slate-400'>{show.alias}</p>
                {!show.is_show && (
                  <span className='inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 hud-clip-sm'>
                    <EyeOff className='size-3' aria-hidden />
                    {t('showPage.hidden')}
                  </span>
                )}
              </div>
              {canUpdate && (
                <label className='flex shrink-0 cursor-pointer items-center gap-2 text-xs font-medium text-slate-500'>
                  <span className='hidden sm:inline'>{t('showPage.flags.is_show')}</span>
                  <Switch
                    checked={show.is_show}
                    disabled={update.isPending}
                    onCheckedChange={(checked) => setFlag('is_show', checked)}
                    aria-label={t('showPage.toggleVisible', { name: show.name })}
                    className='data-[state=checked]:bg-emerald-500'
                  />
                </label>
              )}
            </div>

            <div className='flex flex-wrap gap-1.5'>
              {SHOW_BADGES.map(({ key, icon: Icon, on }) => {
                const active = show[key]
                const label = t(`showPage.flags.${key}`)
                const chip = cn(
                  'inline-flex items-center gap-1 px-2 py-1 font-display text-[10px] font-semibold uppercase tracking-[0.12em] ring-1 ring-inset hud-clip-sm transition-colors',
                  active ? on : 'bg-white text-slate-400 ring-slate-200'
                )
                return canUpdate ? (
                  <button
                    key={key}
                    type='button'
                    aria-pressed={active}
                    disabled={update.isPending}
                    onClick={() => setFlag(key, !active)}
                    title={t('showPage.toggleBadge', { badge: label })}
                    className={cn(chip, !active && 'hover:text-slate-700 hover:ring-slate-300', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-60')}
                  >
                    <Icon className='size-3' aria-hidden />
                    {label}
                  </button>
                ) : (
                  active && (
                    <span key={key} className={chip}>
                      <Icon className='size-3' aria-hidden />
                      {label}
                    </span>
                  )
                )
              })}
            </div>

            <div className='rounded-lg border border-slate-200 px-4 py-3'>
              <div className='flex items-center justify-between gap-3'>
                <div className='flex min-w-0 items-center gap-3'>
                  {games.length > 0 ? (
                    <div className='flex shrink-0 -space-x-2'>
                      {games.slice(0, 3).map((g) => (
                        <span
                          key={g.id}
                          className='grid size-8 place-items-center overflow-hidden rounded-full bg-slate-100 ring-2 ring-white'
                          title={g.name}
                        >
                          {g.thumbnail_url ? (
                            <img src={g.thumbnail_url} alt='' className='size-full object-cover' />
                          ) : (
                            <Gamepad2 className='size-3.5 text-slate-400' aria-hidden />
                          )}
                        </span>
                      ))}
                      {games.length > 3 && (
                        <span className='grid size-8 place-items-center rounded-full bg-slate-900 text-[10px] font-semibold text-white ring-2 ring-white'>
                          +{games.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className='grid size-8 shrink-0 place-items-center rounded-full border border-dashed border-slate-300 text-slate-300'>
                      <Gamepad2 className='size-3.5' aria-hidden />
                    </span>
                  )}
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold text-slate-800'>{t('showPage.gameCount', { count: games.length })}</p>
                    <p className='truncate text-xs text-slate-500'>
                      {games.length ? games.map((g) => g.name).join(', ') : t('showPage.noGames')}
                    </p>
                  </div>
                </div>
                <Can permission={PERM.showUpdate}>
                  <button
                    type='button'
                    onClick={onGames}
                    className='inline-flex h-8 shrink-0 items-center gap-1.5 px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-purple hud-clip-sm transition-colors hover:bg-brand-purple/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40'
                  >
                    <ListPlus className='size-3.5' aria-hidden />
                    {t('showPage.manageGames')}
                  </button>
                </Can>
              </div>
            </div>

            <div className='mt-auto flex items-center justify-end gap-0.5 border-t border-slate-100 pt-3'>
              <Can permission={PERM.showUpdate}>
                <button
                  type='button'
                  onClick={onEdit}
                  aria-label={t('showPage.editBtn', { name: show.name })}
                  title={t('showPage.editBtn', { name: show.name })}
                  className={`${iconButtonClass} hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:ring-brand-purple/40`}
                >
                  <Pencil className='size-4' aria-hidden />
                </button>
              </Can>
              <Can permission={PERM.showDelete}>
                <button
                  type='button'
                  onClick={onDelete}
                  aria-label={t('showPage.deleteBtn', { name: show.name })}
                  title={t('showPage.deleteBtn', { name: show.name })}
                  className={`${iconButtonClass} hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-rose-500/30`}
                >
                  <Trash2 className='size-4' aria-hidden />
                </button>
              </Can>
            </div>
          </div>
        </article>
      </div>
    </li>
  )
}
