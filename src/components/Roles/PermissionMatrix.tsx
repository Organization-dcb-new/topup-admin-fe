import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { Check, Minus, Search } from 'lucide-react'

import { hudInputClass, hudInputIconClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { PermissionGroup } from '@/types/role'

interface PermissionMatrixProps {
  groups: PermissionGroup[]
  selected: ReadonlySet<string>
  onChange: (next: Set<string>) => void
  readOnly: boolean
}

const smallButtonClass =
  'inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:border-brand-purple/40 hover:text-brand-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/30'

/** Resources down the side, actions inside, as the backend groups its catalog. */
export function PermissionMatrix({ groups, selected, onChange, readOnly }: PermissionMatrixProps) {
  const { t } = useTranslation()
  const searchId = useId()
  const [query, setQuery] = useState('')

  const resourceLabel = (resource: string) =>
    t(`rolesPage.resources.${resource}`, { defaultValue: resource.replace(/_/g, ' ') })
  // i18next treats "." as a key separator, so "2fa.manage" is looked up as "2fa_manage".
  const actionLabel = (action: string) =>
    t(`rolesPage.actions.${action.replace(/\./g, '_')}`, { defaultValue: action.replace(/[_.]/g, ' ') })

  const allCodes = groups.flatMap((group) => group.permissions.map((p) => p.code))
  const needle = query.trim().toLowerCase()
  const visibleGroups = needle
    ? groups
        .map((group) => ({
          ...group,
          permissions: group.permissions.filter((p) =>
            [resourceLabel(group.resource), actionLabel(p.action), p.code, p.description].some((text) =>
              text.toLowerCase().includes(needle)
            )
          ),
        }))
        .filter((group) => group.permissions.length > 0)
    : groups

  const setCodes = (codes: string[], on: boolean) => {
    const next = new Set(selected)
    for (const code of codes) {
      if (on) next.add(code)
      else next.delete(code)
    }
    onChange(next)
  }

  return (
    <section className='space-y-4'>
      <div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
        <div className='space-y-1'>
          <p className={hudLabelClass}>{t('rolesPage.permissionsTitle')}</p>
          <p className='text-sm text-slate-500'>
            {t('rolesPage.selectedCount', { count: selected.size, total: allCodes.length })}
          </p>
        </div>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <div className='group relative'>
            <label htmlFor={searchId} className='sr-only'>
              {t('rolesPage.searchPermissions')}
            </label>
            <span className={hudInputIconClass}>
              <Search className='size-4' aria-hidden />
            </span>
            <Input
              id={searchId}
              type='search'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('rolesPage.searchPermissions')}
              className={cn(hudInputClass, 'h-10 pl-11 sm:w-64')}
            />
          </div>
          {!readOnly && (
            <div className='flex gap-2'>
              <button type='button' onClick={() => setCodes(allCodes, true)} className={smallButtonClass}>
                {t('rolesPage.selectAll')}
              </button>
              <button type='button' onClick={() => setCodes(allCodes, false)} className={smallButtonClass}>
                {t('rolesPage.clearAll')}
              </button>
            </div>
          )}
        </div>
      </div>

      {visibleGroups.length === 0 ? (
        <p className='rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500'>
          {t('rolesPage.noMatch')}
        </p>
      ) : (
        <div className='grid gap-3 md:grid-cols-2'>
          {visibleGroups.map((group) => {
            const codes = group.permissions.map((p) => p.code)
            const granted = codes.filter((code) => selected.has(code)).length
            const groupState = granted === 0 ? false : granted === codes.length ? true : 'indeterminate'
            const label = resourceLabel(group.resource)

            return (
              <div
                key={group.resource}
                className={cn(
                  'overflow-hidden rounded-lg border bg-white transition-colors duration-300',
                  granted > 0 ? 'border-brand-purple/30' : 'border-slate-200'
                )}
              >
                <div className='flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5'>
                  <MatrixCheckbox
                    checked={groupState}
                    disabled={readOnly}
                    onChange={() => setCodes(codes, groupState !== true)}
                    label={t('rolesPage.toggleGroup', { group: label })}
                  />
                  <span className='flex-1 font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-700'>
                    {label}
                  </span>
                  <span
                    className={cn(
                      'font-display text-xs font-semibold tabular-nums',
                      granted > 0 ? 'text-brand-purple' : 'text-slate-400'
                    )}
                  >
                    {granted}/{codes.length}
                  </span>
                </div>
                <ul className='divide-y divide-slate-100'>
                  {group.permissions.map((permission) => (
                    <li key={permission.code}>
                      <label
                        title={permission.description}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 transition-colors',
                          readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50'
                        )}
                      >
                        <MatrixCheckbox
                          checked={selected.has(permission.code)}
                          disabled={readOnly}
                          onChange={(on) => setCodes([permission.code], on)}
                        />
                        <span className='flex-1 text-sm text-slate-700'>{actionLabel(permission.action)}</span>
                        <code className='hidden font-mono text-[11px] text-slate-400 sm:inline'>
                          {permission.code}
                        </code>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

interface MatrixCheckboxProps {
  checked: boolean | 'indeterminate'
  disabled: boolean
  onChange: (checked: boolean) => void
  label?: string
}

/** Radix checkbox with a dash for a partly granted group, which the shared Checkbox can't show. */
function MatrixCheckbox({ checked, disabled, onChange, label }: MatrixCheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      disabled={disabled}
      onCheckedChange={(value) => onChange(value === true)}
      aria-label={label}
      className='grid size-4 shrink-0 place-items-center rounded-[4px] border border-slate-300 bg-white text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-purple/30 disabled:cursor-default disabled:opacity-60 data-[state=checked]:border-brand-purple data-[state=checked]:bg-brand-purple data-[state=indeterminate]:border-brand-purple data-[state=indeterminate]:bg-brand-purple'
    >
      <CheckboxPrimitive.Indicator>
        {checked === 'indeterminate' ? (
          <Minus className='size-3' strokeWidth={3} aria-hidden />
        ) : (
          <Check className='size-3' strokeWidth={3} aria-hidden />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
