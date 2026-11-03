import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Gamepad2, Keyboard, Pencil, RefreshCw, Search } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { hudEyebrowClass, hudInputClass } from '@/components/Auth/hud-styles'
import { GameInputsDialog } from '@/components/Inputs/GameInputsDialog'
import { InputPreview } from '@/components/Inputs/GameInputParts'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { Input } from '@/components/ui/input'
import { PERM } from '@/constants/permissions'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetGameInputs } from '@/hooks/useGameInput'
import { cn } from '@/lib/utils'
import type { GameWithInputs } from '@/types/game-input'

const PAGE_SIZE = 12

export default function InputPages() {
  const { t, i18n } = useTranslation('common')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<GameWithInputs | null>(null)
  const debouncedSearch = useDebounce(search.trim(), 350)

  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = useGetGameInputs(debouncedSearch, page, PAGE_SIZE)
  const games = data?.data ?? []
  const total = data?.meta?.total_data

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('inputPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('inputPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('inputPage.subtitle')}</p>
          </div>
          {total !== undefined && (
            <span className='shrink-0 font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
              {t('inputPage.total', { count: total, formatted: total.toLocaleString(i18n.resolvedLanguage) })}
            </span>
          )}
        </header>

        <div className='group relative max-w-sm'>
          <span className='pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400 group-focus-within:text-brand-purple'>
            <Search className='size-4' aria-hidden />
          </span>
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder={t('inputPage.searchPlaceholder')}
            aria-label={t('inputPage.searchPlaceholder')}
            className={cn(hudInputClass, 'bg-white pl-11')}
          />
        </div>

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('inputPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('inputPage.retry')}
            </button>
          </div>
        )}

        {!isError && !isLoading && games.length === 0 ? (
          <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              <Keyboard className='size-6' aria-hidden />
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>
              {debouncedSearch ? t('inputPage.noMatchTitle') : t('inputPage.emptyTitle')}
            </h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>
              {debouncedSearch ? t('inputPage.noMatchBody') : t('inputPage.emptyBody')}
            </p>
          </div>
        ) : (
          <ul
            className={cn('grid gap-5 md:grid-cols-2 xl:grid-cols-3 transition-opacity duration-300', isPlaceholderData && 'opacity-60')}
            aria-busy={isFetching}
          >
            {isLoading && Array.from({ length: 6 }, (_, i) => <li key={i} className='h-64 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />)}
            {games.map((game, index) => (
              <GameCard key={game.id} game={game} order={index} onEdit={() => setEditing(game)} />
            ))}
          </ul>
        )}

        <HudPagination page={page} totalPages={data?.meta?.total_page ?? 1} onChange={setPage} />
      </div>

      <GameInputsDialog game={editing} onOpenChange={(open) => !open && setEditing(null)} />
    </DashboardLayout>
  )
}

function GameCard({ game, order, onEdit }: { game: GameWithInputs; order: number; onEdit: () => void }) {
  const { t } = useTranslation('common')
  const [imageFailed, setImageFailed] = useState(false)
  const inputs = [...game.inputs].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <li className='min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both' style={{ animationDelay: `${order * 40}ms` }}>
      <div className='h-full bg-slate-200/80 p-px transition-colors duration-300 hud-clip hover:bg-brand-purple/40'>
        <article className='flex h-full flex-col bg-white hud-clip'>
          <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
          <div className='flex flex-1 flex-col gap-4 p-5'>
            <div className='flex items-center gap-3'>
              <span className='grid size-11 shrink-0 place-items-center overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200'>
                {game.image && !imageFailed ? (
                  <img src={game.image} alt='' className='size-full object-cover' onError={() => setImageFailed(true)} />
                ) : (
                  <Gamepad2 className='size-5 text-slate-300' aria-hidden />
                )}
              </span>
              <div className='min-w-0 flex-1'>
                <h2 className='truncate font-display text-base font-bold text-slate-900'>{game.game_name}</h2>
                <p className='text-xs text-slate-500'>{t('inputPage.fieldCount', { count: inputs.length })}</p>
              </div>
              <Can permission={PERM.gameInputUpdate}>
                <button
                  type='button'
                  onClick={onEdit}
                  disabled={inputs.length === 0}
                  aria-label={t('inputPage.editBtn', { name: game.game_name })}
                  title={t('inputPage.editBtn', { name: game.game_name })}
                  className='grid size-8 shrink-0 place-items-center text-slate-400 hud-clip-sm transition-colors hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40 disabled:opacity-40'
                >
                  <Pencil className='size-4' aria-hidden />
                </button>
              </Can>
            </div>

            <div className='flex-1 rounded-lg border border-slate-200 bg-white p-3'>
              <p className='mb-2.5 font-display text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{t('inputPage.storefrontPreview')}</p>
              {inputs.length ? (
                <div className='space-y-2.5'>
                  {inputs.map((input) => (
                    <InputPreview key={input.id} input={input} />
                  ))}
                </div>
              ) : (
                <p className='py-3 text-center text-xs text-slate-400'>{t('inputPage.noFields')}</p>
              )}
            </div>
          </div>
        </article>
      </div>
    </li>
  )
}
