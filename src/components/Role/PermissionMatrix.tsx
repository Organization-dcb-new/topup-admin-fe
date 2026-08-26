import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Search } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { usePermissionLabels } from '@/hooks/usePermissionLabels'
import type { Permission, PermissionGroup } from '@/types/permission'

interface PermissionMatrixProps {
  groups: PermissionGroup[]
  selected: string[]
  onChange: (codes: string[]) => void
  isLoading?: boolean
  disabled?: boolean
}

/**
 * Urutan CRUD yang dibaca manusia. Tiap aksi menempati slot tetap sehingga
 * kolomnya sejajar antar baris; resource yang tidak punya aksi tertentu
 * menyisakan slot kosong alih-alih menggeser aksi lain.
 */
const STANDARD_ACTIONS = ['view', 'create', 'update', 'delete'] as const

function splitActions(permissions: Permission[]) {
  const byAction = new Map(permissions.map((p) => [p.action, p]))
  const standard = STANDARD_ACTIONS.map((action) => byAction.get(action) ?? null)
  const extra = permissions.filter(
    (p) => !STANDARD_ACTIONS.includes(p.action as (typeof STANDARD_ACTIONS)[number]),
  )
  return { standard, extra }
}

function PermissionToggle({
  permission,
  checked,
  disabled,
  label,
  onToggle,
}: {
  permission: Permission
  checked: boolean
  disabled?: boolean
  label: string
  onToggle: (next: boolean) => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <label
          className={cn(
            'flex min-w-0 cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm transition-colors duration-200 hover:bg-muted',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        >
          <Checkbox
            checked={checked}
            disabled={disabled}
            onCheckedChange={(value) => onToggle(value === true)}
            aria-label={label}
          />
          <span className='min-w-0 truncate text-muted-foreground'>
            {label}
          </span>
        </label>
      </TooltipTrigger>
      {/* Kode mentah dipindah ke tooltip komponen; `title` bawaan browser
          muncul lambat dan tampilannya di luar kendali */}
      <TooltipContent side='top' className='font-mono'>
        {permission.code}
      </TooltipContent>
    </Tooltip>
  )
}

export const PermissionMatrix = ({
  groups,
  selected,
  onChange,
  isLoading,
  disabled,
}: PermissionMatrixProps) => {
  const { t } = useTranslation('common')
  const { resourceLabel, actionLabel } = usePermissionLabels()
  const [query, setQuery] = useState('')
  const searchId = useId()

  const selectedSet = useMemo(() => new Set(selected), [selected])

  const visibleGroups = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return groups
    return groups.filter(
      (group) =>
        resourceLabel(group.resource).toLowerCase().includes(term) ||
        group.resource.toLowerCase().includes(term) ||
        group.permissions.some((p) => p.code.toLowerCase().includes(term)),
    )
  }, [groups, query, resourceLabel])

  /** Aksi massal mengikuti apa yang sedang terlihat: memfilter lalu menekan
   *  "pilih semua" seharusnya tidak diam-diam mengubah resource lain. */
  const visibleCodes = useMemo(
    () => visibleGroups.flatMap((g) => g.permissions.map((p) => p.code)),
    [visibleGroups],
  )

  const toggle = (code: string, next: boolean) => {
    const draft = new Set(selectedSet)
    if (next) draft.add(code)
    else draft.delete(code)
    onChange([...draft])
  }

  const toggleGroup = (group: PermissionGroup, next: boolean) => {
    const draft = new Set(selectedSet)
    for (const p of group.permissions) {
      if (next) draft.add(p.code)
      else draft.delete(p.code)
    }
    onChange([...draft])
  }

  const setBulk = (next: boolean) => {
    const draft = new Set(selectedSet)
    for (const code of visibleCodes) {
      if (next) draft.add(code)
      else draft.delete(code)
    }
    onChange([...draft])
  }

  if (isLoading) {
    return (
      <div
        className='flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20'
        role='status'
        aria-live='polite'
        aria-busy='true'
      >
        <Loader2 className='h-8 w-8 animate-spin text-primary' aria-hidden />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className='space-y-3'>
        <div className='sticky top-0 z-10 -mx-6 space-y-2.5 bg-background px-6 pb-3'>
          <div className='relative'>
            <Search
              className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground'
              aria-hidden
            />
            <Input
              id={searchId}
              type='search'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={disabled}
              placeholder={t('rolePage.searchPermission')}
              aria-label={t('rolePage.searchPermission')}
              className='h-9 pl-9'
            />
          </div>

          <div className='flex flex-wrap items-center justify-between gap-2'>
            <p className='text-xs text-muted-foreground'>
              {t('rolePage.selectedCount', { count: selectedSet.size })}
              {query.trim() && (
                <span className='ml-2'>
                  {t('rolePage.filteredCount', {
                    shown: visibleGroups.length,
                    total: groups.length,
                  })}
                </span>
              )}
            </p>
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={disabled || visibleCodes.length === 0}
                onClick={() => setBulk(true)}
              >
                {t('rolePage.selectAll')}
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={disabled || visibleCodes.length === 0}
                onClick={() => setBulk(false)}
              >
                {t('rolePage.clearAll')}
              </Button>
            </div>
          </div>
        </div>

        {visibleGroups.length === 0 ? (
          <p className='rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground'>
            {t('rolePage.noPermissionMatch')}
          </p>
        ) : (
          /* Satu daftar dengan pemisah baris, bukan tumpukan kartu berbingkai */
          <div className='divide-y divide-border overflow-hidden rounded-lg border border-border'>
            {visibleGroups.map((group) => {
              const codes = group.permissions.map((p) => p.code)
              const checkedCount = codes.filter((c) => selectedSet.has(c)).length
              const all = checkedCount === codes.length && codes.length > 0
              const some = checkedCount > 0 && !all
              const { standard, extra } = splitActions(group.permissions)

              return (
                <fieldset
                  key={group.resource}
                  className={cn(
                    'flex flex-col gap-2 px-3 py-2.5 transition-colors duration-200 sm:flex-row sm:items-center sm:gap-4',
                    checkedCount > 0 ? 'bg-primary/3' : 'bg-background',
                  )}
                >
                  <legend className='sr-only'>
                    {resourceLabel(group.resource)}
                  </legend>

                  <label className='flex min-w-0 cursor-pointer items-center gap-2 sm:w-48 sm:shrink-0'>
                    <Checkbox
                      checked={all ? true : some ? 'indeterminate' : false}
                      disabled={disabled}
                      onCheckedChange={() => toggleGroup(group, !all)}
                      aria-label={resourceLabel(group.resource)}
                    />
                    <span className='min-w-0 truncate text-sm font-medium text-foreground'>
                      {resourceLabel(group.resource)}
                    </span>
                    <span
                      className={cn(
                        'ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
                        all
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {checkedCount}/{codes.length}
                    </span>
                  </label>

                  <div className='min-w-0 flex-1 space-y-1'>
                    <div className='grid grid-cols-2 gap-x-2 sm:grid-cols-4'>
                      {standard.map((permission, index) =>
                        permission ? (
                          <PermissionToggle
                            key={permission.code}
                            permission={permission}
                            checked={selectedSet.has(permission.code)}
                            disabled={disabled}
                            label={actionLabel(permission.action)}
                            onToggle={(next) => toggle(permission.code, next)}
                          />
                        ) : (
                          // Slot kosong menjaga kolom tetap sejajar antar baris
                          <span
                            key={STANDARD_ACTIONS[index]}
                            className='hidden sm:block'
                            aria-hidden
                          />
                        ),
                      )}
                    </div>

                    {extra.length > 0 && (
                      <div className='flex flex-wrap gap-x-2'>
                        {extra.map((permission) => (
                          <PermissionToggle
                            key={permission.code}
                            permission={permission}
                            checked={selectedSet.has(permission.code)}
                            disabled={disabled}
                            label={actionLabel(permission.action)}
                            onToggle={(next) => toggle(permission.code, next)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </fieldset>
              )
            })}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
