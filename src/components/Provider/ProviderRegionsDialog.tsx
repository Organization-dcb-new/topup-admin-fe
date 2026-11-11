import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, CircleAlert, Globe, Loader2, RefreshCw, Search } from 'lucide-react'

import { hudEyebrowClass, hudInputClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { PERM } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { useProviderRegions, useUpdateProviderRegions } from '@/hooks/useProvider'
import { useRetained } from '@/hooks/useRetained'
import { useStartProviderSync } from '@/hooks/useSupplierCatalog'
import { HOME_REGION, regionName } from '@/lib/regions'
import { cn } from '@/lib/utils'
import type { Provider, ProviderRegion } from '@/types/provider'

interface ProviderRegionsDialogProps {
  /** The provider whose countries are edited; the dialog is open while one is set. */
  provider: Provider | null
  onClose: () => void
}

/**
 * The countries a per-country supplier's catalog sync pulls, as a checklist instead of the
 * config's "regions" JSON. Saving changes that key only.
 */
export function ProviderRegionsDialog({ provider, onClose }: ProviderRegionsDialogProps) {
  const target = useRetained(provider)
  return (
    <Dialog open={provider !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className='flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg'
      >
        <div className='h-1 shrink-0 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {target && <RegionsPicker key={target.id} provider={target} onDone={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

function RegionsPicker({ provider, onDone }: { provider: Provider; onDone: () => void }) {
  const { t, i18n } = useTranslation('common')
  const { can } = usePermissions()
  const regionsQuery = useProviderRegions(provider.id)
  const regions: ProviderRegion[] = useMemo(() => regionsQuery.data?.regions ?? [], [regionsQuery.data])
  const original = useMemo(() => new Set(regions.filter((r) => r.synced).map((r) => r.code)), [regions])
  // Null until the admin ticks something: the saved list is the starting point once it loads.
  const [picked, setPicked] = useState<Set<string> | null>(null)
  const selected = picked ?? original
  const [search, setSearch] = useState('')
  // Countries added by the last save: they fill in on the next catalog sync.
  const [added, setAdded] = useState<string[] | null>(null)
  const update = useUpdateProviderRegions((saved) => {
    const before = original
    setAdded(saved.regions.filter((r) => r.synced && !before.has(r.code)).map((r) => r.code))
  })
  const sync = useStartProviderSync(provider.id)

  const lang = i18n.resolvedLanguage
  const query = search.trim().toLowerCase()
  const visible = query
    ? regions.filter((r) => r.code.includes(query) || regionName(r.code, lang).toLowerCase().includes(query) || r.currency.toLowerCase().includes(query))
    : regions
  const unchanged = selected.size === original.size && [...selected].every((code) => original.has(code))

  const toggle = (code: string) => {
    const next = new Set(selected)
    if (next.has(code)) next.delete(code)
    else next.add(code)
    setPicked(next)
  }

  if (added !== null) {
    return (
      <SavedState
        provider={provider}
        added={added}
        canSync={can(PERM.gameSync)}
        syncing={sync.isPending}
        onSync={() => sync.mutate(undefined, { onSuccess: onDone })}
        onClose={onDone}
      />
    )
  }

  return (
    <>
      <div className='shrink-0 space-y-4 p-6 pb-4 sm:p-7 sm:pb-4'>
        <div className='space-y-1'>
          <p className={hudEyebrowClass}>{t('providerPage.regions.eyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {t('providerPage.regions.title', { name: provider.name })}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>{t('providerPage.regions.description')}</DialogDescription>
        </div>
        <div className='group relative'>
          <span className='pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400 group-focus-within:text-brand-purple'>
            <Search className='size-4' aria-hidden />
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('providerPage.regions.searchPlaceholder')}
            aria-label={t('providerPage.regions.searchPlaceholder')}
            autoComplete='off'
            className={cn(hudInputClass, 'pl-11')}
          />
        </div>
        <p className='text-xs text-slate-500'>{t('providerPage.regions.selected', { count: selected.size })}</p>
      </div>

      <ul className='min-h-40 flex-1 overflow-y-auto border-y border-slate-100 px-3 py-2 sm:px-4' aria-label={t('providerPage.regions.listLabel')}>
        {regionsQuery.isLoading ? (
          <li className='flex items-center justify-center gap-2 py-10 text-sm text-slate-500'>
            <Loader2 className='size-4 animate-spin' aria-hidden />
            {t('providerPage.regions.loading')}
          </li>
        ) : regionsQuery.isError ? (
          <li className='space-y-3 py-10 text-center text-sm text-slate-500'>
            <p>{t('providerPage.regions.loadError')}</p>
            <button
              type='button'
              onClick={() => void regionsQuery.refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('providerPage.retry')}
            </button>
          </li>
        ) : visible.length === 0 ? (
          <li className='py-10 text-center text-sm text-slate-500'>{t('providerPage.regions.noMatch')}</li>
        ) : (
          visible.map((region) => (
            <RegionRow key={region.code} region={region} checked={selected.has(region.code)} lang={lang} onToggle={() => toggle(region.code)} />
          ))
        )}
      </ul>

      <div className='shrink-0 space-y-3 p-6 pt-4 sm:p-7 sm:pt-4'>
        {regions.length > 0 && !selected.has(HOME_REGION) && (
          <p className='flex items-start gap-2 text-xs leading-relaxed text-amber-700'>
            <CircleAlert className='mt-0.5 size-3.5 shrink-0' aria-hidden />
            {t('providerPage.regions.homeOff', { name: regionName(HOME_REGION, lang) })}
          </p>
        )}
        <p className='text-xs leading-relaxed text-slate-500'>{t('providerPage.regions.hint')}</p>
        <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <button
            type='button'
            onClick={onDone}
            disabled={update.isPending}
            className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
          >
            {t('providerPage.form.cancel')}
          </button>
          <button
            type='button'
            onClick={() => update.mutate({ id: provider.id, regions: [...selected] })}
            disabled={unchanged || selected.size === 0 || update.isPending}
            className={cn(hudPrimaryButtonClass, 'justify-center disabled:pointer-events-none sm:min-w-52')}
          >
            <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
            {update.isPending && <Loader2 className='size-4 animate-spin' aria-hidden />}
            {update.isPending ? t('providerPage.form.saving') : t('providerPage.form.save')}
          </button>
        </div>
      </div>
    </>
  )
}

function RegionRow({ region, checked, lang, onToggle }: { region: ProviderRegion; checked: boolean; lang?: string; onToggle: () => void }) {
  const { t } = useTranslation('common')
  return (
    <li>
      <label
        className={cn(
          'relative flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-purple/40',
          checked ? 'bg-brand-purple/[0.06]' : 'hover:bg-slate-50'
        )}
      >
        {/* relative on the label keeps this absolutely placed input inside its row: focusing it then
            scrolls the list, not the whole dialog. */}
        <input type='checkbox' checked={checked} onChange={onToggle} className='sr-only' />
        <span
          className={cn(
            'grid size-5 shrink-0 place-items-center rounded border transition-colors',
            checked ? 'border-brand-purple bg-brand-purple text-white' : 'border-slate-300 bg-white'
          )}
          aria-hidden
        >
          {checked && <Check className='size-3.5' strokeWidth={3} />}
        </span>
        <span className='w-7 shrink-0 font-mono text-xs font-semibold uppercase text-slate-500'>{region.code}</span>
        <span className='min-w-0 flex-1'>
          <span className='block truncate text-sm text-slate-800'>{regionName(region.code, lang)}</span>
          <span className='block text-xs text-slate-400'>{region.currency}</span>
        </span>
        <span className='shrink-0 text-right text-xs text-slate-500'>
          {region.brands > 0 ? (
            <>
              <span className='block'>{t('providerPage.regions.brands', { count: region.brands })}</span>
              <span className='block text-slate-400'>{t('providerPage.regions.listedGames', { count: region.listed_games })}</span>
            </>
          ) : (
            <span className='text-slate-400'>{t('providerPage.regions.notSynced')}</span>
          )}
        </span>
      </label>
    </li>
  )
}

interface SavedStateProps {
  provider: Provider
  added: string[]
  canSync: boolean
  syncing: boolean
  onSync: () => void
  onClose: () => void
}

/** After saving: countries just added are empty until the next catalog sync, which can start here. */
function SavedState({ provider, added, canSync, syncing, onSync, onClose }: SavedStateProps) {
  const { t, i18n } = useTranslation('common')
  const names = added.map((code) => regionName(code, i18n.resolvedLanguage)).join(', ')
  return (
    <div className='space-y-5 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <Globe className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{t('providerPage.regions.eyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {t('providerPage.regions.savedTitle')}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>
            {added.length > 0 ? t('providerPage.regions.savedAdded', { names, name: provider.name }) : t('providerPage.regions.savedNoNew')}
          </DialogDescription>
        </div>
      </div>
      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onClose}
          disabled={syncing}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('providerPage.regions.close')}
        </button>
        {added.length > 0 && canSync && (
          <button type='button' onClick={onSync} disabled={syncing} className={cn(hudPrimaryButtonClass, 'justify-center sm:min-w-52')}>
            <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
            {syncing ? <Loader2 className='size-4 animate-spin' aria-hidden /> : <RefreshCw className='size-4' aria-hidden />}
            {t('providerPage.regions.syncNow')}
          </button>
        )}
      </div>
    </div>
  )
}
