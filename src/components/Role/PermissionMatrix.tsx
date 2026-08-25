import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePermissionLabels } from '@/hooks/usePermissionLabels'
import type { PermissionGroup } from '@/types/permission'

interface PermissionMatrixProps {
  groups: PermissionGroup[]
  selected: string[]
  onChange: (codes: string[]) => void
  isLoading?: boolean
  disabled?: boolean
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

  const selectedSet = useMemo(() => new Set(selected), [selected])
  const allCodes = useMemo(
    () => groups.flatMap((g) => g.permissions.map((p) => p.code)),
    [groups],
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

  if (isLoading) {
    return (
      <div
        className='flex min-h-[12rem] items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/20'
        role='status'
        aria-live='polite'
        aria-busy='true'
      >
        <Loader2 className='h-8 w-8 animate-spin text-primary' aria-hidden />
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      <div className='sticky top-0 z-10 -mx-6 flex flex-wrap items-center justify-between gap-2 bg-background px-6 pb-2'>
        <p className='text-xs text-muted-foreground'>
          {t('rolePage.selectedCount', { count: selectedSet.size })}
        </p>
        <div className='flex gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={disabled}
            onClick={() => onChange(allCodes)}
          >
            {t('rolePage.selectAll')}
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={disabled}
            onClick={() => onChange([])}
          >
            {t('rolePage.clearAll')}
          </Button>
        </div>
      </div>

      <div className='space-y-2 rounded-lg border border-border/80 bg-muted/10 p-3'>
        {groups.map((group) => {
          const codes = group.permissions.map((p) => p.code)
          const checkedCount = codes.filter((c) => selectedSet.has(c)).length
          const all = checkedCount === codes.length && codes.length > 0
          const some = checkedCount > 0 && !all

          return (
            <fieldset
              key={group.resource}
              className='rounded-lg border border-border/70 bg-background p-3'
            >
              <legend className='sr-only'>{resourceLabel(group.resource)}</legend>

              <label className='flex cursor-pointer items-center gap-2'>
                <Checkbox
                  checked={all ? true : some ? 'indeterminate' : false}
                  disabled={disabled}
                  onCheckedChange={() => toggleGroup(group, !all)}
                  aria-label={resourceLabel(group.resource)}
                />
                <span className='text-sm font-semibold text-foreground'>
                  {resourceLabel(group.resource)}
                </span>
                <span className='text-xs tabular-nums text-muted-foreground'>
                  {checkedCount}/{codes.length}
                </span>
              </label>

              <div className='mt-2 grid gap-1.5 pl-6 sm:grid-cols-2 lg:grid-cols-3'>
                {group.permissions.map((permission) => (
                  <label
                    key={permission.code}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted/60',
                      disabled && 'cursor-not-allowed opacity-60',
                    )}
                    title={permission.code}
                  >
                    <Checkbox
                      checked={selectedSet.has(permission.code)}
                      disabled={disabled}
                      onCheckedChange={(value) => toggle(permission.code, value === true)}
                      aria-label={`${resourceLabel(group.resource)} — ${actionLabel(permission.action)}`}
                    />
                    <span className='truncate text-muted-foreground'>
                      {actionLabel(permission.action)}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )
        })}
      </div>
    </div>
  )
}
