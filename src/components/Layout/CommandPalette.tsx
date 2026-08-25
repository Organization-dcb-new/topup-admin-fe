import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { sidebarMenus, type SidebarMenu } from '@/constants/sidebar-menu'
import { filterMenusByPermission } from '@/lib/sidebar-access'
import { SIDEBAR_I18N_KEY_BY_TEXT } from '@/i18n/sidebar-label-keys'
import { usePermission } from '@/hooks/usePermission'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PaletteEntry {
  path: string
  label: string
  parentLabel?: string
  icon: SidebarMenu['icon']
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { can } = usePermission()

  const tr = (original: string) => {
    const key = SIDEBAR_I18N_KEY_BY_TEXT[original]
    return key ? t(key) : original
  }

  // Hanya menu yang lolos izin role — sumbernya sama dengan sidebar
  const groups = useMemo(() => {
    return filterMenusByPermission(sidebarMenus, can).map((section) => {
      const entries: PaletteEntry[] = []
      for (const menu of section.menus) {
        if (menu.path) {
          entries.push({ path: menu.path, label: menu.label, icon: menu.icon })
        }
        for (const child of menu.children ?? []) {
          if (!child.path) continue
          entries.push({
            path: child.path,
            label: child.label,
            parentLabel: menu.label,
            icon: child.icon,
          })
        }
      }
      return { title: section.title, entries }
    })
  }, [can])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('commandPalette.title')}
      description={t('commandPalette.description')}
    >
      <CommandInput placeholder={t('commandPalette.placeholder')} />
      <CommandList>
        <CommandEmpty>{t('commandPalette.empty')}</CommandEmpty>
        {groups.map((group, idx) => (
          <CommandGroup
            key={group.title ?? idx}
            heading={group.title ? tr(group.title) : t('commandPalette.navigation')}
          >
            {group.entries.map((entry) => (
              <CommandItem
                key={entry.path}
                // Nilai pencarian mencakup label induk supaya "transaksi cashflow" ketemu
                value={`${entry.parentLabel ? tr(entry.parentLabel) + ' ' : ''}${tr(entry.label)} ${entry.path}`}
                onSelect={() => {
                  onOpenChange(false)
                  navigate(entry.path)
                }}
              >
                <entry.icon className='text-muted-foreground' aria-hidden />
                <span>{tr(entry.label)}</span>
                {entry.parentLabel && (
                  <span className='ml-auto text-xs text-muted-foreground'>
                    {tr(entry.parentLabel)}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
