import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useGetAdminBrief } from '@/hooks/useAdmin'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  value: string
  onChange: (userId: string) => void
}

export function AdminBriefSelect({ value, onChange }: Props) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const { data: admins, isLoading, isError } = useGetAdminBrief()

  const selectedName = value ? admins?.find((a) => a.id === value)?.name : undefined

  return (
    <div className='grid min-w-0 w-full gap-1.5'>
      <Label htmlFor='admin-brief-trigger' className='text-xs text-muted-foreground'>
        {t('gameFilters.updatedByLabel')}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id='admin-brief-trigger'
            type='button'
            variant='outline'
            role='combobox'
            aria-expanded={open}
            disabled={isLoading || isError}
            className='h-9 w-full min-w-0 justify-between px-3 font-normal shadow-sm'
          >
            <span className='truncate text-left'>
              {isLoading
                ? t('gameFilters.loadingAdminsBrief')
                : (selectedName ?? t('gameFilters.updatedByAll'))}
            </span>
            {isLoading ? (
              <Loader2 className='h-3.5 w-3.5 shrink-0 animate-spin opacity-50' aria-hidden />
            ) : (
              <ChevronsUpDown className='h-3.5 w-3.5 shrink-0 opacity-50' aria-hidden />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-[var(--radix-popover-trigger-width)] min-w-[min(100%,18rem)] p-0'
          align='start'
        >
          <Command>
            <CommandInput placeholder={t('gameFilters.searchAdminPlaceholder')} />
            <CommandList>
              <CommandEmpty>{t('gameFilters.emptyAdminsBrief')}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value='all admins'
                  keywords={['all', 'semua']}
                  onSelect={() => {
                    onChange('')
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4 shrink-0', !value ? 'opacity-100' : 'opacity-0')}
                    aria-hidden
                  />
                  {t('gameFilters.updatedByAll')}
                </CommandItem>
                {admins?.map((a) => (
                  <CommandItem
                    key={a.id}
                    value={`${a.name} ${a.id}`}
                    keywords={[a.id, a.name]}
                    onSelect={() => {
                      onChange(a.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 shrink-0',
                        value === a.id ? 'opacity-100' : 'opacity-0',
                      )}
                      aria-hidden
                    />
                    <span className='truncate'>{a.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {isError && (
        <p className='text-xs text-destructive'>{t('gameFilters.loadAdminsBriefError')}</p>
      )}
    </div>
  )
}
