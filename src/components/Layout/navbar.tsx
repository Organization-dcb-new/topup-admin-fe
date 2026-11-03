import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { useAuthUser } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { HealthStatusMenu } from './health-status-menu'
import { LanguageSwitch } from './language-switch'
import { findActivePath, findTrail, menusForRole, useSidebarCopy } from './sidebar-nav'
import { UserMenu } from './user-menu'

interface NavbarProps {
  onToggleSidebar: () => void
  toggleLabel: string
  sidebarExpanded: boolean
}

export function Navbar({ onToggleSidebar, toggleLabel, sidebarExpanded }: NavbarProps) {
  const ToggleIcon = sidebarExpanded ? PanelLeftClose : PanelLeftOpen

  return (
    <header className='sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-md md:px-6'>
      <button
        type='button'
        onClick={onToggleSidebar}
        aria-label={toggleLabel}
        title={toggleLabel}
        className='grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'
      >
        <ToggleIcon
          key={sidebarExpanded ? 'close' : 'open'}
          className='size-5 animate-in fade-in zoom-in-75 duration-200'
          aria-hidden
        />
      </button>
      <span className='h-6 w-px shrink-0 bg-slate-200' aria-hidden />

      <Breadcrumbs />

      <div className='ml-auto flex shrink-0 items-center gap-2'>
        <HealthStatusMenu />
        <LanguageSwitch />
        <UserMenu />
      </div>
    </header>
  )
}

/** Built from the sidebar menu, so it always matches the item that is highlighted there. */
function Breadcrumbs() {
  const { t } = useTranslation('common')
  const tr = useSidebarCopy()
  const { pathname } = useLocation()
  const { role } = useAuthUser()
  const sections = useMemo(() => menusForRole(role), [role])
  const activePath = findActivePath(sections, pathname)
  const trail = activePath ? findTrail(sections, activePath) : undefined
  if (!activePath || !trail) return <div className='min-w-0 flex-1' />

  const isDetail = pathname !== activePath
  const crumbs: { label: string; to?: string }[] = []
  if (trail.group) crumbs.push({ label: tr(trail.group.label) })
  crumbs.push({ label: tr(trail.item.label), to: isDetail ? activePath : undefined })
  if (isDetail) crumbs.push({ label: t('navbar.detail') })

  return (
    <nav aria-label={t('navbar.breadcrumb')} className='min-w-0 flex-1'>
      <ol
        key={pathname}
        className='flex min-w-0 items-center gap-1.5 text-sm animate-in fade-in slide-in-from-left-1 duration-300 ease-hud'
      >
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1
          return (
            <li
              key={crumb.label}
              className={cn('min-w-0 items-center gap-1.5', last ? 'flex' : 'hidden sm:flex')}
            >
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className='truncate text-slate-500 transition-colors hover:text-slate-900'
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? 'page' : undefined}
                  className={cn('truncate', last ? 'font-semibold text-slate-900' : 'text-slate-500')}
                >
                  {crumb.label}
                </span>
              )}
              {!last && <ChevronRight className='size-3.5 shrink-0 text-slate-300' aria-hidden />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
